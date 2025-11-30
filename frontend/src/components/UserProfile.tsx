import { Box, Card, Container, Flex, Heading, Text, Badge, Avatar, Separator } from "@radix-ui/themes";
import { useCurrentAccount, useCurrentWallet, useSuiClientQuery } from "@mysten/dapp-kit";

export function UserProfile() {
	const account = useCurrentAccount();
	const { currentWallet } = useCurrentWallet();
	
	// Get balance
	const { data: balance } = useSuiClientQuery(
		"getBalance",
		{ owner: account?.address ?? "" },
		{ enabled: !!account }
	);

	if (!account) {
		return (
			<Container size="2" pt="4">
				<Card>
					<Flex direction="column" gap="3" align="center" p="4">
						<Heading size="4">Not Connected</Heading>
						<Text color="gray">Please login with Google to view your profile</Text>
					</Flex>
				</Card>
			</Container>
		);
	}

	const isZkLogin = currentWallet?.name === "Enoki";
	const formattedBalance = balance 
		? (Number(balance.totalBalance) / 1_000_000_000).toFixed(4) 
		: "0";

	return (
		<Container size="2" pt="4">
			<Card>
				<Flex direction="column" gap="4">
					{/* Header */}
					<Flex align="center" gap="4">
						<Avatar
							size="5"
							fallback={account.address.slice(0, 2)}
							color="iris"
							variant="solid"
						/>
						<Box>
							<Heading size="5">Your Profile</Heading>
							<Flex align="center" gap="2" mt="1">
								<Badge color={isZkLogin ? "green" : "blue"} variant="soft">
									{isZkLogin ? "zkLogin (Google)" : "Wallet Connected"}
								</Badge>
							</Flex>
						</Box>
					</Flex>

					<Separator size="4" />

					{/* Wallet Info */}
					<Box>
						<Text size="2" color="gray" as="div" mb="1">
							Wallet Address
						</Text>
						<Text size="3" style={{ fontFamily: "monospace" }}>
							{account.address}
						</Text>
					</Box>

					{/* Balance */}
					<Box>
						<Text size="2" color="gray" as="div" mb="1">
							Balance
						</Text>
						<Text size="3" weight="bold">
							{formattedBalance} SUI
						</Text>
					</Box>

					{/* Login Method */}
					<Box>
						<Text size="2" color="gray" as="div" mb="1">
							Authentication Method
						</Text>
						<Text size="3">
							{isZkLogin ? "Google OAuth (zkLogin)" : currentWallet?.name || "Unknown"}
						</Text>
					</Box>
				</Flex>
			</Card>
		</Container>
	);
}