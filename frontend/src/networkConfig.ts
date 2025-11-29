import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
		url: getFullnodeUrl("testnet"),
			variables: {
			packageId: "0x16ba7420e7edc4d770bfe01e942d7e13f14339f005014e6ac8eec5a4f41b651c",
			bankID: "0xfeb7c7ed27c56847ee88c3f749034bbae57d2f1e4ca9ce5e63da52ef585726a3"
		},
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
