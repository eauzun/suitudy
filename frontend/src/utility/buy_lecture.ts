import { Transaction } from "@mysten/sui/transactions";

export const createBuyLectureTx = (
		packageId: string,
		lectureId: string, // Satın alınacak dersin ID'si
		price: number,     // Dersin fiyatı (Örn: 50)
		userTokenObjects: any[] // Kullanıcının cüzdanındaki SUITUDY coinleri
	) => {
	const tx = new Transaction();
	const priceInMist = BigInt(price * 1_000_000_000);

	// --- COIN YÖNETİMİ (Merge & Split) ---
	
	if (!userTokenObjects || userTokenObjects.length === 0) {
		throw new Error("Cüzdanınızda hiç SUITUDY Token yok!");
	}

	// 1. İlk coini "Ana Cüzdan" olarak seç
	const primaryCoinInput = userTokenObjects[0];
	const primaryCoin = tx.object(primaryCoinInput.coinObjectId);

	// 2. Eğer başka coinler varsa, hepsini ana coinde birleştir
	if (userTokenObjects.length > 1) {
		const otherCoins = userTokenObjects.slice(1).map((coin) => 
		tx.object(coin.coinObjectId)
		);
		tx.mergeCoins(primaryCoin, otherCoins);
	}

	// 3. Tam olarak ders fiyatı kadar miktarı kesip al (Ödeme Coini)
	const [paymentCoin] = tx.splitCoins(primaryCoin, [priceInMist]);

	// --- MOVE FONKSİYON ÇAĞRISI ---
	tx.moveCall({
		target: `${packageId}::suitudy::buy_lecture`,
		arguments: [
		tx.object(lectureId), // 1. Argüman: Ders Objesi (Shared)
		paymentCoin,          // 2. Argüman: Hazırladığımız Ödeme Coini
		],
	});

	return tx;
};