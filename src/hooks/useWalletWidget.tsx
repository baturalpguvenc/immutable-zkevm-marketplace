import { Web3Provider } from "@ethersproject/providers";
import { checkoutSdk } from '@imtbl/sdk';
import { useContext, useEffect } from "react";
import {
  handleOrchestrationEvent,
  hideAllWidgets,
  WidgetContext,
} from "./orchestration";

export function useWalletWidget(
  setWeb3Provider: (val: Web3Provider | undefined) => void
) {
  const { showWidgets, setShowWidgets } = useContext(WidgetContext);
  const { showWallet } = showWidgets;

  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case checkoutSdk.WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data;
          setWeb3Provider(eventData.provider);
          break;
        }
        case checkoutSdk.WalletEventType.DISCONNECT_WALLET: {
          setWeb3Provider(undefined);
          setShowWidgets(hideAllWidgets);
          break;
        }
        case checkoutSdk.WalletEventType.CLOSE_WIDGET: {
          setShowWidgets(hideAllWidgets);
          break;
        }
        case checkoutSdk.OrchestrationEventType.REQUEST_CONNECT:
        case checkoutSdk.OrchestrationEventType.REQUEST_WALLET:
        case checkoutSdk.OrchestrationEventType.REQUEST_SWAP:
        case checkoutSdk.OrchestrationEventType.REQUEST_BRIDGE: {
          handleOrchestrationEvent(event, setShowWidgets);
          break;
        }
        default:
          console.log("did not match any expected event type");
      }
    }) as EventListener;

    if (showWallet) {
      window.addEventListener(
        checkoutSdk.IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        checkoutSdk.IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    };
  }, [showWallet]);
}
