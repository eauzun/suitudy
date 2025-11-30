import { useSignAndExecuteTransaction, useCurrentWallet } from "@mysten/dapp-kit";
import { useEnokiFlow } from "@mysten/enoki";
import { Transaction } from "@mysten/sui/transactions";

export function useTransactionExecution() {
	const { currentWallet } = useCurrentWallet();
	const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
	const enokiFlow = useEnokiFlow();

	const executeTransaction = async (tx: Transaction) => {
		if (currentWallet?.name === "Enoki") {
			// Enoki zkLogin Flow (Sponsored)
			return await enokiFlow.sponsorAndExecuteTransaction({
				transaction: tx,
				network: "testnet", // Ensure this matches your network
				client: enokiFlow.client, // Pass the client if required by the SDK version
			});
		} else {
			// Standard Wallet Flow
			return await signAndExecute({
				transaction: tx,
			});
		}
	};

	return { executeTransaction };
}
