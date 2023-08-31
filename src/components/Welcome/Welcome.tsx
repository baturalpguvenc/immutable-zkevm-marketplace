import React, { useEffect, useState } from "react";
import { Container, createStyles, SimpleGrid, Skeleton } from "@mantine/core";
import { Text, Title } from "@mantine/core";

import { blockChainSDK, CHAIN_NAME } from "@/sdk/immutable";
import { CollectionButton } from "../CollectionButton/CollectionButton";

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
  const [collections, setCollections] = useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await blockChainSDK.listCollections({
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
      <Title className={classes.title} align="center" mt={50}>
        <Text inherit variant="gradient" component="span" color="pink">
          Marketplace
        </Text>
      </Title>
      <Text
        tt="capitalize"
        align="center"
        size="lg"
        fw="700"
        sx={{ maxWidth: 580 }}
        mx="auto"
        mt="xl"
        mb="sm"
      >
        Your marketplace collections
      </Text>
      <Container size="lg">
        {collections.length > 0 ? (
          <SimpleGrid cols={3}>
            {collections.map((c: any, index: number) => (
              <CollectionButton
                key={`col-${index}`}
                contractAddress={c.contract_address}
                image={c.image}
                description={c.description}
                name={c.name}
                updatedAt={c.updated_at}
              />
            ))}
          </SimpleGrid>
        ) : (
          <>
            <Skeleton height={50} circle mb="xl" />
            <Skeleton height={8} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} width="70%" radius="xl" />
          </>
        )}
      </Container>
    </>
  );
}
