import React from "react";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { orderbook } from "@imtbl/sdk";
import { MARKETPLACE_FEE_RECIPIENT, USD, WEI } from "@/sdk/orderbook";

interface PriceInfoProps {
  fees: orderbook.Fee[];
  listing: orderbook.ERC20Item | orderbook.NativeItem;
}

export function PriceInfo({ fees, listing }: PriceInfoProps) {
  const royalty = fees.find((fee) => fee.type === orderbook.FeeType.ROYALTY);
  const protocol = fees.find((fee) => fee.type === orderbook.FeeType.PROTOCOL);
  const taker: orderbook.Fee = {
    type: orderbook.FeeType.TAKER_ECOSYSTEM,
    amount: ((3 / 100) * Number(listing.amount)).toString(),
    recipient: MARKETPLACE_FEE_RECIPIENT,
  };
  const total =
    (Number(listing.amount) +
      (Number(protocol?.amount) ?? 0) +
      (Number(royalty?.amount) ?? 0) +
      (Number(taker?.amount) ?? 0)) /
    WEI;

  return (
    <Tooltip
      label={
        <Stack spacing="xss">
          <Group position="apart">
            <Text>Base :</Text>
            <Text>{Number(listing.amount) / WEI}</Text>
          </Group>
          {protocol && (
            <Group position="apart">
              <Text>Protocol fee:</Text>
              <Text>{Number(protocol.amount) / WEI}</Text>
            </Group>
          )}
          {royalty && (
            <Group position="apart">
              <Text>Royalty fee:</Text>
              <Text>{Number(royalty.amount) / WEI}</Text>
            </Group>
          )}
          {taker && (
            <Group position="apart">
              <Text>Taker fee:</Text>
              <Text>{Number(taker.amount) / WEI}</Text>
            </Group>
          )}
          <Group position="apart">
            <Text>Total:</Text>
            <Text>{total}</Text>
          </Group>
        </Stack>
      }
    >
      <Stack align="stretch" spacing="xss">
        <Text fz={8} tt="uppercase" c="dimmed" fw={700}>
          Fees included ⓘ
        </Text>
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
          {listing.type === "NATIVE" ? "IMX" : listing.type}&nbsp;
        </Text>
        <Group position="apart">
          <Text fz="md" fw={700} sx={{ lineHeight: 1 }}>
            {total.toString()}&nbsp;
          </Text>
          <Text fz={10} fw={700} c="indigo">
            {(total * USD).toFixed(2)} USD
          </Text>
        </Group>
      </Stack>
    </Tooltip>
  );
}
