import {
  Alert,
  Center,
  Container,
  Flex,
  Grid,
  SimpleGrid,
  Skeleton,
  Text,
} from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { CollectionCard } from "../../components/CollectionCard/CollectionCard";
import { useRouter } from "next/router";
import { CHAIN_NAME, client } from "../../api/immutable";
import { NFTCard } from "../../components/NFTCard/NFTCard";
import { Web3Context } from "../../src/Web3ProviderContext";
import { Environment } from "@imtbl/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IconAlertCircle } from "@tabler/icons-react";

export default function NFTPage() {
  const router = useRouter();
  const { address } = router.query;
  // All the NFTS details within a collection
  const [NFTs, setNFTs] = useState([]);
  // Collection Data
  const [collection, setCollection] = useState(undefined);
  // All the listings within the collection
  const [listings, setListings] = useState([]);

  const { web3Provider, setWeb3Provider } = useContext(Web3Context);

  // const provider = new JsonRpcProvider("https://zkevm-rpc.dev.x.immutable.com");
  let oConfig = {
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    // provider: provider,
    // seaportContractAddress: "0xD66d6E2dbF68a3c9A50638782B352b3cd60D3f86",
    // zoneContractAddress: "0xa1A3A3c7605ef51cCbC70A2df7E87cCEE2A77e9e",
    // overrides: {
    //   apiEndpoint: "https://order-book-mr.sandbox.imtbl.com",
    //   chainName: CHAIN_NAME,
    // },
  };
  // const orderbookClient = new Orderbook(oConfig);

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
          contractAddress: String(address),
          status: "ACTIVE",
        });
        setListings(lres.result as any);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchData();
  }, []);

  if (collection === undefined) {
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

        console.log("signer", signer);
        console.log("address", address);
        console.log("orderId", (x as any).id);

        const { unsignedFulfillmentTransaction, unsignedApprovalTransaction } =
          await orderbookClient.fulfillOrder((x as any).id, address);

        // if (unsignedApprovalTransaction && unsignedFulfillmentTransaction) {
        //   const signedTx = await signer.signTransaction(
        //     unsignedApprovalTransaction
        //   );
        //   const receipt1 = await web3Provider.sendTransaction(signedTx);
        //   await receipt1.wait();
        //   const signedFulfillTx = await signer.signTransaction(
        //     unsignedApprovalTransaction
        //   );
        //   const receipt2 = await web3Provider.sendTransaction(signedFulfillTx);
        //   await receipt2.wait();
        // }
      } catch (error) {
        // Handle any errors that occur during the process
        console.error("An error occurred:", error);
      }
    };
    return nft === undefined
      ? undefined
      : Object.assign({}, x, nft, { onBuy }, { order_id: x.id });
  });

  const listingsWithDetails = listingsFull.filter(
    (listing) => listing !== undefined
  );
  console.log("FTS", NFTs);
  console.log(listingsWithDetails);

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
            <SimpleGrid cols={4}>
              {listingsWithDetails.map((x: any, index) => (
                <NFTCard key={`nft-${index}`} {...x} />
              ))}
            </SimpleGrid>
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
