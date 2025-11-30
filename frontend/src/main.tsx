import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnokiFlowProvider } from "@mysten/enoki/react";
import { Theme } from "@radix-ui/themes";
import { getFullnodeUrl } from "@mysten/sui/client";

import App from "./App.tsx";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
	testnet: { url: getFullnodeUrl("testnet") },
});

// Check if environment variables are set
if (!import.meta.env.VITE_ENOKI_PUBLIC_KEY) {
	console.warn("Missing VITE_ENOKI_PUBLIC_KEY in environment variables");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
				<WalletProvider
					autoConnect
					storageKey="course-marketplace-wallet"
					preferredWallets={["Enoki"]}
				>
					<EnokiFlowProvider apiKey={import.meta.env.VITE_ENOKI_PUBLIC_KEY}>
						<Theme appearance="dark">
							<App />
						</Theme>
					</EnokiFlowProvider>
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);