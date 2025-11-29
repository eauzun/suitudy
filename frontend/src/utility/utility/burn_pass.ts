import { Transaction } from "@mysten/sui/transactions";

export const burnPass = ( packageId: string, passId: string) => {
  const tx = new Transaction();

  tx.moveCall({
	target: `${packageId}::suitudy::burn_pass`,
	arguments: [
	  tx.object(passId),
	],
  });

  return tx;
};
