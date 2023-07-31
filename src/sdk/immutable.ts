import {
  BlockchainData,
  Environment,
  ImmutableConfiguration,
  Orderbook,
} from "@imtbl/sdk";
import { providers } from "ethers";

export const ENVIRONMENT_SDK = Environment.SANDBOX;
export const CHAIN_NAME: string = "imtbl-zkevm-testnet";

export const blockChainSDK = new BlockchainData({
  baseConfig: new ImmutableConfiguration({
    environment: ENVIRONMENT_SDK,
  }),
});

export const orderbookSDK = new Orderbook({
  baseConfig: { environment: Environment.SANDBOX },
  overrides: {
    provider: new providers.JsonRpcProvider(
      // If white-listed; replace with the public rpc endpoint
      "https://zkevm-rpc.sandbox.x.immutable.com"
    ),
  },
});
