import {
  Avatar,
  createStyles,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
} from "@mantine/core";
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

const useStyles = createStyles((theme) => ({
  control: {
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export function CollectionTable({ data }: CollectionTableProps) {
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
          <Avatar size="xl" src={item.image} radius={30} />
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
            <th>Updated At</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
