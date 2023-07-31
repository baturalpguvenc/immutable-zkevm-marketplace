import React, { useEffect, useState } from "react";
import { Container, createStyles } from "@mantine/core";
import { Text, Title } from "@mantine/core";

import { CollectionTable } from "@/components/CollectionTable/CollectionTable";
import { CHAIN_NAME, client } from "@/api/immutable";

const style = createStyles((theme: any) => ({
  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontSize: 100,
    fontWeight: 900,
    letterSpacing: -2,

    [theme.fn.smallerThan("md")]: {
      fontSize: 50,
    },
  },
}));

export function Welcome() {
  const { classes } = style();
  const [collections, setCollections] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.listCollections({
          chainName: CHAIN_NAME,
        });
        setCollections(response.result);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Title className={classes.title} align="center" mt={100}>
        <Text inherit variant="gradient" component="span" color="pink">
          Marketplace
        </Text>
      </Title>
      <Text
        color="dimmed"
        align="center"
        size="lg"
        sx={{ maxWidth: 580 }}
        mx="auto"
        mt="xl"
      >
        Your marketplace
      </Text>
      <Container size="lg">
        <CollectionTable data={collections} />
      </Container>
    </>
  );
}
