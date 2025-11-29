import { Card, Flex, Text } from "@radix-ui/themes";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";

export function TokenBalance() {
	const account = useCurrentAccount();
	const { packageId } = useNetworkVariables() as any;

	const { data: balance, isPending } = useSuiClientQuery(
		"getBalance",
		{
			owner: account?.address || "",
			coinType: `${packageId}::suitudy::SUITUDY`,
		},
		{
			enabled: !!account,
		}
	);

	const formattedBalance = balance
		? (Number(balance.totalBalance) / 1_000_000_000).toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
		: "0.00";

	return (
		<Card style={{ background: "var(--iris-3)" }}>
			<Flex direction="column" align="center" gap="1" py="2">
				<Text size="2" weight="bold" color="iris">
					YOUR BALANCE
				</Text>
				{isPending ? (
					<Text size="6" weight="bold">
						Loading...
					</Text>
				) : (
					<Text size="8" weight="bold">
						{formattedBalance} SUITUDY
					</Text>
				)}
			</Flex>
		</Card>
	);
}
