import { Web3Provider } from "@ethersproject/providers";
import { checkoutWidgets, config } from "@imtbl/sdk";
import { Group } from "@mantine/core";
import { ShowWidget } from "@/hooks/orchestration";
import React, { useContext, useEffect } from "react";
import { Web3Context } from "@/contexts/Web3ProviderContext";
import { passportSDK  } from "@/sdk/immutable";
import { useSearchParams } from 'next/navigation';

export interface ImtblWidgetsProps {
  web3Provider?: Web3Provider;
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

const {
  BridgeReact,
  CheckoutWidgets,
  ConnectReact,
  SwapReact,
  WalletReact,
  WidgetTheme,
} = checkoutWidgets;

const { Environment } = config;

export const ImmutableWidget = ({
  showConnect,
  showWallet,
  showSwap,
  showBridge,
}: ImtblWidgetsProps) => {
  const { web3Provider } = useContext(Web3Context);
  const searchparams = useSearchParams();

  if (searchparams.get('code')) {
    passportSDK.loginCallback().catch((e) => {
      // this happens in local env only, when rendered on the dev server
      console.warn(e);
    });
  }

  // Set widget's config
  useEffect(() => {
    CheckoutWidgets({
      environment: Environment.SANDBOX,
      theme: WidgetTheme.DARK,
      isBridgeEnabled: true,
      isSwapEnabled: true,
    });
  }, []);

  return (
    <Group>
      {showConnect.show && <ConnectReact passport={passportSDK} />}
      {showWallet.show && (
        <WalletReact provider={web3Provider} passport={passportSDK} />
      )}
      {showSwap.show && (
        <SwapReact
          provider={web3Provider}
          fromContractAddress={showSwap.data?.fromTokenAddress || ""}
          toContractAddress={showSwap.data?.toTokenAddress || ""}
          amount={showSwap.data?.amount || ""}
        />
      )}
      {showBridge.show && <BridgeReact provider={web3Provider} />}
    </Group>
  );
};
