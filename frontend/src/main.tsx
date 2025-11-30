import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { SuiClientProvider, WalletProvider, useSuiClientContext } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";

import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";

const queryClient = new QueryClient();

// Check if environment variables are set
if (!import.meta.env.VITE_ENOKI_PUBLIC_KEY) {
  console.warn("Missing VITE_ENOKI_PUBLIC_KEY in environment variables");
}
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.warn("Missing VITE_GOOGLE_CLIENT_ID in environment variables");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
				<RegisterEnokiWallets />
				<WalletProvider 
					autoConnect
					storageKey="course-marketplace-wallet"
					preferredWallets={["Enoki"]}
				>
					<App />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);

function RegisterEnokiWallets() {
    const { client, network } = useSuiClientContext();

    useEffect(() => {
        // Only register Enoki wallets for supported networks
        if (!isEnokiNetwork(network)) {
            console.log("Current network doesn't support Enoki:", network);
            return;
        }

        console.log("Registering Enoki wallets for network:", network);

        const { unregister } = registerEnokiWallets({
            apiKey: import.meta.env.VITE_ENOKI_PUBLIC_KEY,
            providers: {
                google: {
                    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                },
            },
            client: client as any,
            network,
        });

        return unregister;
    }, [client, network]);

    return null;
}