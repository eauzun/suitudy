module education_platform::core {
    use std::string::String;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};

    // ========= CONSTANTS (AYARLAR) =========
    // 1 SUI (MIST) karşılığında kaç TEACH verilecek?
    // Örn: 1 SUI = 10 TEACH
    const EXCHANGE_RATE: u64 = 10; 

    // ========= ERROR CODES =========
    const EInsufficientSuiInReserve: u64 = 1;
    const EWrongPaymentAmount: u64 = 2;

    // ========= STRUCTS (OBJELER) =========

    // 1. TOKEN KİMLİĞİ (OTW)
    public struct CORE has drop {}

    // 2. MERKEZ BANKASI (Shared Object)
    // Para basma yetkisi (Treasury) ve SUI rezervi burada durur.
    public struct Platform has key {
        id: UID,
        treasury: TreasuryCap<CORE>,
        sui_reserve: Balance<SUI>
    }

    // 3. DERS İLANI (Shared Object)
    public struct Course has key, store {
        id: UID,
        instructor: address, // Hocanın cüzdan adresi
        title: String,       // Ders başlığı
        price: u64,          // Token cinsinden fiyat
        content_url: String, // İçerik linki (Youtube/Walrus)
        is_sold: bool        // Satıldı mı?
    }

    // ========= EVENTS (OLAYLAR) =========
    // Profil olmadığı için geçmişi bu eventleri okuyarak bulacağız.

    public struct CourseCreated has copy, drop {
        course_id: ID,
        instructor: address,
        title: String,
        price: u64
    }

    public struct CoursePurchased has copy, drop {
        course_id: ID,
        student: address,
        instructor: address,
        price: u64
    }

    // ========= INIT (BAŞLATMA) =========
    fun init(witness: CORE, ctx: &mut TxContext) {
        // 1. Token'ı oluştur
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"TEACH", 
            b"Teach Token", 
            b"Platform currency", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);

        // 2. Platform (Banka) objesini oluştur ve içine Treasury'i koy
        let platform = Platform {
            id: object::new(ctx),
            treasury,
            sui_reserve: balance::zero()
        };

        // 3. Platformu paylaşıma aç (Herkes erişsin)
        transfer::share_object(platform);
    }

    // ========= TOKEN EKONOMİSİ (MINT / BURN) =========

    /// 1. SUI VER -> TOKEN AL (Mint)
    public entry fun buy_token(
        platform: &mut Platform,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sui_value = coin::value(&payment);
        let token_amount = sui_value * EXCHANGE_RATE;

        // Gelen SUI'yi kasaya kilitle
        let paid_balance = coin::into_balance(payment);
        balance::join(&mut platform.sui_reserve, paid_balance);

        // Karşılığında yeni Token bas ve kullanıcıya ver
        let token_coin = coin::mint(&mut platform.treasury, token_amount, ctx);
        transfer::public_transfer(token_coin, ctx.sender());
    }

    /// 2. TOKEN VER -> SUI AL (Burn)
    public entry fun sell_token(
        platform: &mut Platform,
        payment: Coin<CORE>,
        ctx: &mut TxContext
    ) {
        let token_value = coin::value(&payment);
        let sui_amount = token_value / EXCHANGE_RATE;

        // Kasada yeterli SUI var mı?
        assert!(balance::value(&platform.sui_reserve) >= sui_amount, EInsufficientSuiInReserve);

        // Gelen Token'ı yak (Yok et)
        coin::burn(&mut platform.treasury, payment);

        // Karşılığında kasadan SUI çıkar ve kullanıcıya ver
        let sui_payment = balance::split(&mut platform.sui_reserve, sui_amount);
        let sui_coin = coin::from_balance(sui_payment, ctx);
        transfer::public_transfer(sui_coin, ctx.sender());
    }

    // ========= MARKETPLACE (DERS ALIM/SATIM) =========

    /// 3. DERS OLUŞTUR
    public entry fun create_course(
        title: String,
        price: u64,
        content_url: String,
        ctx: &mut TxContext
    ) {
        let course_uid = object::new(ctx);
        let course_id = object::uid_to_inner(&course_uid);
        let sender = ctx.sender();

        let course = Course {
            id: course_uid,
            instructor: sender,
            title: title,
            price: price,
            content_url: content_url,
            is_sold: false
        };

        // Event fırlat (Frontend listeyi buradan çekecek)
        event::emit(CourseCreated {
            course_id,
            instructor: sender,
            title: title, // Düzeltme: struct field'ından değil argümandan alıyoruz
            price
        });

        transfer::share_object(course);
    }

    /// 4. DERS SATIN AL (Direkt Transfer)
    public entry fun enroll_in_course(
        course: &mut Course,
        payment: Coin<CORE>, // TEACH Token ile ödeme
        ctx: &mut TxContext
    ) {
        // Fiyat Kontrolü
        assert!(coin::value(&payment) == course.price, EWrongAmount);

        // --- KRİTİK KISIM: PARAYI DİREKT HOCAYA YOLLA ---
        transfer::public_transfer(payment, course.instructor);

        // Dersi "Satıldı" olarak işaretle (İsteğe bağlı: silebilirsin de)
        course.is_sold = true;

        // Event fırlat (Frontend "Aldığım Dersler"i buradan bulacak)
        event::emit(CoursePurchased {
            course_id: object::id(course),
            student: ctx.sender(),
            instructor: course.instructor,
            price: course.price
        });
    }

    // ========= JÜRİ İÇİN FAUCET (MUSLUK) =========
    // Test ederken SUI harcamadan Token almak için
    public entry fun mint_for_testing(
        platform: &mut Platform,
        ctx: &mut TxContext
    ) {
        let token_coin = coin::mint(&mut platform.treasury, 100_000_000_000, ctx); // 100 Token
        transfer::public_transfer(token_coin, ctx.sender());
    }
}