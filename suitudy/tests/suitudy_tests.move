#[test_only]
module education_platform::suitudy_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use education_platform::suitudy::{Self, Bank, SUITUDY, Lecture, LecturePass};
    use std::string;

    // === Constants ===
    const ADMIN: address = @0xA;
    const INSTRUCTOR: address = @0xB;
    const STUDENT: address = @0xC;

    // === Helpers ===
    fun scenario(): Scenario {
        test_scenario::begin(ADMIN)
    }

    fun init_market(scenario: &mut Scenario) {
        let ctx = test_scenario::ctx(scenario);
        suitudy::init_for_testing(ctx);
    }

    // === Tests ===

    #[test]
    fun test_init_market() {
        let mut scenario = scenario();
        
        // 1. Initialize the market
        init_market(&mut scenario);
        
        // 2. Verify Bank is shared
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let bank = test_scenario::take_shared<Bank>(&scenario);
            // Return it to the pool
            test_scenario::return_shared(bank);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_token() {
        let mut scenario = scenario();
        init_market(&mut scenario);

        // 1. Student buys tokens
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let mut bank = test_scenario::take_shared<Bank>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Mint 10 SUI for the student to pay
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, ctx); // 10 SUI
            
            // Buy SUITUDY (Rate: 1 SUI = 10 SUITUDY)
            suitudy::buy_token(&mut bank, payment, ctx);
            
            test_scenario::return_shared(bank);
        };

        // 2. Verify Student received tokens
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let token = test_scenario::take_from_sender<Coin<SUITUDY>>(&scenario);
            // 10 SUI * 10 = 100 SUITUDY (assuming decimals match or raw amount logic)
            // Logic in contract: sui_value * 10. 
            // 10_000_000_000 * 10 = 100_000_000_000
            assert!(coin::value(&token) == 100_000_000_000, 0);
            test_scenario::return_to_sender(&scenario, token);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_list_lecture() {
        let mut scenario = scenario();
        init_market(&mut scenario);

        // 1. Instructor lists a lecture
        test_scenario::next_tx(&mut scenario, INSTRUCTOR);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            suitudy::list_lecture(
                string::utf8(b"Sui Move 101"),
                string::utf8(b"Intro to Move"),
                string::utf8(b"image.png"),
                string::utf8(b"content_url"),
                500, // Price in SUITUDY
                ctx
            );
        };

        // 2. Verify Lecture object exists
        test_scenario::next_tx(&mut scenario, INSTRUCTOR);
        {
            let lecture = test_scenario::take_shared<Lecture>(&scenario);
            test_scenario::return_shared(lecture);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_lecture_success() {
        let mut scenario = scenario();
        init_market(&mut scenario);

        // 1. Instructor lists a lecture
        test_scenario::next_tx(&mut scenario, INSTRUCTOR);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            suitudy::list_lecture(
                string::utf8(b"Advanced Move"),
                string::utf8(b"Deep dive"),
                string::utf8(b"img"),
                string::utf8(b"url"),
                100, // Price
                ctx
            );
        };

        // 2. Student buys tokens
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let mut bank = test_scenario::take_shared<Bank>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            // Need 10 SUI to get 100 SUITUDY (since 1 SUI = 10 SUITUDY, 10 SUI = 100 SUITUDY? No wait)
            // Code: token_amount = sui_value * 10.
            // If price is 100. We need 100 tokens.
            // sui_value * 10 = 100 => sui_value = 10.
            let payment = coin::mint_for_testing<SUI>(10, ctx); 
            suitudy::buy_token(&mut bank, payment, ctx);
            test_scenario::return_shared(bank);
        };

        // 3. Student buys lecture
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let lecture = test_scenario::take_shared<Lecture>(&scenario);
            let token = test_scenario::take_from_sender<Coin<SUITUDY>>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            suitudy::buy_lecture(&lecture, token, ctx);
            
            test_scenario::return_shared(lecture);
        };

        // 4. Verify Student received LecturePass (Soulbound)
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            // Since LecturePass doesn't have store, it's transferred to sender directly.
            // take_from_sender works for objects owned by sender.
            let pass = test_scenario::take_from_sender<LecturePass>(&scenario);
            test_scenario::return_to_sender(&scenario, pass);
        };

        // 5. Verify Instructor received Payment
        test_scenario::next_tx(&mut scenario, INSTRUCTOR);
        {
            let payment = test_scenario::take_from_sender<Coin<SUITUDY>>(&scenario);
            assert!(coin::value(&payment) == 100, 1);
            test_scenario::return_to_sender(&scenario, payment);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_buy_lecture_fail_funds() {
        let mut scenario = scenario();
        init_market(&mut scenario);

        // 1. Instructor lists a lecture
        test_scenario::next_tx(&mut scenario, INSTRUCTOR);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            suitudy::list_lecture(
                string::utf8(b"Expensive Course"),
                string::utf8(b"Desc"),
                string::utf8(b"img"),
                string::utf8(b"url"),
                1000, // Price
                ctx
            );
        };

        // 2. Student buys tokens (Insufficient amount)
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let mut bank = test_scenario::take_shared<Bank>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            // Buy 100 tokens (10 SUI)
            let payment = coin::mint_for_testing<SUI>(10, ctx); 
            suitudy::buy_token(&mut bank, payment, ctx);
            test_scenario::return_shared(bank);
        };

        // 3. Student tries to buy lecture (Price 1000, has 100)
        test_scenario::next_tx(&mut scenario, STUDENT);
        {
            let lecture = test_scenario::take_shared<Lecture>(&scenario);
            let token = test_scenario::take_from_sender<Coin<SUITUDY>>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // This should fail because token value (100) != price (1000)
            suitudy::buy_lecture(&lecture, token, ctx);
            
            test_scenario::return_shared(lecture);
        };

        test_scenario::end(scenario);
    }
}
