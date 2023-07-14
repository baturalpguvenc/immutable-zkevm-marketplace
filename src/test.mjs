import { Environment, Orderbook } from "@imtbl/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { providers } from "ethers";
const CHAIN_NAME = "imtbl-zkevm-devnet-5";

//
const provider = new JsonRpcProvider("https://zkevm-rpc.dev.x.immutable.com");
// const provider = new providers.JsonRpcProvider(
//   "https://zkevm-rpc.dev.x.immutable.com"
// );

// const seaportProvider =
//   provider instanceof providers.Provider ? provider : provider.provider;
//
// console.log(seaportProvider instanceof providers.Provider);
console.log("outsoide of seaportjs", provider instanceof providers.Provider);
// if (!seaportProvider) {
//   throw new Error("Hi im kenley");
// }

let oConfig = {
  baseConfig: {
    environment: Environment.SANDBOX,
  },
  provider: provider,
  seaportContractAddress: "0x474989C4D25DD41B0B9b1ECb4643B9Fe25f83B19",
  zoneContractAddress: "0x04102a9696304Ad45663666D5228ffE3100E2472",
  overrides: {
    apiEndpoint: "https://order-book-mr.dev.imtbl.com",
    chainName: CHAIN_NAME,
  },
};
export const orderbookClient = new Orderbook(oConfig);
console.log(orderbookClient);
