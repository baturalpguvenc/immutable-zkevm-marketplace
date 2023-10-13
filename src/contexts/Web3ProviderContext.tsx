import React, { createContext, useEffect, useState } from "react";
import {
  Web3Provider,
  ExternalProvider,
  JsonRpcFetchFunc,
} from "@ethersproject/providers";
import { providers } from "ethers";
import { passportSDK } from "@/sdk/immutable";

interface Ethereum extends ExternalProvider, JsonRpcFetchFunc {
  on: (
    eventName: "accountsChanged",
    handler: (accounts: string[]) => void
  ) => void;
}

declare global {
  interface Window {
    ethereum: Ethereum;
  }
}

interface Web3ContextProps {
  web3Provider: Web3Provider | undefined;
  userAddress: string | undefined;
  setWeb3Provider: React.Dispatch<
    React.SetStateAction<Web3Provider | undefined>
  >;
}

export const Web3Context = createContext<Web3ContextProps>({
  web3Provider: undefined,
  userAddress: undefined,
  setWeb3Provider: () => {},
});

export function Web3ProviderContextProvider({ children }: any) {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(
    undefined
  );
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);

  // Load web3Provider from an already connected window.etherum
  useEffect(() => {
    const provider = new providers.Web3Provider(passportSDK.connectEvm());
    if (provider) {
      const tryGetPassportProvider = async () => {
        try {
          const [connectedWallet]: (string | undefined)[] = await provider.send('eth_requestAccounts', []);
          if (!connectedWallet) {
            return;
          }
          setWeb3Provider(provider);
          setUserAddress(connectedWallet);
        } catch (e) { 
          console.log(e)
          // do nothing
        }
      };
      tryGetPassportProvider();
    }
    if (window.ethereum && !provider) {
      const provider = new providers.Web3Provider(window.ethereum);
      const fetchProvider = async () => {
        if (provider) {
          try {
            console.log("provider", provider);
            const address = await provider.getSigner().getAddress();
            setWeb3Provider(provider);
            setUserAddress(address);
          } catch {
            // do nothing because metamask not initialized
          }
        }
      };
      fetchProvider();
      checkIfAccountChanged();
    }
  }, []);

  const checkIfAccountChanged = async () => {
    try {
      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("accounts changed", accounts[0]);
        setUserAddress(accounts[0]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Web3Context.Provider
      value={{ web3Provider, setWeb3Provider, userAddress }}
    >
      {children}
    </Web3Context.Provider>
  );
}
