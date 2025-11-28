module contracts::marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use contracts::academy_coin::ACADEMY_COIN;

    /// Error codes
    const E_INSUFFICIENT_PAYMENT: u64 = 1;

    /// Admin address for commission (Dummy address)
    const ADMIN_ADDRESS: address = @0xA11CE; 

    /// Lesson shared object
    public struct Lesson has key, store {
        id: UID,
        teacher: address,
        title: String,
        price: u64
    }

    /// Create a new lesson listing
    public entry fun create_lesson(title: String, price: u64, ctx: &mut TxContext) {
        let lesson = Lesson {
            id: object::new(ctx),
            teacher: tx_context::sender(ctx),
            title,
            price
        };
        transfer::share_object(lesson);
    }

    /// Buy a lesson
    public entry fun buy_lesson(lesson: Lesson, mut payment: Coin<ACADEMY_COIN>, ctx: &mut TxContext) {
        let price = lesson.price;
        let payment_value = coin::value(&payment);

        assert!(payment_value == price, E_INSUFFICIENT_PAYMENT);

        // Calculate commission (5%)
        let commission_amount = (price * 5) / 100;
        let teacher_amount = price - commission_amount;

        // Split payment
        let commission = coin::split(&mut payment, commission_amount, ctx);
        
        // Transfer commission to Admin
        transfer::public_transfer(commission, ADMIN_ADDRESS);

        // Transfer remaining payment to Teacher
        transfer::public_transfer(payment, lesson.teacher);

        // Delete the lesson object
        let Lesson { id, teacher: _, title: _, price: _ } = lesson;
        object::delete(id);
    }
}
