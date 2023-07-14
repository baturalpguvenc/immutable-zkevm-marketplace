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

//
// let provider = new providers.JsonRpcProvider(
//   "https://zkevm-rpc.dev.x.immutable.com"
// );
// let oConfig = {
//   baseConfig: {
//     environment: Environment.SANDBOX,
//   },
//   provider: provider,
//   seaportContractAddress: "0x474989C4D25DD41B0B9b1ECb4643B9Fe25f83B19",
//   zoneContractAddress: "0x04102a9696304Ad45663666D5228ffE3100E2472",
//   overrides: {
//     apiEndpoint: "https://order-book-mr.dev.imtbl.com",
//     chainName: CHAIN_NAME,
//   },
// };
// export const orderbookClient = new Orderbook(oConfig);
