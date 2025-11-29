import {
	Badge,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	Text,
	Container,
} from "@radix-ui/themes";
import { useState } from "react";
import {
	useCurrentAccount,
	useSignAndExecuteTransaction,
	useSuiClientQuery,
} from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";
import { createBuyTokenTx, createSellTokenTx } from "../utils/tx-helpers";

export function TokenShop() {
	const [mode, setMode] = useState<"buy" | "sell">("buy");
	const account = useCurrentAccount();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { packageId, bankID } = useNetworkVariables() as any;

	// Fetch user's SUITUDY tokens for Sell Mode
	const { data: userCoins, isLoading: isLoadingCoins } = useSuiClientQuery(
		"getCoins",
		{
			owner: account?.address || "",
			coinType: `${packageId}::suitudy::SUITUDY`,
		},
		{
			enabled: !!account && mode === "sell",
		}
	);

	const handleBuy = (amountInSui: number) => {
		if (!account) return alert("Please connect wallet first");

		const tx = createBuyTokenTx(packageId, bankID, amountInSui);

		signAndExecute(
			{ transaction: tx },
			{
				onSuccess: () => {
					alert("Tokens bought successfully!");
				},
				onError: (err) => {
					console.error(err);
					alert("Failed to buy tokens");
				},
			}
		);
	};

	const handleSell = (amountInToken: number) => {
		if (!account) return alert("Please connect wallet first");
		if (!userCoins?.data) return;

		try {
			const tx = createSellTokenTx(
				packageId,
				bankID,
				amountInToken,
				userCoins.data
			);

			signAndExecute(
				{ transaction: tx },
				{
					onSuccess: () => {
						alert("Tokens sold successfully!");
					},
					onError: (err) => {
						console.error(err);
						alert("Failed to sell tokens");
					},
				}
			);
		} catch (e: any) {
			alert(e.message);
		}
	};

	return (
		<Container size="3" p="4">
			<Flex direction="column" gap="6" align="center">
				{/* Header */}
				<Flex direction="column" align="center" gap="2">
					<Heading size="8">Token Exchange</Heading>
					<Badge size="3" color="iris" variant="soft">
						1 SUI = 10 SUITUDY
					</Badge>
				</Flex>

				{/* Toggle Control */}
				<Flex gap="3" mb="5" p="1" style={{ backgroundColor: "var(--gray-a3)", borderRadius: "var(--radius-3)", width: "100%" }}>
					<Button
						size="3"
						variant={mode === "buy" ? "solid" : "soft"}
						color={mode === "buy" ? "iris" : "gray"}
						onClick={() => setMode("buy")}
						style={{ flex: 1, cursor: "pointer" }}
					>
						Buy Token (SUI → SUITUDY)
					</Button>
					<Button
						size="3"
						variant={mode === "sell" ? "solid" : "soft"}
						color={mode === "sell" ? "ruby" : "gray"}
						onClick={() => setMode("sell")}
						style={{ flex: 1, cursor: "pointer" }}
					>
						Sell Token (SUITUDY → SUI)
					</Button>
				</Flex>

				{/* Offer Cards */}
				<Grid columns="3" gap="4" width="100%">
					{mode === "buy" ? (
						<>
							{/* Buy Card 1 */}
							<Card
								size="3"
								style={{
									cursor: "pointer",
									transition: "transform 0.2s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
								onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
								onClick={() => handleBuy(1)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="gray">Starter</Text>
									<Heading size="8" color="iris">10 SUITUDY</Heading>
									<Badge color="gray" variant="surface">Cost: 1 SUI</Badge>
								</Flex>
							</Card>

							{/* Buy Card 2 */}
							<Card
								size="3"
								style={{
									cursor: "pointer",
									transition: "transform 0.2s",
									border: "2px solid var(--iris-5)"
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
								onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
								onClick={() => handleBuy(5)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="iris" weight="bold">Popular</Text>
									<Heading size="8" color="iris">50 SUITUDY</Heading>
									<Badge color="iris" variant="solid">Cost: 5 SUI</Badge>
								</Flex>
							</Card>

							{/* Buy Card 3 */}
							<Card
								size="3"
								style={{
									cursor: "pointer",
									transition: "transform 0.2s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
								onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
								onClick={() => handleBuy(10)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="gray">Whale</Text>
									<Heading size="8" color="iris">100 SUITUDY</Heading>
									<Badge color="gray" variant="surface">Cost: 10 SUI</Badge>
								</Flex>
							</Card>
						</>
					) : (
						<>
							{/* Sell Card 1 */}
							<Card
								size="3"
								style={{
									cursor: isLoadingCoins || !userCoins?.data?.length ? "not-allowed" : "pointer",
									opacity: isLoadingCoins || !userCoins?.data?.length ? 0.5 : 1,
									transition: "transform 0.2s",
								}}
								onClick={() => !isLoadingCoins && userCoins?.data?.length && handleSell(10)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="gray">Small Cashout</Text>
									<Heading size="8" color="jade">1 SUI</Heading>
									<Badge color="gray" variant="surface">Sell: 10 SUITUDY</Badge>
								</Flex>
							</Card>

							{/* Sell Card 2 */}
							<Card
								size="3"
								style={{
									cursor: isLoadingCoins || !userCoins?.data?.length ? "not-allowed" : "pointer",
									opacity: isLoadingCoins || !userCoins?.data?.length ? 0.5 : 1,
									transition: "transform 0.2s",
								}}
								onClick={() => !isLoadingCoins && userCoins?.data?.length && handleSell(50)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="gray">Medium Cashout</Text>
									<Heading size="8" color="jade">5 SUI</Heading>
									<Badge color="gray" variant="surface">Sell: 50 SUITUDY</Badge>
								</Flex>
							</Card>

							{/* Sell Card 3 */}
							<Card
								size="3"
								style={{
									cursor: isLoadingCoins || !userCoins?.data?.length ? "not-allowed" : "pointer",
									opacity: isLoadingCoins || !userCoins?.data?.length ? 0.5 : 1,
									transition: "transform 0.2s",
								}}
								onClick={() => !isLoadingCoins && userCoins?.data?.length && handleSell(100)}
							>
								<Flex direction="column" align="center" gap="3" py="4">
									<Text size="2" color="gray">Big Cashout</Text>
									<Heading size="8" color="jade">10 SUI</Heading>
									<Badge color="gray" variant="surface">Sell: 100 SUITUDY</Badge>
								</Flex>
							</Card>
						</>
					)}
				</Grid>

				{mode === "sell" && isLoadingCoins && <Text>Loading your tokens...</Text>}
				{mode === "sell" && !isLoadingCoins && (!userCoins?.data || userCoins.data.length === 0) && (
					<Text color="red">You have 0 SUITUDY tokens to sell.</Text>
				)}
			</Flex>
		</Container>
	);
}
