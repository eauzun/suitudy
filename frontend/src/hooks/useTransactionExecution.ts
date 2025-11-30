import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { useEnokiFlow } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";

export function useTransactionExecution() {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const enokiFlow = useEnokiFlow();

    const executeTransaction = async (tx: Transaction) => {
        
        // Enoki anahtarını kontrol ediyoruz
        const enokiKeypair = await enokiFlow.getKeypair();

        if (enokiKeypair && account?.address === enokiKeypair.toSuiAddress()) {
            
            // NOTE: This is a self-funded transaction. The user's zkLogin wallet must have SUI balance.
            return await (enokiFlow as any).executeTransaction({
                transaction: tx,
                network: "testnet",
            });

        } else {
            // --- STANDART CÜZDAN AKIŞI ---
            return await signAndExecute({
                transaction: tx,
            });
        }
    };

    return { executeTransaction };
}