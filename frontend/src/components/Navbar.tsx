import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Button, Flex, Heading } from "@radix-ui/themes";
import { PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
	onOpenShop: () => void;
	onOpenProfile: () => void;
	currentTheme: "light" | "dark";
	onToggleTheme: () => void;
	onHome: () => void;
}

export function Navbar({ onOpenShop, onOpenProfile, currentTheme, onToggleTheme, onHome }: NavbarProps) {
	const account = useCurrentAccount();

	return (
		<Flex
			position="sticky"
			px="4"
			py="2"
			justify="between"
			align="center"
			style={{
				borderBottom: "1px solid var(--gray-a2)",
				backgroundColor: "var(--color-background)",
				zIndex: 10,
				top: 0,
			}}
		>
			<Box onClick={onHome} style={{ cursor: "pointer" }}>
				<Heading size="5">Suitudy</Heading>
			</Box>

			<Flex gap="3" align="center">
				<Button variant="ghost" onClick={onOpenShop} mr="4" style={{ cursor: "pointer" }}>
					<RocketIcon />
					Get Tokens
				</Button>

				{account && (
					<Button variant="ghost" onClick={onOpenProfile} mr="4" style={{ cursor: "pointer" }}>
						<PersonIcon />
						My Profile
					</Button>
				)}

				<ThemeToggle currentTheme={currentTheme} onToggle={onToggleTheme} />
				<ConnectButton />
			</Flex>
		</Flex>
	);
}
