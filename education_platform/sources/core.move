module education_platform::core {
    use std::string::String;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    
    // ========= ERROR CODES =========
    const EInsufficientEP: u64 = 1;
    const EInsufficientSUI: u64 = 2;
    const EInvalidPrice: u64 = 3;
    const ENotCourseOwner: u64 = 4;
    const EAlreadyEnrolled: u64 = 5;
    const ECourseNotFound: u64 = 6;
    
    // ========= CONSTANTS =========
    const EP_BUY_RATE: u64 = 5; // 5 EP per 1 SUI
    const EP_SELL_RATE: u64 = 10; // 10 EP per 1 SUI
    const MIST_PER_SUI: u64 = 1_000_000_000;
    
    // ========= STRUCTS =========
    
    /// Education Point Token - One Time Witness
    public struct CORE has drop {}
    
    /// Platform registry - shared object
    public struct Platform has key {
        id: UID,
        treasury: TreasuryCap<CORE>,
        sui_reserve: Balance<SUI>,
        total_courses: u64,
        total_students: u64,
    }
    
    /// User profile
    public struct UserProfile has key, store {
        id: UID,
        owner: address,
        ep_balance: Balance<CORE>,
        courses_taught: vector<ID>,
        courses_enrolled: vector<ID>,
        reputation_score: u64,
        created_at: u64,
    }
    
    /// Course structure
    public struct Course has key, store {
        id: UID,
        instructor: address,
        title: String,
        description: String,
        content_url: String, // Walrus blob ID
        duration_hours: u64,
        ep_price: u64,
        enrolled_students: Table<address, bool>,
        total_enrolled: u64,
        rating_sum: u64,
        rating_count: u64,
        created_at: u64,
    }
    
    /// Course completion certificate NFT
    public struct Certificate has key, store {
        id: UID,
        course_id: ID,
        student: address,
        instructor: address,
        course_title: String,
        completion_date: u64,
        final_rating: u64,
    }
    
    /// Content NFT (Blog/Document) - Non-transferable
    public struct ContentNFT has key {
        id: UID,
        creator: address,
        title: String,
        content_type: String, // "blog", "document", "video"
        content_url: String, // Walrus blob ID
        thumbnail_url: String,
        metadata: String, // JSON formatted additional info
        created_at: u64,
    }
    
    // ========= EVENTS =========
    
    public struct EPPurchased has copy, drop {
        buyer: address,
        sui_amount: u64,
        ep_amount: u64,
        timestamp: u64,
    }
    
    public struct EPSold has copy, drop {
        seller: address,
        ep_amount: u64,
        sui_amount: u64,
        timestamp: u64,
    }
    
    public struct CourseCreated has copy, drop {
        course_id: ID,
        instructor: address,
        title: String,
        ep_price: u64,
        timestamp: u64,
    }
    
    public struct CourseEnrolled has copy, drop {
        course_id: ID,
        student: address,
        ep_paid: u64,
        timestamp: u64,
    }
    
    public struct CertificateIssued has copy, drop {
        certificate_id: ID,
        course_id: ID,
        student: address,
        timestamp: u64,
    }
    
    public struct ContentPublished has copy, drop {
        content_id: ID,
        creator: address,
        title: String,
        content_type: String,
        timestamp: u64,
    }
    
    // ========= INIT FUNCTION =========
    
    #[allow(deprecated_usage)]
    fun init(witness: CORE, ctx: &mut TxContext) {
        // Create Education Point token
        let (treasury, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"EP",
            b"Education Point",
            b"Platform currency for educational content exchange",
            option::none(),
            ctx
        );
        
        transfer::public_freeze_object(metadata);
        
        // Create platform registry
        let platform = Platform {
            id: object::new(ctx),
            treasury,
            sui_reserve: balance::zero(),
            total_courses: 0,
            total_students: 0,
        };
        
        transfer::share_object(platform);
    }
    
    // ========= USER PROFILE FUNCTIONS =========
    
    /// Create user profile
    public fun create_profile(ctx: &mut TxContext) {
        let profile = UserProfile {
            id: object::new(ctx),
            owner: ctx.sender(),
            ep_balance: balance::zero(),
            courses_taught: vector::empty(),
            courses_enrolled: vector::empty(),
            reputation_score: 0,
            created_at: ctx.epoch_timestamp_ms(),
        };
        
        transfer::transfer(profile, ctx.sender());
    }
    
    // ========= EP TOKEN FUNCTIONS =========
    
    /// Buy Education Points with SUI
    public fun buy_ep(
        platform: &mut Platform,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sui_amount = coin::value(&payment);
        assert!(sui_amount > 0, EInsufficientSUI);
        
        // Calculate EP amount (5 EP per 1 SUI)
        let ep_amount = (sui_amount * EP_BUY_RATE) / MIST_PER_SUI;
        
        // Add SUI to platform reserve
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut platform.sui_reserve, payment_balance);
        
        // Mint EP tokens
        let ep_coin = coin::mint(&mut platform.treasury, ep_amount, ctx);
        
        // Emit event
        event::emit(EPPurchased {
            buyer: ctx.sender(),
            sui_amount,
            ep_amount,
            timestamp: ctx.epoch_timestamp_ms(),
        });
        
        transfer::public_transfer(ep_coin, ctx.sender());
    }
    
    /// Sell Education Points for SUI
    public fun sell_ep(
        platform: &mut Platform,
        ep_payment: Coin<CORE>,
        ctx: &mut TxContext
    ) {
        let ep_amount = coin::value(&ep_payment);
        assert!(ep_amount > 0, EInsufficientEP);
        
        // Calculate SUI amount (10 EP per 1 SUI)
        let sui_amount = (ep_amount * MIST_PER_SUI) / EP_SELL_RATE;
        
        // Check platform has enough SUI
        assert!(balance::value(&platform.sui_reserve) >= sui_amount, EInsufficientSUI);
        
        // Burn EP tokens
        coin::burn(&mut platform.treasury, ep_payment);
        
        // Transfer SUI to seller
        let sui_coin = coin::take(&mut platform.sui_reserve, sui_amount, ctx);
        
        // Emit event
        event::emit(EPSold {
            seller: ctx.sender(),
            ep_amount,
            sui_amount,
            timestamp: ctx.epoch_timestamp_ms(),
        });
        
        transfer::public_transfer(sui_coin, ctx.sender());
    }
    
    /// Deposit EP to user profile
    public fun deposit_ep_to_profile(
        profile: &mut UserProfile,
        ep_coin: Coin<CORE>,
    ) {
        let ep_balance = coin::into_balance(ep_coin);
        balance::join(&mut profile.ep_balance, ep_balance);
    }
    
    // ========= COURSE FUNCTIONS =========
    
    /// Create a new course
    public fun create_course(
        platform: &mut Platform,
        profile: &mut UserProfile,
        title: String,
        description: String,
        content_url: String,
        duration_hours: u64,
        ep_price: u64,
        ctx: &mut TxContext
    ) {
        assert!(ep_price > 0, EInvalidPrice);
        
        let course_id = object::new(ctx);
        let course_id_inner = object::uid_to_inner(&course_id);
        
        let course = Course {
            id: course_id,
            instructor: ctx.sender(),
            title,
            description,
            content_url,
            duration_hours,
            ep_price,
            enrolled_students: table::new(ctx),
            total_enrolled: 0,
            rating_sum: 0,
            rating_count: 0,
            created_at: ctx.epoch_timestamp_ms(),
        };
        
        // Add to instructor's courses
        vector::push_back(&mut profile.courses_taught, course_id_inner);
        
        // Update platform stats
        platform.total_courses = platform.total_courses + 1;
        
        // Emit event
        event::emit(CourseCreated {
            course_id: course_id_inner,
            instructor: ctx.sender(),
            title: course.title,
            ep_price,
            timestamp: ctx.epoch_timestamp_ms(),
        });
        
        transfer::share_object(course);
    }
    
    /// Enroll in a course - using EP coins directly
    public fun enroll_in_course_with_coin(
        platform: &mut Platform,
        course: &mut Course,
        profile: &mut UserProfile,
        instructor_profile: &mut UserProfile,
        payment: Coin<CORE>,
        ctx: &mut TxContext
    ) {
        let student = ctx.sender();
        
        // Check not already enrolled
        assert!(!table::contains(&course.enrolled_students, student), EAlreadyEnrolled);
        
        // Check payment amount
        assert!(coin::value(&payment) >= course.ep_price, EInsufficientEP);
        
        // If overpaid, split and return change
        let payment_amount = coin::value(&payment);
        let ep_coin = if (payment_amount > course.ep_price) {
            let mut payment_balance = coin::into_balance(payment);
            let course_payment = balance::split(&mut payment_balance, course.ep_price);
            
            // Return change to student
            let change = coin::from_balance(payment_balance, ctx);
            transfer::public_transfer(change, student);
            
            coin::from_balance(course_payment, ctx)
        } else {
            payment
        };
        
        // Transfer EP to instructor profile
        let payment_balance = coin::into_balance(ep_coin);
        balance::join(&mut instructor_profile.ep_balance, payment_balance);
        
        // Add student to course
        table::add(&mut course.enrolled_students, student, true);
        course.total_enrolled = course.total_enrolled + 1;
        
        // Add course to student's enrolled courses
        vector::push_back(&mut profile.courses_enrolled, object::id(course));
        
        // Update platform stats
        platform.total_students = platform.total_students + 1;
        
        // Update instructor reputation
        instructor_profile.reputation_score = instructor_profile.reputation_score + 1;
        
        // Emit event
        event::emit(CourseEnrolled {
            course_id: object::id(course),
            student,
            ep_paid: course.ep_price,
            timestamp: ctx.epoch_timestamp_ms(),
        });
    }
    
    /// Enroll in a course - using profile balance
    public fun enroll_in_course(
        platform: &mut Platform,
        course: &mut Course,
        profile: &mut UserProfile,
        instructor_profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        let student = ctx.sender();
        
        // Check not already enrolled
        assert!(!table::contains(&course.enrolled_students, student), EAlreadyEnrolled);
        
        // Check sufficient EP balance
        assert!(balance::value(&profile.ep_balance) >= course.ep_price, EInsufficientEP);
        
        // Transfer EP from student to instructor
        let payment = balance::split(&mut profile.ep_balance, course.ep_price);
        balance::join(&mut instructor_profile.ep_balance, payment);
        
        // Add student to course
        table::add(&mut course.enrolled_students, student, true);
        course.total_enrolled = course.total_enrolled + 1;
        
        // Add course to student's enrolled courses
        vector::push_back(&mut profile.courses_enrolled, object::id(course));
        
        // Update platform stats
        platform.total_students = platform.total_students + 1;
        
        // Update instructor reputation
        instructor_profile.reputation_score = instructor_profile.reputation_score + 1;
        
        // Emit event
        event::emit(CourseEnrolled {
            course_id: object::id(course),
            student,
            ep_paid: course.ep_price,
            timestamp: ctx.epoch_timestamp_ms(),
        });
    }
    
    /// Issue certificate upon course completion
    public fun issue_certificate(
        course: &Course,
        student: address,
        final_rating: u64,
        ctx: &mut TxContext
    ) {
        // Only instructor can issue certificates
        assert!(ctx.sender() == course.instructor, ENotCourseOwner);
        
        // Verify student is enrolled
        assert!(table::contains(&course.enrolled_students, student), ECourseNotFound);
        
        let certificate_id = object::new(ctx);
        let cert_id = object::uid_to_inner(&certificate_id);
        
        let certificate = Certificate {
            id: certificate_id,
            course_id: object::id(course),
            student,
            instructor: course.instructor,
            course_title: course.title,
            completion_date: ctx.epoch_timestamp_ms(),
            final_rating,
        };
        
        // Emit event
        event::emit(CertificateIssued {
            certificate_id: cert_id,
            course_id: object::id(course),
            student,
            timestamp: ctx.epoch_timestamp_ms(),
        });
        
        transfer::transfer(certificate, student);
    }
    
    // ========= CONTENT NFT FUNCTIONS =========
    
    /// Publish content as NFT (blog, document, etc.)
    public fun publish_content_nft(
        title: String,
        content_type: String,
        content_url: String,
        thumbnail_url: String,
        metadata: String,
        ctx: &mut TxContext
    ) {
        let content_id = object::new(ctx);
        let content_id_inner = object::uid_to_inner(&content_id);
        
        let content = ContentNFT {
            id: content_id,
            creator: ctx.sender(),
            title,
            content_type,
            content_url,
            thumbnail_url,
            metadata,
            created_at: ctx.epoch_timestamp_ms(),
        };
        
        // Emit event
        event::emit(ContentPublished {
            content_id: content_id_inner,
            creator: ctx.sender(),
            title: content.title,
            content_type: content.content_type,
            timestamp: ctx.epoch_timestamp_ms(),
        });
        
        // Transfer to creator - non-transferable by design
        transfer::transfer(content, ctx.sender());
    }
    
    // ========= GETTER FUNCTIONS =========
    
    #[test_only]
    public fun get_ep_balance(profile: &UserProfile): u64 {
        balance::value(&profile.ep_balance)
    }
    
    #[test_only]
    public fun get_course_price(course: &Course): u64 {
        course.ep_price
    }
    
    // Test-only init function
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let witness = CORE {};
        init(witness, ctx);
    }
}