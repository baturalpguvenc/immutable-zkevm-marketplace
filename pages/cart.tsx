import React, { SetStateAction, useContext, useEffect, useState, Dispatch } from "react";
import {
  Container,
  Group,
  Title,
  Card,
  rem,
  createStyles,
  Image,
  Stack,
  Text,
  Button,
} from "@mantine/core";

import { Web3Context } from "@/contexts/Web3ProviderContext";
import { NFTCard } from "@/components/NFTCard/NFTCard";
import { blockChainSDK, CHAIN_NAME } from "@/sdk/immutable";
import { CartContext } from "@/contexts/CartContext";
import { orderbook } from "@imtbl/sdk";
import { PriceInfo } from "@/components/PriceInfo/PriceInfo";
import { Orders } from "../src/contexts/CartContext"
import { Checkout } from "../src/components/Checkout/Checkout"

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    maxWidth: rem(200),
  },

  section: {
    padding: theme.spacing.sm,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}));

export default function Cart() {
  const { orders, setOrders } = useContext(CartContext);

  return (
      <Container size="sm">
        <Title size="h1" sx={{ marginBottom: "1.5rem" }}>
          Shopping Cart
        </Title>
        <Group>
          {orders.length === 0 && <Text size="h2">Nothing here yet, add some NFTs to the cart!</Text>}
          {orders.map((o, i) => (
            <CartEntry {...o} key={`order-${i}`} setOrders={setOrders} />
          ))}
        </Group>
        <Checkout orders={orders} />
      </Container>
  );
}

function CartEntry({
  orderId,
  name,
  description,
  image,
  fees,
  buy,
  setOrders,
}: {
  orderId: string;
  name: string;
  description: string;
  image: string;
  fees: orderbook.Fee[];
  buy: orderbook.ERC20Item[] | orderbook.NativeItem[];
  setOrders: Dispatch<SetStateAction<Orders>> | undefined;
}) {
  const { classes } = useStyles();

  const removeCartItem = () => {
    if (setOrders) {
      setOrders((orders) => {
        let i = -1;
        orders.map((o, j) => {
          if (o.orderId === orderId) {
            i = j;
          }
        });

        if (i > -1) {
          orders.splice(i, 1);
        }

        return [...orders];
      });
    }
  };

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section>
        <Image
          src={
            image ?? "https://cdn-icons-png.flaticon.com/512/6230/6230226.png"
          }
          alt={description}
          fit="fill"
        />
      </Card.Section>
      <Card.Section className={classes.section}>
        <Stack spacing="sm">
          <Group position="apart" sx={{ minHeight: 50 }}>
            <Text fw={500}>{name ?? "Unnamed"}</Text>
            {description && (
              <Text fz="xs" c="dimmed">
                {description ?? "No description"}
              </Text>
            )}
          </Group>
        </Stack>
      </Card.Section>
      <PriceInfo fees={fees} listing={buy[0]} />
      <Button radius="xl" onClick={removeCartItem} variant="gradient" fullWidth sx={{ marginTop: "1rem" }}>
        Remove
      </Button>
    </Card>
  );
}
