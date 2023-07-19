import { Alert, Center, Container, Grid, Skeleton, Text } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { CollectionCard } from "../../components/CollectionCard/CollectionCard";
import { useRouter } from "next/router";
import { CHAIN_NAME, client } from "../../api/immutable";
import { NFTCard } from "../../components/NFTCard/NFTCard";
import { Web3Context } from "../../src/Web3ProviderContext";
import { Environment, Orderbook } from "@imtbl/sdk";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { providers } from "ethers";
import { notifications } from "@mantine/notifications";

export default function NFTPage() {
  const router = useRouter();
  const { address } = router.query;
  // All the NFTS details within a collection
  const [NFTs, setNFTs] = useState([]);
  // Collection Data
  const [collection, setCollection] = useState(undefined);
  // All the listings within the collection
  const [listings, setListings] = useState(undefined);

  const { web3Provider, setWeb3Provider } = useContext(Web3Context);

  const orderbookClient = new Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    overrides: {
      provider: new providers.JsonRpcProvider(
        "https://zkevm-rpc.sandbox.x.immutable.com"
      ),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Collection
        const cres = await client.getCollection({
          chainName: CHAIN_NAME,
          contractAddress: String(address),
        });
        console.log(cres.result);
        setCollection(cres.result as any);
        // NFTS
        const response = await client.listNFTs({
          chainName: CHAIN_NAME,
          contractAddress: String(address),
          pageSize: 200,
        });
        setNFTs(response.result as any);
        // Listings
        const lres = await orderbookClient.listListings({
          chainName: CHAIN_NAME,
          status: "ACTIVE",
          contractAddress: String(address),
        });
        console.log(lres);
        setListings(lres.result as any);
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

  const listingsFull = listings.map((x) => {
    const nft = NFTs.find((n) => n.token_id === x.sell[0].token_id);

    const onBuy = async () => {
      if (!web3Provider) {
        alert("Please sign in your wallet");
        return;
      }
      try {
        console.log(web3Provider);
        // Get the Signer or Wallet instance for the user fulfilling an open order
        const signer = web3Provider!.getSigner();
        const address = await signer.getAddress();

        console.log("Buying", x, address, signer);
        const fulfillResponse = await orderbookClient.fulfillOrder(
          (x as any).id,
          address
        );
        const { unsignedFulfillmentTransaction } = fulfillResponse;
        if (unsignedFulfillmentTransaction) {
          // signer.sendTransaction()
          // const signedFulfillTx = await signer.signTransaction(
          //   unsignedFulfillmentTransaction
          // );
          unsignedFulfillmentTransaction.value =
            unsignedFulfillmentTransaction.value.toHexString();

          unsignedFulfillmentTransaction.gasLimit =
            unsignedFulfillmentTransaction.gasLimit.toHexString();

          console.log("fulfilled", unsignedFulfillmentTransaction);

          const receipt = await web3Provider.send("eth_sendTransaction", [
            unsignedFulfillmentTransaction,
          ]);

          // const receipt = await web3Provider.sendTransaction(
          //   unsignedFulfillmentTransaction
          // );
          // const result = await receipt.wait();
          notifications.show({
            title: "NFT Purchased!",
            color: "green",
            icon: <IconCheck />,
            message: `NFT Purchased, you are awesome! transactionHash: ${receipt} 🤥`,
            onClose: () => {
              router.reload();
            },
          });
        }
      } catch (error) {
        // Handle any errors that occur during the process
        console.error("An error occurred:", error);
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
            <Container>
              {listingsWithDetails.map((x: any, index) => (
                <NFTCard key={`nft-${index}`} {...x} />
              ))}
            </Container>
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
