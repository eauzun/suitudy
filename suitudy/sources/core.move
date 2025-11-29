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

	// === Structs ===

	public struct SUITUDY has drop {}

	public struct Bank has key {
		id: UID,
		treasury: TreasuryCap<SUITUDY>,
		sui_reserve: Balance<SUI>
	}

	public struct Lecture has key, store {
		id: UID,
		title: String,
		description: String,
		image_url: String,
		content_url: String
	}

	public struct ListLecture has key, store {
		id: UID,
		lecture: Lecture,
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

	public entry fun create_lecture(
		title: String,
		description: String,
		price: u64,
		instructor: address,
		image_url: String,
		content_url: String,
		ctx: &mut TxContext){

		let lecture = Lecture{
			id: object::new(ctx),
			title,
			description,
			price,
			instructor: ctx.sender(),
			image_url,
			content_url
		};

		let list_lecture = ListLecture{
			id: object::new(ctx),
			lecture: lecture,
			price,
			seller: ctx.sender()
		};

		event::emit(LectureListed{
			lecture_id: object::id(&list_lecture),
			instructor: ctx.sender(),
			title: lecture.title,
			price,
			timestamp: ctx.epoch_timestamp_ms()
		});

		transfer::transfer(lecture, ctx.sender());
		transfer::share_object(list_lecture);
	}

	public entry fun buy_lecture(
		list_lecture: ListLecture,
		coin: Coin<SUI>,
		ctx: &mut TxContext){

		let ListLecture { id, lecture, price, seller } = list_lecture;
		assert!(coin.value() == price);

		// Satıcıya ödemeyi yap
		transfer::public_transfer(coin, list_lecture.seller);
		transfer::public_transfer(lecture, ctx.sender());


		event::emit(LecturePurchased{
			lecture_id: object::id(&list_lecture.lecture),
			student: ctx.sender(),
			instructor: list_lecture.lecture.instructor,
			price: list_lecture.price,
			timestamp: ctx.epoch_timestamp_ms()
		});

		transfer::transfer(list_lecture.lecture, ctx.sender());
	}

	public entry fun transfer_lecture(lecture: lectures, to: address){
		transfer::public_transfer(lecture,to);
	}

	//??????????
	public entry fun transfer_tokenToWallet(coin: Coin<SUI>, token: suidityToken){
		transfer::public_transfer(token, coin);
	}

	public entry fun transfer_walletToToken(coin: Coin<SUI>, token: suidityToken){
		transfer::public_transfer(coin, token)
	}
