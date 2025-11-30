import { Box, Button, Container, Flex, IconButton } from "@radix-ui/themes";
import { SunIcon, MoonIcon, HomeIcon, PersonIcon, TokensIcon, ExitIcon } from "@radix-ui/react-icons";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useEffect, useState } from "react";

interface NavbarProps {
	onOpenShop: () => void;
	onOpenProfile: () => void;
	onHome: () => void;
	currentTheme: "light" | "dark";
	onToggleTheme: () => void;
}

export function Navbar({
	onOpenShop,
	onOpenProfile,
	onHome,
	currentTheme,
	onToggleTheme,
}: NavbarProps) {
	const account = useCurrentAccount();
	const enokiFlow = useEnokiFlow();
	const [isEnokiConnected, setIsEnokiConnected] = useState(false);

	useEffect(() => {
		const checkEnokiConnection = async () => {
			const keypair = await enokiFlow.getKeypair();
			if (keypair && account?.address === keypair.toSuiAddress()) {
				setIsEnokiConnected(true);
			} else {
				setIsEnokiConnected(false);
			}
		};
		checkEnokiConnection();
	}, [account, enokiFlow]);

	const handleGoogleLogin = async () => {
		await (enokiFlow as any).login({
			network: "testnet",
			redirectTo: window.location.href,
		});
	};

	const handleLogout = async () => {
		await enokiFlow.logout();
		window.location.reload();
	};

	return (
		<Box
			position="sticky"
			top="0"
			style={{
				background: "var(--color-background)",
				borderBottom: "1px solid var(--gray-a3)",
				backdropFilter: "blur(10px)",
				zIndex: 1000,
			}}
		>
			<Container size="4">
				<Flex align="center" justify="between" py="3" px="4">
					{/* Left side - Logo/Home */}
					<Flex align="center" gap="4">
						<Button
							variant="ghost"
							size="2"
							onClick={onHome}
							style={{ cursor: "pointer" }}
						>
							<HomeIcon />
							<Box ml="2">Suitudy</Box>
						</Button>
					</Flex>

					{/* Right side - Actions */}
					<Flex align="center" gap="3">
						{!account && (
							<>
								<ConnectButton />
								<Button variant="surface" onClick={handleGoogleLogin}>
									<Box mr="2">
										<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 7.65C14.5 7.12 14.45 6.61 14.36 6.12H7.5V8.94H11.43C11.26 9.83 10.74 10.59 9.97 11.11V12.91H12.34C13.73 11.63 14.5 9.77 14.5 7.65Z" fill="#4285F4" /><path d="M7.5 14.75C9.47 14.75 11.12 14.1 12.33 12.98L9.96 11.18C9.31 11.62 8.48 11.88 7.5 11.88C5.6 11.88 3.99 10.6 3.42 8.88H0.97V10.78C2.18 13.18 4.67 14.75 7.5 14.75Z" fill="#34A853" /><path d="M3.42 8.88C3.27 8.45 3.19 7.99 3.19 7.51C3.19 7.03 3.27 6.57 3.42 6.14V4.24H0.97C0.48 5.21 0.2 6.33 0.2 7.51C0.2 8.69 0.48 9.81 0.97 10.78L3.42 8.88Z" fill="#FBBC05" /><path d="M7.5 3.14C8.57 3.14 9.53 3.51 10.29 4.23L12.38 2.14C11.12 0.97 9.47 0.25 7.5 0.25C4.67 0.25 2.18 1.82 0.97 4.22L3.42 6.12C3.99 4.4 5.6 3.14 7.5 3.14Z" fill="#EA4335" /></svg>
									</Box>
									Sign in with Google
								</Button>
							</>
						)}

						{account && (
							<ConnectButton />
						)}

						{/* Show Token Shop and Profile only if logged in */}
						{account && (
							<>
								<Button
									variant="soft"
									size="2"
									onClick={onOpenShop}
								>
									<TokensIcon />
									<Box ml="2">Token Shop</Box>
								</Button>

								<IconButton
									variant="soft"
									size="2"
									onClick={onOpenProfile}
								>
									<PersonIcon />
								</IconButton>

								{isEnokiConnected && (
									<IconButton
										variant="soft"
										color="red"
										size="2"
										onClick={handleLogout}
										title="Logout from Google"
									>
										<ExitIcon />
									</IconButton>
								)}
							</>
						)}

						{/* Theme Toggle */}
						<IconButton
							variant="soft"
							size="2"
							onClick={onToggleTheme}
						>
							{currentTheme === "dark" ? <SunIcon /> : <MoonIcon />}
						</IconButton>
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
}