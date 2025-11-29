import { Transaction } from "@mysten/sui/transactions";

export const sellToken = (
	packageId: string,
	bankID: string,
  	amountToSell: number, 
  	userTokenObjects: any[] // Kullanıcının cüzdanındaki SUITUDY objelerinin listesi
) => {
	const tx = new Transaction();
	const amountInMist = BigInt(amountToSell * 1_000_000_000);

	// --- COIN YÖNETİMİ MANTIĞI ---

	if (!userTokenObjects || userTokenObjects.length === 0) {
	throw new Error("Cüzdanınızda hiç SUITUDY Token yok!");
	}

	// 1. İlk coin'i "Ana Coin" (Primary) olarak seçiyoruz
	const primaryCoinInput = userTokenObjects[0];
	const primaryCoin = tx.object(primaryCoinInput.coinObjectId);

	// 2. Eğer birden fazla coin parçası varsa, hepsini Ana Coin'de birleştir (MERGE)
	if (userTokenObjects.length > 1) {
	// İlk hariç diğerlerini al ve objeye çevir
	const otherCoins = userTokenObjects.slice(1).map((coin) => 
		tx.object(coin.coinObjectId)
	);
	// Hepsini birleştir
	tx.mergeCoins(primaryCoin, otherCoins);
	}

	// 3. Birleşmiş Ana Coin'den satılacak miktarı kes (SPLIT)
	// Bu bize tam istediğimiz miktarda tertemiz bir coin verir.
	const [coinToPay] = tx.splitCoins(primaryCoin, [amountInMist]);

	// --- MOVE ÇAĞRISI ---
	tx.moveCall({
	target: `${packageId}::suitudy::sell_token`,
	arguments: [
		tx.object(bankID), // Platform (Bank)
		coinToPay,          // Hazırladığımız SUITUDY Coini
	],
	});

	return tx;
};