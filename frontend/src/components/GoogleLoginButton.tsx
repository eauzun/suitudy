import { ConnectButton, useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";

export function GoogleLoginButton() {
  const account = useCurrentAccount();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (connectionStatus === 'connecting') {
      setIsConnecting(true);
    } else {
      setIsConnecting(false);
    }
  }, [connectionStatus]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if using zkLogin
  const isZkLogin = currentWallet?.name === "Enoki";

  if (account) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft" size="2">
            <Flex align="center" gap="2">
              {isZkLogin && <Text size="1">🔐</Text>}
              <Text size="2">{formatAddress(account.address)}</Text>
            </Flex>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>
            {isZkLogin ? "Google Account" : "Wallet"}
          </DropdownMenu.Label>
          <DropdownMenu.Item disabled>
            <Text size="1" style={{ wordBreak: "break-all" }}>
              {account.address}
            </Text>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <ConnectButton
            connectText="Disconnect"
            style={{
              background: "transparent",
              color: "var(--red-11)",
              padding: "4px 8px",
              width: "100%",
              textAlign: "left",
              border: "none",
              cursor: "pointer",
            }}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }

  return (
    <ConnectButton
      connectText={isConnecting ? "Connecting..." : "Login with Google"}
      style={{
        backgroundColor: "var(--accent-9)",
        color: "white",
        padding: "6px 12px",
        borderRadius: "6px",
        fontWeight: "500",
        cursor: "pointer",
        border: "none",
        fontSize: "14px",
        transition: "all 0.2s",
      }}
    />
  );
}