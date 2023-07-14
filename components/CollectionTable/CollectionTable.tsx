import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  createStyles,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React from "react";

interface CollectionTableProps {
  data: {
    image: string;
    name: string;
    description: string;
    updated_at: string;
    contract_address: string;
  }[];
}

// const jobColors: Record<string, string> = {
//   engineer: "blue",
//   manager: "cyan",
//   designer: "pink",
// };
//
//
const useStyles = createStyles((theme) => ({
  control: {
    // width: "100%",
    // padding: `${theme.spacing.xs} ${theme.spacing.md}`,

    "&:hover": {
      // backgroundColor:
      //   theme.colorScheme === "dark"
      //     ? theme.colors.dark[6]
      //     : theme.colors.gray[0],
      cursor: "pointer",
    },
  },
}));

const pickRandomString = () => {
  const strings = [
    "https://image-resizer-cache.dev.immutable.com/url=aHR0cHM6Ly9hcGkuaWxsdXZpdW0tZ2FtZS5pby9nYW1lZGF0YS9pbGx1dml0YXJzL3BvcnRyYWl0LzE0MDE0Mi9yZW5kZXI=&w=1024",
    "https://image-resizer-cache.dev.immutable.com/url=aHR0cHM6Ly9hcGkuaWxsdXZpdW0tZ2FtZS5pby9nYW1lZGF0YS9pbGx1dml0YXJzL3BvcnRyYWl0LzM0NTExMi9yZW5kZXI=&w=1024",
    "https://image-resizer-cache.dev.immutable.com/url=aHR0cHM6Ly9hcGkuaWxsdXZpdW0tZ2FtZS5pby9nYW1lZGF0YS9pbGx1dml0YXJzL3BvcnRyYWl0LzI0MTkxNi9yZW5kZXI=&w=1024",
    "https://image-resizer-cache.dev.immutable.com/url=aHR0cHM6Ly9hcGkuaWxsdXZpdW0tZ2FtZS5pby9nYW1lZGF0YS9pbGx1dml0YXJzL3BvcnRyYWl0LzIwNTQxMC9yZW5kZXI=&w=1024",
  ];

  const randomIndex = Math.floor(Math.random() * strings.length);
  return strings[randomIndex];
};

function getRandomVolume() {
  const currencies = ["ETH", "IMX"];
  const randomCurrency =
    currencies[Math.floor(Math.random() * currencies.length)];

  const min = 0.01;
  const max = randomCurrency === "ETH" ? 200 : 7.32;
  const randomValue = Math.random() * (max - min) + min;

  return `${randomValue.toFixed(2)} ${randomCurrency}`;
}

function getRandomFloorPrice() {
  const currencies = ["ETH", "IMX"];
  const randomCurrency =
    currencies[Math.floor(Math.random() * currencies.length)];

  const min = 0.01;
  const max = randomCurrency === "ETH" ? 1 : 0.5;
  const randomValue = Math.random() * (max - min) + min;

  if (randomValue < 0.01) {
    return "< 0.01 " + randomCurrency;
  }

  return `${randomValue.toFixed(2)} ${randomCurrency}`;
}

export function CollectionTable({ data }: CollectionTableProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const router = useRouter();

  const handleRowClick = (contractAddress: string) => {
    router.push(`/collections/${contractAddress}`);
  };

  const rows = data.map((item, index) => (
    <tr
      key={item.name + index}
      className={classes.control}
      onClick={() => handleRowClick(item.contract_address)}
    >
      <td>
        <Group spacing="sm">
          <Avatar
            size="xl"
            src={item.image ?? pickRandomString()}
            radius={30}
          />
        </Group>
      </td>

      <td>
        <Stack>
          <Text fz="xl" variant="text" fw={500}>
            {item.name}
          </Text>
          <Text variant="dimmed">{item.description}</Text>
        </Stack>
      </td>
      <td>
        <Text fw={600}>{getRandomFloorPrice()}</Text>
      </td>
      <td>
        <Text fw={600}>{getRandomVolume()}</Text>
      </td>
      <td>{new Date(item.updated_at).toLocaleDateString()}</td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table
        sx={{ minWidth: 800 }}
        verticalSpacing="sm"
        highlightOnHover={true}
      >
        <thead>
          <tr>
            <th>Collection</th>
            <th>Description</th>
            <th>Floor Price</th>
            <th>Volume</th>
            <th>Updated At</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
