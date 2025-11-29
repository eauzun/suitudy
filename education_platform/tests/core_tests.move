#[test_only]
module education_platform::core_tests {
    use education_platform::core::{Self, Platform, UserProfile, Course, CORE};
    use sui::test_scenario::{Self as ts, next_tx};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    // Test addresses
    const ADMIN: address = @0xAD;
    const INSTRUCTOR: address = @0x1;
    const STUDENT: address = @0x2;
    
    // Error codes
    const EInsufficientEP: u64 = 1;
    
    // Constants
    const ONE_SUI: u64 = 1_000_000_000;
    const COURSE_PRICE: u64 = 50; // 50 EP
    
    #[test]
    fun test_create_profile() {
        let mut scenario = ts::begin(STUDENT);
        
        // Create profile
        {
            core::create_profile(scenario.ctx());
        };
        
        next_tx(&mut scenario, STUDENT);
        
        // Verify profile exists
        {
            let profile = ts::take_from_sender<UserProfile>(&scenario);
            assert!(core::get_ep_balance(&profile) == 0, 0);
            ts::return_to_sender(&scenario, profile);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_buy_and_sell_ep() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize - creates Platform
        {
            core::init_for_testing(scenario.ctx());
        };
        
        next_tx(&mut scenario, STUDENT);
        
        // Buy EP with 1 SUI (should get 5 EP)
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let payment = coin::mint_for_testing<SUI>(ONE_SUI, scenario.ctx());
            
            core::buy_ep(&mut platform, payment, scenario.ctx());
            
            ts::return_shared(platform);
        };
        
        next_tx(&mut scenario, STUDENT);
        
        // Verify EP received
        {
            let ep_coin = ts::take_from_sender<Coin<CORE>>(&scenario);
            assert!(coin::value(&ep_coin) == 5, 0);
            ts::return_to_sender(&scenario, ep_coin);
        };
        
        next_tx(&mut scenario, STUDENT);
        
        // Sell 5 EP back (should get 0.5 SUI)
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let ep_coin = ts::take_from_sender<Coin<CORE>>(&scenario);
            
            core::sell_ep(&mut platform, ep_coin, scenario.ctx());
            
            ts::return_shared(platform);
        };
        
        next_tx(&mut scenario, STUDENT);
        
        // Verify SUI received (500,000,000 MIST = 0.5 SUI)
        {
            let sui_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&sui_coin) == 500_000_000, 0);
            ts::return_to_sender(&scenario, sui_coin);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_create_course() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            core::init_for_testing(scenario.ctx());
        };
        
        next_tx(&mut scenario, INSTRUCTOR);
        
        // Create instructor profile
        {
            core::create_profile(scenario.ctx());
        };
        
        next_tx(&mut scenario, INSTRUCTOR);
        
        // Create course
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            
            core::create_course(
                &mut platform,
                &mut profile,
                b"Introduction to Sui Move".to_string(),
                b"Learn the basics of Move programming on Sui".to_string(),
                b"walrus://blob123".to_string(),
                10, // 10 hours
                COURSE_PRICE,
                scenario.ctx()
            );
            
            ts::return_to_sender(&scenario, profile);
            ts::return_shared(platform);
        };
        
        next_tx(&mut scenario, INSTRUCTOR);
        
        // Verify course created
        {
            let course = ts::take_shared<Course>(&scenario);
            assert!(core::get_course_price(&course) == COURSE_PRICE, 0);
            ts::return_shared(course);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_enroll_in_course() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            core::init_for_testing(scenario.ctx());
        };
        
        // Create instructor profile
        next_tx(&mut scenario, INSTRUCTOR);
        {
            core::create_profile(scenario.ctx());
        };
        
        // Create course
        next_tx(&mut scenario, INSTRUCTOR);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            
            core::create_course(
                &mut platform,
                &mut profile,
                b"Sui Development".to_string(),
                b"Build dApps on Sui".to_string(),
                b"walrus://blob456".to_string(),
                20,
                COURSE_PRICE,
                scenario.ctx()
            );
            
            ts::return_to_sender(&scenario, profile);
            ts::return_shared(platform);
        };
        
        // Create student profile
        next_tx(&mut scenario, STUDENT);
        {
            core::create_profile(scenario.ctx());
        };
        
        // Buy EP for student (20 SUI = 100 EP)
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let payment = coin::mint_for_testing<SUI>(20 * ONE_SUI, scenario.ctx());
            
            core::buy_ep(&mut platform, payment, scenario.ctx());
            
            ts::return_shared(platform);
        };
        
        // Enroll in course with coin directly
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut course = ts::take_shared<Course>(&scenario);
            let mut student_profile = ts::take_from_sender<UserProfile>(&scenario);
            let mut instructor_profile = ts::take_from_address<UserProfile>(&scenario, INSTRUCTOR);
            let ep_coin = ts::take_from_sender<Coin<CORE>>(&scenario);
            
            let initial_instructor_balance = core::get_ep_balance(&instructor_profile);
            
            core::enroll_in_course_with_coin(
                &mut platform,
                &mut course,
                &mut student_profile,
                &mut instructor_profile,
                ep_coin,
                scenario.ctx()
            );
            
            // Verify instructor received EP
            let final_instructor_balance = core::get_ep_balance(&instructor_profile);
            assert!(final_instructor_balance - initial_instructor_balance == COURSE_PRICE, 0);
            
            ts::return_to_sender(&scenario, student_profile);
            ts::return_to_address(INSTRUCTOR, instructor_profile);
            ts::return_shared(course);
            ts::return_shared(platform);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_publish_content_nft() {
        let mut scenario = ts::begin(INSTRUCTOR);
        
        // Publish blog as NFT
        {
            core::publish_content_nft(
                b"Understanding Shared Objects in Sui".to_string(),
                b"blog".to_string(),
                b"walrus://blog789".to_string(),
                b"walrus://thumb789".to_string(),
                b"{\"tags\":[\"sui\",\"move\",\"tutorial\"]}".to_string(),
                scenario.ctx()
            );
        };
        
        next_tx(&mut scenario, INSTRUCTOR);
        
        // Verify NFT created (will be in sender's objects)
        // Note: ContentNFT is non-transferable, stays with creator
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 1)] // EInsufficientEP = 1
    fun test_enroll_insufficient_ep_should_fail() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            core::init_for_testing(scenario.ctx());
        };
        
        // Create instructor and course
        next_tx(&mut scenario, INSTRUCTOR);
        {
            core::create_profile(scenario.ctx());
        };
        
        next_tx(&mut scenario, INSTRUCTOR);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            
            core::create_course(
                &mut platform,
                &mut profile,
                b"Expensive Course".to_string(),
                b"Very expensive".to_string(),
                b"walrus://blob999".to_string(),
                5,
                100, // 100 EP price
                scenario.ctx()
            );
            
            ts::return_to_sender(&scenario, profile);
            ts::return_shared(platform);
        };
        
        // Create student profile (no EP)
        next_tx(&mut scenario, STUDENT);
        {
            core::create_profile(scenario.ctx());
        };
        
        // Buy only 50 EP (insufficient for 100 EP course)
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10 * ONE_SUI, scenario.ctx());
            
            core::buy_ep(&mut platform, payment, scenario.ctx());
            
            ts::return_shared(platform);
        };
        
        // Try to enroll with insufficient EP (should fail)
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut course = ts::take_shared<Course>(&scenario);
            let mut student_profile = ts::take_from_sender<UserProfile>(&scenario);
            let mut instructor_profile = ts::take_from_address<UserProfile>(&scenario, INSTRUCTOR);
            let ep_coin = ts::take_from_sender<Coin<CORE>>(&scenario);
            
            // This should panic with EInsufficientEP (abort_code = 1)
            core::enroll_in_course_with_coin(
                &mut platform,
                &mut course,
                &mut student_profile,
                &mut instructor_profile,
                ep_coin,
                scenario.ctx()
            );
            
            // Should never reach here
            ts::return_to_sender(&scenario, student_profile);
            ts::return_to_address(INSTRUCTOR, instructor_profile);
            ts::return_shared(course);
            ts::return_shared(platform);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_enroll_with_profile_balance() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        {
            core::init_for_testing(scenario.ctx());
        };
        
        // Create instructor profile
        next_tx(&mut scenario, INSTRUCTOR);
        {
            core::create_profile(scenario.ctx());
        };
        
        // Create course
        next_tx(&mut scenario, INSTRUCTOR);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            
            core::create_course(
                &mut platform,
                &mut profile,
                b"Profile Balance Course".to_string(),
                b"Test profile balance enrollment".to_string(),
                b"walrus://balance123".to_string(),
                15,
                COURSE_PRICE,
                scenario.ctx()
            );
            
            ts::return_to_sender(&scenario, profile);
            ts::return_shared(platform);
        };
        
        // Create student profile
        next_tx(&mut scenario, STUDENT);
        {
            core::create_profile(scenario.ctx());
        };
        
        // Buy EP for student
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let payment = coin::mint_for_testing<SUI>(20 * ONE_SUI, scenario.ctx());
            
            core::buy_ep(&mut platform, payment, scenario.ctx());
            
            ts::return_shared(platform);
        };
        
        // Deposit EP to profile
        next_tx(&mut scenario, STUDENT);
        {
            let mut profile = ts::take_from_sender<UserProfile>(&scenario);
            let ep_coin = ts::take_from_sender<Coin<CORE>>(&scenario);
            
            core::deposit_ep_to_profile(&mut profile, ep_coin);
            
            // Verify balance
            assert!(core::get_ep_balance(&profile) >= COURSE_PRICE, 996);
            
            ts::return_to_sender(&scenario, profile);
        };
        
        // Enroll using profile balance
        next_tx(&mut scenario, STUDENT);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut course = ts::take_shared<Course>(&scenario);
            let mut student_profile = ts::take_from_sender<UserProfile>(&scenario);
            let mut instructor_profile = ts::take_from_address<UserProfile>(&scenario, INSTRUCTOR);
            
            let initial_student_balance = core::get_ep_balance(&student_profile);
            let initial_instructor_balance = core::get_ep_balance(&instructor_profile);
            
            core::enroll_in_course(
                &mut platform,
                &mut course,
                &mut student_profile,
                &mut instructor_profile,
                scenario.ctx()
            );
            
            // Verify balances changed correctly
            let final_student_balance = core::get_ep_balance(&student_profile);
            let final_instructor_balance = core::get_ep_balance(&instructor_profile);
            
            assert!(initial_student_balance - final_student_balance == COURSE_PRICE, 995);
            assert!(final_instructor_balance - initial_instructor_balance == COURSE_PRICE, 994);
            
            ts::return_to_sender(&scenario, student_profile);
            ts::return_to_address(INSTRUCTOR, instructor_profile);
            ts::return_shared(course);
            ts::return_shared(platform);
        };
        
        ts::end(scenario);
    }
}