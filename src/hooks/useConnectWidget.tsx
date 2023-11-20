import { Web3Provider } from "@ethersproject/providers";
import { checkoutSdk } from '@imtbl/sdk';
import { useContext, useEffect } from "react";
import { handleOrchestrationEvent } from "./orchestration";
import { hideAllWidgets, WidgetContext } from "./orchestration";

export function useConnectWidget(setWeb3Provider: (val: Web3Provider) => void) {
  const { showWidgets, setShowWidgets } = useContext(WidgetContext);
  const { showConnect, showWallet, showBridge, showSwap } = showWidgets;

  useEffect(() => {
    const handleConnectEvent = ((event: CustomEvent) => {
      switch (event.detail.type) {
        case checkoutSdk.ConnectEventType.SUCCESS: {
          const eventData = event.detail.data;
          setWeb3Provider(eventData.provider);
          break;
        }
        case checkoutSdk.ConnectEventType.FAILURE: {
          // const eventData = event.detail.data as ConnectionFailed;
          break;
        }
        case checkoutSdk.ConnectEventType.CLOSE_WIDGET: {
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
          break;
      }
    }) as EventListener;

    if (showConnect || showWallet || showBridge || showSwap) {
      window.addEventListener(
        checkoutSdk.IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    }

    return () => {
      window.removeEventListener(
        checkoutSdk.IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
        handleConnectEvent
      );
    };
  }, [showConnect, showWallet, showBridge, showSwap]);
}
