import { Button } from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";
import { createBuyLectureTx } from "../utils/tx-helpers";

interface BuyButtonProps {
	lectureId: string;
	price: number;
}

export function BuyButton({ lectureId, price }: BuyButtonProps) {
	const account = useCurrentAccount();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
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

	const handleBuy = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent card click
		if (!account) return alert("Please connect wallet");
		if (!userCoins?.data) return alert("No tokens found");

		try {
			const tx = createBuyLectureTx(packageId, lectureId, price, userCoins.data);
			signAndExecute(
				{ transaction: tx },
				{
					onSuccess: () => alert("Course purchased successfully!"),
					onError: (err) => {
						console.error(err);
						alert("Failed to purchase course");
					},
				}
			);
		} catch (err: any) {
			alert(err.message);
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
