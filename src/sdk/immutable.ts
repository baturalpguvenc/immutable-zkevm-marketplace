import { blockchainData, config, orderbook } from "@imtbl/sdk";
import { providers } from "ethers";

export const ENVIRONMENT_SDK = config.Environment.SANDBOX;
export const CHAIN_NAME: string = "imtbl-zkevm-testnet";

export const blockChainSDK = new blockchainData.BlockchainData({
  baseConfig: new config.ImmutableConfiguration({
    environment: ENVIRONMENT_SDK,
  }),
});

export const orderbookSDK = new orderbook.Orderbook({
  baseConfig: { environment: config.Environment.SANDBOX },
  overrides: {
    provider: new providers.JsonRpcProvider(
      // If white-listed; replace with the public rpc endpoint
      "https://rpc.testnet.immutable.com"
    ),
  },
});
