import React, { useContext, useState } from "react";
import { Group, Text, Divider, Flex, Button } from "@mantine/core";
import { orderbook } from "@imtbl/sdk";
import { MARKETPLACE_FEE_RECIPIENT, USD, WEI } from "@/sdk/orderbook";
import { Web3Context } from "@/contexts/Web3ProviderContext";
import { orderbookSDK  } from "@/sdk/immutable";
import { actionAll } from "@/sdk/orderbook";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import router from "next/router";

interface CheckoutProps {
  orders: Array<{
    orderId: string;
    buy: orderbook.ERC20Item[] | orderbook.NativeItem[];
    fees: orderbook.Fee[];
  }>;
}

export function Checkout({ orders }: CheckoutProps) {
  const { web3Provider } = useContext(Web3Context);
  const [buying, setBuying] = useState(false);

  const total =
    orders.length > 0
      ? orders
          .map(
            (o) =>
              Number(o.buy[0].amount) +
              o.fees.map((f) => Number(f.amount) ?? 0).reduce((p, c) => p + c)
          )
          .reduce((p, c) => p + c) / WEI
      : 0;

  const onBuyAllClick = async () => {
    setBuying(true);

    if (!web3Provider) {
      alert("Please sign in your wallet");
      return;
    }

    try {
      // Get the Signer or Wallet instance for the user fulfilling an open order
      const signer = web3Provider!.getSigner();
      const address = await signer.getAddress();

      console.log("Buying", orders, address, signer);
      const fulfillResponse = await orderbookSDK.fulfillBulkOrders(orders.map(o => {
        return {
          listingId: o.orderId,
          takerFees: [
            {
              recipient: MARKETPLACE_FEE_RECIPIENT,
              amount: ((3 / 100) * Number(o.buy[0].amount)).toString(),
            },
          ]
        }
      }), address);

      if (!fulfillResponse.sufficientBalance) {
        notifications.show({
          title: "NFT Purchased Error!",
          color: "red",
          icon: <IconExclamationCircle />,
          message: `Insufficient balance to fulfill order`,
        });
        return;
      }

      const { actions } = fulfillResponse;
      const result = await actionAll(actions, signer, web3Provider);
      notifications.show({
        title: "NFT Purchased!",
        color: "green",
        icon: <IconCheck />,
        message: `NFT Purchased, you are awesome! transactionHash: ${result}`,
        onClose: () => {
          router.reload();
        },
      });
    } catch (e) {
      console.error("error: ", e);
      notifications.show({
        title: "NFT Purchased Error!",
        color: "red",
        icon: <IconCheck />,
        message: `NFT Purchase error: ${e} 🤥`,
      });
    } finally {
      setBuying(false);
    }
  };

  return (
    <>
      <Divider my="sm" variant="dotted" />
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={{ base: "sm", sm: "lg" }}
        justify={{ sm: "space-between" }}
        align={{ sm: "center" }}
      >
        <Flex direction={{ sm: "column" }} align={{ sm: "center" }}>
          <Text fz="xl" tt="uppercase" fw={700}>
            Total
          </Text>
          <Text fz={8} tt="uppercase" c="dimmed" fw={700}>
            Fees included ⓘ
          </Text>
        </Flex>
        <Group position="apart">
          <Text fz="md" fw={700} sx={{ lineHeight: 1 }}>
            {total.toString()}&nbsp;IMX
          </Text>
          <Text fz={10} fw={700} c="indigo">
            {(total * USD).toFixed(2)} USD
          </Text>
        </Group>

        <Button
          radius="xl"
          onClick={onBuyAllClick}
          loading={buying}
          variant="gradient"
          sx={{ marginTop: "1rem" }}
        >
          Buy All
        </Button>
      </Flex>
    </>
  );
}
