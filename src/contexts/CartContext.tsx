import {
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { orderbook } from "@imtbl/sdk";

export type Orders = Array<{
    orderId: string;
    name: string;
    description: string;
    image: string;
    fees: orderbook.Fee[];
    buy: orderbook.ERC20Item[] | orderbook.NativeItem[];
  }>


interface CartContextProps {
  orders: Orders;
  setOrders:
    | Dispatch<
        SetStateAction<Orders>
      >
    | undefined;
}

export const CartContext = createContext<CartContextProps>({
  orders: [],
  setOrders: undefined,
});
