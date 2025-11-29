import { Transaction } from "@mysten/sui/transactions";

export const createBuyTokenTx = (packageId: string, bankID: string, suiAmount: number) => {
	const tx = new Transaction();

	const amountInMist = BigInt(suiAmount * 1_000_000_000);

	const [paymentCoin] = tx.splitCoins(tx.gas, [amountInMist]);

	tx.moveCall({
		target: `${packageId}::suitudy::buy_token`,
		arguments: [
			tx.object(bankID),
			paymentCoin,
		],
	});

	return tx;
};

export const createSellTokenTx = (
	packageId: string,
	bankID: string,
	amountToSell: number,
	userTokenObjects: any[] // List of SUITUDY coin objects
) => {
	const tx = new Transaction();
	const amountInMist = BigInt(amountToSell * 1_000_000_000);

	if (!userTokenObjects || userTokenObjects.length === 0) {
		throw new Error("You don't have any SUITUDY Tokens!");
	}

	// 1. Select Primary Coin
	const primaryCoinInput = userTokenObjects[0];
	const primaryCoin = tx.object(primaryCoinInput.coinObjectId);

	// 2. Merge if multiple coins exist
	if (userTokenObjects.length > 1) {
		const otherCoins = userTokenObjects.slice(1).map((coin) =>
			tx.object(coin.coinObjectId)
		);
		tx.mergeCoins(primaryCoin, otherCoins);
	}

	// 3. Split the exact amount to sell
	const [coinToPay] = tx.splitCoins(primaryCoin, [amountInMist]);

	// 4. Call Move function
	tx.moveCall({
		target: `${packageId}::suitudy::sell_token`,
		arguments: [
			tx.object(bankID),
			coinToPay,
		],
	});

	return tx;
};

export const createListLectureTx = (
	packageId: string,
	title: string,
	description: string,
	imageUrl: string,
	contentUrl: string,
	price: number
) => {
	const tx = new Transaction();

	const priceInMist = BigInt(price * 1_000_000_000);

	tx.moveCall({
		target: `${packageId}::suitudy::list_lecture`,
		arguments: [
			tx.pure.string(title),
			tx.pure.string(description),
			tx.pure.string(imageUrl),
			tx.pure.string(contentUrl),
			tx.pure.u64(priceInMist),
		],
	});

	return tx;
};

export const createBuyLectureTx = (
	packageId: string,
	lectureId: string,
	price: number,
	userTokenObjects: any[]
) => {
	const tx = new Transaction();
	const priceInMist = BigInt(price * 1_000_000_000);

	if (!userTokenObjects || userTokenObjects.length === 0) {
		throw new Error("You don't have any SUITUDY Tokens!");
	}

	const primaryCoinInput = userTokenObjects[0];
	const primaryCoin = tx.object(primaryCoinInput.coinObjectId);

	if (userTokenObjects.length > 1) {
		const otherCoins = userTokenObjects.slice(1).map((coin) =>
			tx.object(coin.coinObjectId)
		);
		tx.mergeCoins(primaryCoin, otherCoins);
	}

	const [paymentCoin] = tx.splitCoins(primaryCoin, [priceInMist]);

	tx.moveCall({
		target: `${packageId}::suitudy::buy_lecture`,
		arguments: [
			tx.object(lectureId),
			paymentCoin,
		],
	});

	return tx;
};

export const createBurnPassTx = (packageId: string, passId: string) => {
	const tx = new Transaction();

	tx.moveCall({
		target: `${packageId}::suitudy::burn_pass`,
		arguments: [
			tx.object(passId),
		],
	});

	return tx;
};

export const createDeleteLectureTx = (packageId: string, lectureId: string) => {
	const tx = new Transaction();

	tx.moveCall({
		target: `${packageId}::suitudy::delete_lecture`,
		arguments: [
			tx.object(lectureId),
		],
	});

	return tx;
};
