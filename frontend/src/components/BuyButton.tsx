import { Button } from "@radix-ui/themes";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useTransactionExecution } from "../hooks/useTransactionExecution";
import { useNetworkVariables } from "../networkConfig";
import { createBuyLectureTx } from "../utils/tx-helpers";

interface BuyButtonProps {
	lectureId: string;
	price: number;
}

export function BuyButton({ lectureId, price }: BuyButtonProps) {
	const account = useCurrentAccount();
	const { executeTransaction } = useTransactionExecution();
	const { packageId } = useNetworkVariables() as any;

	const { data: userCoins, isLoading } = useSuiClientQuery(
		"getCoins",
		{
			owner: account?.address || "",
			coinType: `${packageId}::suitudy::SUITUDY`,
		},
		{
			enabled: !!account,
		}
	);

	const handleBuy = async (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent card click
		if (!account) return alert("Please connect wallet");
		if (!userCoins?.data) return alert("No tokens found");

		try {
			const tx = createBuyLectureTx(packageId, lectureId, price, userCoins.data);
			await executeTransaction(tx);
			alert("Course purchased successfully!");
		} catch (err: any) {
			console.error(err);
			alert("Failed to purchase course: " + err.message);
		}
	};

	return (
		<Button
			size="1"
			variant="solid"
			color="green"
			onClick={handleBuy}
			disabled={isLoading || !account}
			style={{ cursor: "pointer" }}
		>
			Buy
		</Button>
	);
}
