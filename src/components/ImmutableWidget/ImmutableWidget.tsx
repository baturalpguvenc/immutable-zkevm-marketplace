import { Web3Provider } from "@ethersproject/providers";
import {
  BridgeReact,
  CheckoutWidgets,
  ConnectReact,
  Environment,
  SwapReact,
  WalletProviderName,
  WalletReact,
  WidgetTheme,
} from "@imtbl/sdk";
import { Group } from "@mantine/core";
import { ShowWidget } from "@/hooks/orchestration";
import React, { useEffect } from "react";

export interface ImtblWidgetsProps {
  web3Provider?: Web3Provider;
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

export const ImmutableWidget = ({
  web3Provider,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
}: ImtblWidgetsProps) => {
  const walletProvider = WalletProviderName.METAMASK;
  // Set widget's config
  useEffect(() => {
    const widgetsConfig = {
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
      version: {
        major: 0,
        minor: 1,
        patch: 9,
      },
      isOnRampEnabled: true,
      isBridgeEnabled: true,
      isSwapEnabled: true,
    };

    CheckoutWidgets(widgetsConfig);
    // UpdateConfig(widgetsConfig);
  }, []);

  return (
    <Group>
      {showConnect.show && <ConnectReact />}
      {showWallet.show && <WalletReact walletProvider={walletProvider} />}
      {showSwap.show && (
        <SwapReact
          walletProvider={walletProvider}
          fromContractAddress={showSwap.data?.fromTokenAddress || ""}
          toContractAddress={showSwap.data?.toTokenAddress || ""}
          amount={showSwap.data?.amount || ""}
        />
      )}
      {showBridge.show && <BridgeReact walletProvider={walletProvider} />}
    </Group>
  );
};
