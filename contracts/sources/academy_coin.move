module contracts::academy_coin {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// The type identifier of coin. The coin will have a type
    /// tag of kind: `Coin<package_object::academy_coin::ACADEMY_COIN>`
    /// Make sure that the name of the type matches the module's name.
    public struct ACADEMY_COIN has drop {}

    /// Module initializer is called once on module publish. A treasury
    /// cap is sent to the publisher, who then controls minting and burning
    /// of tokens.
    fun init(witness: ACADEMY_COIN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6,                // decimals
            b"TCH",           // symbol
            b"TEACH",         // name
            b"TeachToEarn Coin", // description
            option::none(),   // icon url
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }
}
