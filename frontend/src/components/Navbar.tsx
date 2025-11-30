import { Box, Button, Container, Flex, IconButton } from "@radix-ui/themes";
import { SunIcon, MoonIcon, HomeIcon, PersonIcon, TokensIcon } from "@radix-ui/react-icons";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { useCurrentAccount } from "@mysten/dapp-kit";

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

						{/* Google Login Button */}
						<GoogleLoginButton />
					</Flex>
				</Flex>
			</Container>
		</Box>
	);
}