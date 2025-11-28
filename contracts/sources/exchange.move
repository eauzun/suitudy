module contracts::exchange {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    use contracts::academy_coin::ACADEMY_COIN;

    const E_INSUFFICIENT_BALANCE: u64 = 1;

    /// Exchange rate: 1 SUI = 10 TEACH
    const EXCHANGE_RATE: u64 = 10;

    /// The Bank shared object
    public struct Bank has key {
        id: UID,
        tch_balance: Balance<ACADEMY_COIN>,
        sui_balance: Balance<SUI>,
        admin_cap: TreasuryCap<ACADEMY_COIN>
    }

    /// Initialize the bank.
    /// We need the TreasuryCap to mint initial supply or capability to mint.
    /// For simplicity, we'll assume the deployer sends the TreasuryCap to the bank creation function 
    /// or we can initialize it if we had the witness here. 
    /// However, since `academy_coin` init sends TreasuryCap to sender, we need a way to deposit it.
    /// To keep it simple and follow the prompt "Preferably: Let the Bank hold a large supply minted at init",
    /// we will add a function to create the bank that accepts the TreasuryCap.
    public entry fun create_bank(treasury_cap: TreasuryCap<ACADEMY_COIN>, ctx: &mut TxContext) {
        let bank = Bank {
            id: object::new(ctx),
            tch_balance: balance::zero(),
            sui_balance: balance::zero(),
            admin_cap: treasury_cap
        };
        transfer::share_object(bank);
    }

    /// Buy TEACH tokens with SUI.
    public fun buy_token(bank: &mut Bank, payment: Coin<SUI>, ctx: &mut TxContext): Coin<ACADEMY_COIN> {
        let sui_value = coin::value(&payment);
        let tch_amount = sui_value * EXCHANGE_RATE;

        // Deposit SUI into bank
        let paid_balance = coin::into_balance(payment);
        balance::join(&mut bank.sui_balance, paid_balance);

        // Mint TEACH tokens to the user
        // Since Bank holds TreasuryCap, it can mint directly.
        coin::mint(&mut bank.admin_cap, tch_amount, ctx)
    }

    /// Faucet function for testing. Mints 100 TEACH to sender.
    public entry fun mint_for_testing(bank: &mut Bank, ctx: &mut TxContext) {
        let amount = 100_000_000; // Assuming 6 decimals like SUI? academy_coin defined 6 decimals.
        // 100 tokens * 10^6
        let coin = coin::mint(&mut bank.admin_cap, amount, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    /// Withdraw SUI from Bank (Admin only - simplified for hackathon, anyone with access to function if not restricted)
    /// The prompt didn't ask for admin withdrawal, but good to have for completeness or just leave it.
    /// I'll skip it to keep it strictly to requirements.
}
