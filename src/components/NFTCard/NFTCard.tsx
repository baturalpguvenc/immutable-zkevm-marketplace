import { Web3Context } from "@/contexts/Web3ProviderContext";
import {
  Button,
  Card,
  createStyles,
  Group,
  Image,
  Modal,
  rem,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import React, { useContext, useState } from "react";
import { orderbookSDK } from "@/sdk/immutable";
import { orderbook } from "@imtbl/sdk";
import { notifications } from "@mantine/notifications";
import { actionAll, MARKETPLACE_FEE_RECIPIENT, WEI } from "@/sdk/orderbook";
import { PriceInfo } from "../PriceInfo/PriceInfo";
import router from "next/router";
import { CartContext } from "@/contexts/CartContext";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    maxWidth: rem(200),
  },

  imageSection: {
    padding: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  label: {
    marginBottom: theme.spacing.xs,
    lineHeight: 1,
    fontWeight: 700,
    fontSize: theme.fontSizes.xs,
    letterSpacing: rem(-0.25),
    textTransform: "uppercase",
  },

  section: {
    padding: theme.spacing.sm,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  icon: {
    marginRight: rem(5),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },
}));

interface NFTCardProps {
  token_id: string;
  contract_address: string;
  name: string;
  description: string;
  image: string;
  fees: orderbook.Fee[];
  // If listing buy item is not null
  buy?: orderbook.ERC20Item[] | orderbook.NativeItem[];
  // order id (optional)
  id?: string;
}

export function NFTCard({
  token_id,
  contract_address,
  name,
  description,
  image,
  buy,
  id,
  fees = [],
}: NFTCardProps) {
  const { orders, setOrders } = useContext(CartContext)
  const { classes } = useStyles();
  const [listing] = buy || [];
  const [opened, { toggle, close }] = useDisclosure(false);
  const [amount, setAmount] = useState(0.001);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const theme = useMantineTheme();
  const { web3Provider, userAddress } = useContext(Web3Context);

  const buyListing = async () => {
    if (!web3Provider) {
      alert("Please sign in your wallet");
      return;
    }
    try {
      setBuying(true);
      // Get the Signer or Wallet instance for the user fulfilling an open order
      const signer = web3Provider!.getSigner();
      const address = await signer.getAddress();

      console.log("Buying", id, address, signer);
      const fulfillResponse = await orderbookSDK.fulfillOrder(id!, address, [
        {
          recipient: MARKETPLACE_FEE_RECIPIENT,
          amount: ((3 / 100) * Number(listing.amount)).toString(),
        },
      ]);
      const { actions } = fulfillResponse;
      const result = await actionAll(actions, signer, web3Provider);
      notifications.show({
        title: "NFT Purchased!",
        color: "green",
        icon: <IconCheck />,
        message: `NFT Purchased, you are awesome! transactionHash: ${result} 🤥`,
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

  const addListingToCart = async () => {
    console.log(`Adding listing ${id} to cart`)

    if (setOrders) {
      if (orders.find(o => o.orderId === id)) {
        notifications.show({
          title: "Order already in cart!",
          color: "red",
          icon: <IconCheck />,
          message: `Order is already in the shopping cart! 🤥`,
        }); 

        return;
      }
      setOrders(o => [...o, {
        // orderId must be defined if this function can be called
        orderId: id!,
        name: name,
        description: description,
        image: image,
        fees: fees,
        buy: buy!,
      }])

      notifications.show({
        title: "Order Added to Cart",
        color: "green",
        icon: <IconCheck />,
        message: `Your order is added to cart, you are awesome! orderId: ${id} 🤥`,
      });
    }
  }

  const createListing = async () => {
    if (!web3Provider) return;
    try {
      setLoading(true);
      const signer = web3Provider!.getSigner();
      const offerer = await signer.getAddress();
      const { actions, orderComponents, orderHash } =
        await orderbookSDK.prepareListing({
          makerAddress: offerer,
          buy: {
            amount: (amount * WEI).toString(),
            type: "NATIVE",
          },
          sell: {
            contractAddress: contract_address,
            tokenId: token_id,
            type: "ERC721",
          },
        });
      console.log("Prepare listing", contract_address, token_id);

      const [signature] = await actionAll(actions, signer, web3Provider);

      const {
        result: { id: orderId },
      } = await orderbookSDK.createListing({
        orderComponents: orderComponents,
        orderHash: orderHash,
        orderSignature: signature,
        makerFees: [],
      });
      if (orderId) {
        setLoading(false);
        toggle();
        notifications.show({
          title: "Order created",
          color: "green",
          icon: <IconCheck />,
          message: `Your order is created, you are awesome! orderId: ${orderId} 🤥`,
        });
      }
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      notifications.show({
        title: "Order failed to create",
        color: "red",
        icon: <IconExclamationCircle />,
        message: `Your order has failed to create, ${error} 🤥`,
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
          {listing && <PriceInfo fees={fees} listing={listing} />}
          {buy ? (
            <>
            <Button
              radius="xl"
              disabled={!userAddress}
              onClick={buyListing}
              loading={buying}
              variant="gradient"
              fullWidth
            >
              Buy now
            </Button>
            <Button
              radius="xl"
              disabled={!userAddress}
              onClick={addListingToCart}
              loading={buying}
              variant="gradient"
              fullWidth
            >
              Add to cart
            </Button>
            </>
          ) : (
            <>
              <Button variant="gradient" radius="xl" onClick={toggle} fullWidth>
                Sell
              </Button>
              <Modal
                opened={opened}
                onClose={close}
                title="List NFT"
                overlayProps={{
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[9]
                      : theme.colors.gray[2],
                  opacity: 0.55,
                  blur: 3,
                }}
              >
                <TextInput
                  type="number"
                  placeholder="0.001"
                  label="Sell amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(parseFloat(e.currentTarget.value || "0"));
                  }}
                />
                <Button onClick={createListing} mt={12} loading={loading}>
                  List NFT
                </Button>
              </Modal>
            </>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
}
