import { Transaction } from "@mysten/sui/transactions";

export const buyToken = (packageId: string, bankID: string, suiAmount: number) => {
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
