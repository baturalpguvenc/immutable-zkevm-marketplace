import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Alert,
  Center,
  Container,
  Grid,
  Group,
  Skeleton,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconMessageCircle,
  IconPhoto,
  IconSettings,
} from "@tabler/icons-react";

import { CollectionCard } from "@/components/CollectionCard/CollectionCard";
import { blockChainSDK, CHAIN_NAME, orderbookSDK } from "@/sdk/immutable";
import { NFTCard } from "@/components/NFTCard/NFTCard";
import { Web3Context } from "@/contexts/Web3ProviderContext";
import { orderbook } from "@imtbl/sdk";
import { actionAll } from "@/sdk/orderbook";
import { CollectionInfo } from "@/components/CollectionInfo/CollectionInfo";

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

  console.log(listings, collection);
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
    <Container size="md">
      <Stack>
        <CollectionInfo
          title="Collection"
          name={name}
          description={description}
          avatar={image}
          created={`Created at ${new Date(updated_at).toLocaleString()}`}
        />
        <Grid>
          <Grid.Col xs={12}>
            <Tabs radius="md" defaultValue="gallery">
              <Tabs.List>
                <Tabs.Tab value="gallery" icon={<IconPhoto size="0.8rem" />}>
                  Listings
                </Tabs.Tab>
                <Tabs.Tab
                  value="messages"
                  icon={<IconMessageCircle size="0.8rem" />}
                >
                  Offers
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="gallery" pt="xs">
                {listingsWithDetails.length > 0 ? (
                  <Group mt="sm">
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
              </Tabs.Panel>

              <Tabs.Panel value="messages" pt="xs">
                Offers coming soon!
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
