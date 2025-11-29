import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Button, Flex, Heading } from "@radix-ui/themes";
import { RocketIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
	onOpenShop: () => void;
	currentTheme: "light" | "dark";
	onToggleTheme: () => void;
}

export function Navbar({ onOpenShop, currentTheme, onToggleTheme }: NavbarProps) {
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
			<Box>
				<Heading size="5">Suitudy</Heading>
			</Box>

			<Flex gap="3" align="center">
				<Button variant="ghost" onClick={onOpenShop} mr="4">
					<RocketIcon />
					Get Tokens
				</Button>
				<ThemeToggle currentTheme={currentTheme} onToggle={onToggleTheme} />
				<ConnectButton />
			</Flex>
		</Flex>
	);
}
