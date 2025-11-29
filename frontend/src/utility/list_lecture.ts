import { Transaction } from "@mysten/sui/transactions";

export const listLecture = (
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