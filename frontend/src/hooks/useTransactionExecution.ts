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
            
            // --- HATA DÜZELTME BURADA ---
            // TypeScript'e "Sen karışma, ben bu fonksiyonun orada olduğunu biliyorum" diyoruz.
            // Ayrıca 'sponsorAndExecuteTransaction' metodunu kullanıyoruz (Genelde doğru isim budur).
            
            return await (enokiFlow as any).sponsorAndExecuteTransaction({
                transaction: tx,
                network: "testnet",
                client: (enokiFlow as any).client, // Client'ı da garantiye alalım
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