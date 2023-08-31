import {
  PopulatedTransaction,
  providers,
  TypedDataDomain,
  Wallet,
} from "ethers";
import { orderbook } from "@imtbl/sdk";
const { ActionType } = orderbook;
import { JsonRpcSigner } from "@ethersproject/providers";

export const WEI = 1e18;
// Bespoke USD price
export const USD = 1644.21;

// Placeholder marketplace fee recipient address, replace with your own wallet address
export const MARKETPLACE_FEE_RECIPIENT =
  "0xca65c6c80562163D49bD12690c2C7aE7d005c6Fb";

// Sign and submit all transaction actions. Collect and return all signatures from signable actions.
export async function actionAll(
  actions: orderbook.Action[],
  signer: Wallet | JsonRpcSigner,
  provider: providers.Provider
): Promise<string[]> {
  const signatures: string[] = [];
  for (const action of actions) {
    if (action.type === ActionType.TRANSACTION) {
      await signAndSubmitTx(await action.buildTransaction(), signer, provider);
    }
    if (action.type === ActionType.SIGNABLE) {
      const signature = await signMessage(action.message, signer);

      signatures.push(signature);
    }
  }

  return signatures;
}

export async function signAndSubmitTx(
  transaction: PopulatedTransaction,
  signer: Wallet | JsonRpcSigner,
  provider: providers.Provider
) {
  const rawTx = transaction;
  rawTx.nonce = await signer.getTransactionCount();
  rawTx.gasPrice = await provider.getGasPrice();
  const receipt = await signer.sendTransaction(transaction);
  await receipt.wait();
}

export async function signMessage(
  {
    domain,
    types,
    value,
  }: { domain: TypedDataDomain; types: any; value: Record<string, any> },
  signer: Wallet | JsonRpcSigner
): Promise<string> {
  return signer._signTypedData(domain, types, value);
}
