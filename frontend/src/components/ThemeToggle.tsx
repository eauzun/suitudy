import { IconButton, Tooltip } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

interface ThemeToggleProps {
	currentTheme: "light" | "dark";
	onToggle: () => void;
}

export function ThemeToggle({ currentTheme, onToggle }: ThemeToggleProps) {
	return (
		<Tooltip content={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}>
			<IconButton variant="ghost" onClick={onToggle}>
				{currentTheme === "dark" ? <SunIcon /> : <MoonIcon />}
			</IconButton>
		</Tooltip>
	);
}
