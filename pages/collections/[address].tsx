import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Alert,
  Center,
  Container,
  Grid,
  Group,
  Skeleton,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { CollectionCard } from "@/components/CollectionCard/CollectionCard";
import { blockChainSDK, CHAIN_NAME, orderbookSDK } from "@/sdk/immutable";
import { NFTCard } from "@/components/NFTCard/NFTCard";
import { Web3Context } from "@/contexts/Web3ProviderContext";
import { orderbook } from "@imtbl/sdk";
import { actionAll } from "@/sdk/orderbook";

export default function NFTPage() {
  const router = useRouter();
  const { address } = router.query;
  // All the NFTS details within a collection
  const [NFTs, setNFTs] = useState([]);
  const [collection, setCollection] = useState(undefined);

  // All the listings within the collection
  const [listings, setListings] = useState<orderbook.Order[] | undefined>(
    undefined
  );

  const { web3Provider } = useContext(Web3Context);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Collections
        const cres = await blockChainSDK.getCollection({
          chainName: CHAIN_NAME,
          contractAddress: String(address),
        });
        setCollection(cres.result as any);

        // NFTS
        const response = await blockChainSDK.listNFTs({
          chainName: CHAIN_NAME,
          contractAddress: String(address),
          pageSize: 200,
        });
        setNFTs(response.result as any);

        // Listings
        const lres = await orderbookSDK.listListings({
          status: orderbook.OrderStatus.ACTIVE,
          sellItemContractAddress: String(address),
        });

        let filteredListings = lres.result;
        if (web3Provider) {
          const signer = web3Provider!.getSigner();
          const userAddress = await signer.getAddress();
          filteredListings = lres.result.filter(
            (l) => l.accountAddress !== userAddress.toLocaleLowerCase()
          );
        }
        setListings(filteredListings as any);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchData();
  }, []);

  if (listings === undefined || collection === undefined) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  const listingsFull = listings.map((x: orderbook.Order) => {
    const nft = NFTs.find((n) => n.token_id === x.sell[0].tokenId);

    const onBuy = async () => {
      if (!web3Provider) {
        alert("Please sign in your wallet");
        return;
      }
      try {
        // Get the Signer or Wallet instance for the user fulfilling an open order
        const signer = web3Provider!.getSigner();
        const address = await signer.getAddress();

        console.log("Buying", x, address, signer);
        const fulfillResponse = await orderbookSDK.fulfillOrder(
          (x as any).id,
          address
        );
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
      }
    };
    return nft === undefined
      ? undefined
      : Object.assign({}, x, nft, { onClick: onBuy }, { order_id: x.id });
  });

  const listingsWithDetails = listingsFull.filter(
    (listing) => listing !== undefined
  );

  const { name, description, image, updated_at } = collection;

  return (
    <Container size="lg">
      <Grid>
        <Grid.Col xs={4}>
          <CollectionCard
            title={name}
            description={description}
            image={image}
            author={{
              image: "",
              name: `Created at ${new Date(updated_at).toLocaleString()}`,
            }}
          />
        </Grid.Col>
        <Grid.Col xs={8}>
          {listings.length > 0 ? (
            <Group>
              {listingsWithDetails.map((x: any, index) => (
                <NFTCard key={`nft-${index}`} {...x} />
              ))}
            </Group>
          ) : (
            <Center>
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Bummer!"
                color="gray"
                variant="filled"
              >
                No listings available! :(
                <Text>Come back and check again next time.</Text>
              </Alert>
            </Center>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
