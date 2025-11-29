import { Transaction } from "@mysten/sui/transactions";

export const deleteLecture = (packageId: string, lectureId: string) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::suitudy::delete_lecture`,
    arguments: [
      tx.object(lectureId),
    ],
  });

  return tx;
};