import {
  Badge,
  Button,
  Card,
  Center,
  createStyles,
  Group,
  Image,
  rem,
  SimpleGrid,
  Text,
} from "@mantine/core";
import {
  IconGasStation,
  IconGauge,
  IconManualGearbox,
  IconUsers,
} from "@tabler/icons-react";
import { Wallet } from "ethers";
import React from "react";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    maxWidth: rem(300),
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

const mockdata = [
  { label: "4 passengers", icon: IconUsers },
  { label: "100 km/h in 4 seconds", icon: IconGauge },
  { label: "Automatic gearbox", icon: IconManualGearbox },
  { label: "Electric", icon: IconGasStation },
];

interface NFTCardProps {
  token_id: string;
  name: string;
  description: string;
  image: string;
}

export function NFTCard({
  token_id,
  name,
  description,
  image,
  buy,
  onBuy,
}: NFTCardProps) {
  const { classes } = useStyles();
  const [listing] = buy;

  const handleBuy = () => {
    onBuy();
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
        <div>
          <Text fw={500}>{name ?? "Unnamed"}</Text>
          <Text fz="xs" c="dimmed">
            {description ?? "No description"}
          </Text>
          <Badge variant="outline">New</Badge>
        </div>
      </Group>

      <Card.Section className={classes.section}>
        <Group spacing={10}>
          <SimpleGrid cols={2}>
            <Text fz="xl" fw={700} sx={{ lineHeight: 1 }}>
              {listing.start_amount}
            </Text>
            <Text fz="sm" c="dimmed" fw={500} sx={{ lineHeight: 1.5 }} ml="md">
              {listing.item_type === "NATIVE" ? "IMX" : listing.item_type}
            </Text>
          </SimpleGrid>

          <Button radius="xl" style={{ flex: 1 }} onClick={handleBuy}>
            Buy now
          </Button>
        </Group>
      </Card.Section>
    </Card>
  );
}
