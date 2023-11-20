import { checkoutSdk } from '@imtbl/sdk';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

export interface ShowWidget {
  show: boolean;
  data: any;
}

export interface WidgetState {
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

export const hideAllWidgets: WidgetState = {
  showConnect: { show: false, data: {} },
  showWallet: { show: false, data: {} },
  showSwap: { show: false, data: {} },
  showBridge: { show: false, data: {} },
};

export function handleOrchestrationEvent(
  event: CustomEvent,
  setShowWidgets: Dispatch<SetStateAction<WidgetState>>
) {
  switch (event.detail.type) {
    case checkoutSdk.OrchestrationEventType.REQUEST_CONNECT: {
      setShowWidgets({
        ...hideAllWidgets,
        showConnect: { show: true, data: event.detail.data },
      });
      return;
    }
    case checkoutSdk.OrchestrationEventType.REQUEST_WALLET: {
      setShowWidgets({
        ...hideAllWidgets,
        showWallet: { show: true, data: event.detail.data },
      });
      return;
    }
    default: {
      console.log("orchestration event not handled");
      return;
    }
  }
}

export interface WidgetContextState {
  showWidgets: WidgetState;
  setShowWidgets: Dispatch<SetStateAction<WidgetState>>;
}

export const initialWidgetContextState: WidgetContextState = {
  showWidgets: hideAllWidgets,
  setShowWidgets: () => {},
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WidgetContext = createContext<WidgetContextState>(
  initialWidgetContextState
);

export interface WidgetProviderProps {
  children: React.ReactNode;
}

export const WidgetProvider = (provider: WidgetProviderProps) => {
  const [showWidgets, setShowWidgets] = useState(hideAllWidgets);
  const child = provider.children;
  return (
    <WidgetContext.Provider value={{ showWidgets, setShowWidgets }}>
      {child}
    </WidgetContext.Provider>
  );
};
