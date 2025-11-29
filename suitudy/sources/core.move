module education_platform::suitudy;

	// === Imports ===
    use std::string::String;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};

	public struct SUITUDY has drop {}

	public struct Bank has key {
		id: UID,
		treasury: TreasuryCap<SUITUDY>,
		sui_reserve: Balance<SUI>
	}

	public struct LecturePass has key {
        id: UID,
        lecture_id: ID,
        student: address,
        title: String
    }

	public struct Lecture has key {
		id: UID,
		title: String,
		description: String,
		image_url: String,
		content_url: String,
		price: u64,
		seller: address
	}

	public struct LectureListed has copy, drop {
		lecture_id: ID,
		instructor: address,
		title: String,
		price: u64,
		timestamp: u64
	}

	public struct LecturePurchased has copy, drop {
		lecture_id: ID,
		student: address,
		instructor: address,
		price: u64,
		timestamp: u64
	}

	public struct TokenPurchased has copy, drop {
		buyer: address,
		sui_spent: u64,
		tokens_received: u64,
		timestamp: u64
	}

	public struct TokenSold has copy, drop {
		seller: address,
		tokens_sold: u64,
		sui_received: u64,
		timestamp: u64
	}

	fun init(witness: SUITUDY, ctx: &mut TxContext) {
		// 1. Token'ı oluştur
		let (treasury, metadata) = coin::create_currency(
			witness, 
			9, 
			b"SUITDY", 
			b"Suidity Token", 
			b"Bank currency", 
			option::none(), 
			ctx
		);
		transfer::public_freeze_object(metadata);

		// 2. Platform (Banka) objesini oluştur ve içine Treasury'i koy
		let platform = Bank {
			id: object::new(ctx),
			treasury,
			sui_reserve: balance::zero()
		};

		// 3. Platformu paylaşıma aç (Herkes erişsin)
		transfer::share_object(platform);
	}

    /// 1. SUI VER -> TOKEN AL (Mint)
    public entry fun buy_token(
        platform: &mut Bank,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sui_value = coin::value(&payment);
        let token_amount = sui_value * 10; // Örnek: 1 SUI = 10 SUITDY

        // Gelen SUI'yi kasaya kilitle
        let paid_balance = coin::into_balance(payment);
        balance::join(&mut platform.sui_reserve, paid_balance);

        // Karşılığında yeni Token bas ve kullanıcıya ver
        let token_coin = coin::mint(&mut platform.treasury, token_amount, ctx);

		event::emit(TokenPurchased {
			buyer: ctx.sender(),
			sui_spent: sui_value,
			tokens_received: token_amount,
			timestamp: ctx.epoch_timestamp_ms()
    	});

        transfer::public_transfer(token_coin, ctx.sender());
    }

    /// 2. TOKEN VER -> SUI AL (Burn)
    public entry fun sell_token(
        platform: &mut Bank,
        payment: Coin<SUITUDY>,
        ctx: &mut TxContext
    ) {
        let token_value = coin::value(&payment);
        let sui_amount = token_value / 10; // Örnek: 10 SUITDY = 1 SUI

        // Kasada yeterli SUI var mı?
        assert!(balance::value(&platform.sui_reserve) >= sui_amount);

        // Gelen Token'ı yak (Yok et)
        coin::burn(&mut platform.treasury, payment);

        // Karşılığında kasadan SUI çıkar ve kullanıcıya ver
        let sui_payment = balance::split(&mut platform.sui_reserve, sui_amount);
        let sui_coin = coin::from_balance(sui_payment, ctx);
        transfer::public_transfer(sui_coin, ctx.sender());
    }

	public entry fun list_lecture(
		title: String,
		description: String,
		image_url: String,
		content_url: String,
		price: u64,
		ctx: &mut TxContext){

		let lecture = Lecture{
			id: object::new(ctx),
			title,
			description,
			image_url,
			content_url,
			price,
			seller: ctx.sender()
		};

		event::emit(LectureListed{
			lecture_id: object::id(&lecture),
			instructor: ctx.sender(),
			title: title,
			price: price,
			timestamp: ctx.epoch_timestamp_ms()
		});

		transfer::share_object(lecture);
	}

	public entry fun buy_lecture(
		lecture: &Lecture,
		coin: Coin<SUITUDY>,
		ctx: &mut TxContext){

		assert!(coin::value(&coin) == lecture.price);

		transfer::public_transfer(coin, lecture.seller);

		// Satıcıya ödemeyi yap
		let pass = LecturePass {
            id: object::new(ctx),
            lecture_id: object::id(lecture), // Hangi derse ait olduğu
            student: ctx.sender(),           // Kimin aldığı (Provenance)
            title: lecture.title,            // Başlık kopyalandı
		};

		event::emit(LecturePurchased{
			lecture_id: object::id(lecture),
			student: ctx.sender(),
			instructor: lecture.seller,
			price: lecture.price,
			timestamp: ctx.epoch_timestamp_ms()
		});

		transfer::transfer(pass, ctx.sender());
	}

    // === Test Helpers ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUITUDY {}, ctx)
    }
