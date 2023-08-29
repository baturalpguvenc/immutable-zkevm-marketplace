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
  Tooltip,
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
  onClick?: () => Promise<void>;
}

const WEI = 1e18;
const USD = 1644.21;

// Placeholder marketplace fee recipient address
const MARKETPLACE_FEE_RECIPIENT = "0x3e290FE8F2A5dB60A81cb47EA296e0299048Dd71";

export function NFTCard({
  token_id,
  contract_address,
  name,
  description,
  image,
  buy,
  fees,
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

  const royalty = fees.find((fee) => fee.type === orderbook.FeeType.ROYALTY);
  const protocol = fees.find((fee) => fee.type === orderbook.FeeType.PROTOCOL);
  const maker: orderbook.Fee = {
    type: orderbook.FeeType.MAKER_MARKETPLACE,
    amount: ((3 / 100) * Number(listing.amount)).toString(),
    recipient: MARKETPLACE_FEE_RECIPIENT,
  };
  const total =
    (Number(listing.amount) +
      (Number(protocol?.amount) ?? 0) +
      (Number(royalty?.amount) ?? 0) +
      (Number(maker?.amount) ?? 0)) /
    WEI;

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
      <Image
        src={image ?? "https://cdn-icons-png.flaticon.com/512/6230/6230226.png"}
        alt={description}
      />
      <Card.Section className={classes.section}>
        <Group position="apart" sx={{ minHeight: 55 }}>
          <Text fw={500}>{name ?? "Unnamed"}</Text>
          {description && (
            <Text fz="xs" c="dimmed">
              {description ?? "No description"}
            </Text>
          )}
        </Group>
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
              {maker && (
                <Group position="apart">
                  <Text>Maker fee:</Text>
                  <Text>{Number(maker.amount) / WEI}</Text>
                </Group>
              )}
              <Group position="apart">
                <Text>Total:</Text>
                <Text>{total}</Text>
              </Group>
            </Stack>
          }
        >
          <Stack align="stretch" spacing="xss" mb="sm">
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
        {buy ? (
          <Button
            radius="xl"
            onClick={handleClick}
            loading={buying}
            variant="gradient"
            fullWidth
          >
            Buy now
          </Button>
        ) : (
          <>
            <Button
              variant="gradient"
              radius="xl"
              style={{ flex: 1 }}
              onClick={toggle}
            >
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
