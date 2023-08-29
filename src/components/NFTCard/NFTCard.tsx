import { Web3Context } from "@/contexts/Web3ProviderContext";
import {
  Badge,
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
import { actionAll } from "@/sdk/orderbook";

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
    padding: theme.spacing.md,
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
  // If listing buy item is not null
  buy?: orderbook.ERC20Item[] | orderbook.NativeItem[];
  onClick?: () => Promise<void>;
}

const WEI = 1e18;

export function NFTCard({
  token_id,
  contract_address,
  name,
  description,
  image,
  buy,
  onClick,
}: NFTCardProps) {
  const { classes } = useStyles();
  const [listing] = buy || [];
  const [opened, { toggle, close }] = useDisclosure(false);
  const [amount, setAmount] = useState(0.001);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const theme = useMantineTheme();
  const { web3Provider } = useContext(Web3Context);

  const handleClick = async () => {
    setBuying(true);
    if (onClick) {
      await onClick();
    }
    setBuying(false);
  };

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
      <Card.Section className={classes.imageSection} sx={{ minHeight: 170 }}>
        <Image
          src={
            image ?? "https://cdn-icons-png.flaticon.com/512/6230/6230226.png"
          }
          alt={description}
        />
      </Card.Section>
      <Group position="apart" mt="md" mb="md" sx={{ minHeight: 125 }}>
        <Text fw={500}>{name ?? "Unnamed"}</Text>
        <Text fz="xs" c="dimmed">
          {description ?? "No description"}
        </Text>
        <Badge variant="outline">New</Badge>
      </Group>
      <Card.Section className={classes.section}>
        {buy ? (
          <Group spacing={10}>
            <Stack>
              <Text fz="md" fw={700} sx={{ lineHeight: 1 }}>
                {(Number(listing.amount) / WEI).toString()}&nbsp;
                {listing.type === "NATIVE" ? "IMX" : listing.type}
              </Text>
              <Text
                fz="sm"
                c="dimmed"
                fw={500}
                sx={{ lineHeight: 1.5 }}
                ml="md"
              ></Text>
            </Stack>

            <Button
              radius="xl"
              style={{ flex: 1 }}
              onClick={handleClick}
              loading={buying}
            >
              Buy now
            </Button>
          </Group>
        ) : (
          <>
            <Button radius="xl" style={{ flex: 1 }} onClick={toggle}>
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
      </Card.Section>
    </Card>
  );
}
