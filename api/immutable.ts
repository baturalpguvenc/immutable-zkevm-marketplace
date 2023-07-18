import {
  BlockchainData,
  BlockchainDataModuleConfiguration,
  Environment,
  ImmutableConfiguration,
  Orderbook,
} from "@imtbl/sdk";
import { providers } from "ethers";

export const ENVIRONMENT_SDK = Environment.SANDBOX;
export const INDEXER_API_URL = "https://indexer-mr.sandbox.imtbl.com";
export const ORDERBOOK_API_URL = "https://order-book-mr.sandbox.imtbl.com";
export const CHAIN_NAME: string = "imtbl-zkevm-testnet";

const config: BlockchainDataModuleConfiguration = {
  baseConfig: new ImmutableConfiguration({
    environment: ENVIRONMENT_SDK,
  }),
  overrides: {
    basePath: INDEXER_API_URL,
  },
};

export const client = new BlockchainData(config);
export const orderbookSDK = new Orderbook({
  baseConfig: { environment: Environment.SANDBOX },
  overrides: {
    provider: new providers.JsonRpcProvider(
      "https://zkevm-rpc.sandbox.x.immutable.com"
    ),
  },
});
