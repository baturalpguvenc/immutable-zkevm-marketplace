import React, { createContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { providers } from "ethers";

declare global {
  interface Window {
    ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc;
  }
}

interface Web3ContextProps {
  web3Provider: Web3Provider | undefined;
  setWeb3Provider: React.Dispatch<
    React.SetStateAction<Web3Provider | undefined>
  >;
}

export const Web3Context = createContext<Web3ContextProps>({
  web3Provider: undefined,
  setWeb3Provider: () => {},
});

export function Web3ProviderContextProvider({ children }: any) {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(
    undefined
  );

  // Load web3Provider from an already connected window.etherum
  useEffect(() => {
    const provider = new providers.Web3Provider(window.ethereum);
    if (provider) {
      setWeb3Provider(provider);
    }
  }, []);

  return (
    <Web3Context.Provider value={{ web3Provider, setWeb3Provider }}>
      {children}
    </Web3Context.Provider>
  );
}
