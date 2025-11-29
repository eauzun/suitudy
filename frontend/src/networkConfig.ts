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
			packageId: "0x8ea9a03d0e95a8073bb6e36278b1c2b704f26e41d016ec51890259dbdceef68b",
			bankID: "0x31c521338db03be27fcf216aa3570cd907b962704dc019b58024184fc3f51cab"
		},
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
