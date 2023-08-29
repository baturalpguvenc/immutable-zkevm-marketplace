import { Web3Provider } from "@ethersproject/providers";
import { checkoutWidgets } from "@imtbl/sdk";
import { useContext, useEffect } from "react";
import {
  handleOrchestrationEvent,
  hideAllWidgets,
  WidgetContext,
} from "./orchestration";

const { IMTBLWidgetEvents, OrchestrationEventType, WalletEventType } =
  checkoutWidgets;

export function useWalletWidget(
  setWeb3Provider: (val: Web3Provider | undefined) => void
) {
  const { showWidgets, setShowWidgets } = useContext(WidgetContext);
  const { showWallet } = showWidgets;

  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data;
          setWeb3Provider(eventData.provider);
          break;
        }
        case WalletEventType.DISCONNECT_WALLET: {
          setWeb3Provider(undefined);
          setShowWidgets(hideAllWidgets);
          break;
        }
        case WalletEventType.CLOSE_WIDGET: {
          setShowWidgets(hideAllWidgets);
          break;
        }
        case OrchestrationEventType.REQUEST_CONNECT:
        case OrchestrationEventType.REQUEST_WALLET:
        case OrchestrationEventType.REQUEST_SWAP:
        case OrchestrationEventType.REQUEST_BRIDGE: {
          handleOrchestrationEvent(event, setShowWidgets);
          break;
        }
        default:
          console.log("did not match any expected event type");
      }
    }) as EventListener;

    if (showWallet) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    };
  }, [showWallet]);
}
