import React, { createContext, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";

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

export function Web3ProviderContextProvider({ children }) {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(
    undefined
  );

  return (
    <Web3Context.Provider value={{ web3Provider, setWeb3Provider }}>
      {children}
    </Web3Context.Provider>
  );
}
