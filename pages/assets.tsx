import { Web3Context } from "@/Web3ProviderContext";
// import { Environment, Orderbook } from "@imtbl/sdk";
import { notifications } from "@mantine/notifications";
import { Environment, Orderbook } from "@imtbl/sdk";
import { Button, Container, TextInput, Title } from "@mantine/core";
import { providers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { CHAIN_NAME, client } from "../api/immutable";
import { NFTCard } from "../components/NFTCard/NFTCard";

export default function Assets() {
  const { web3Provider, setWeb3Provider } = useContext(Web3Context);

  const config = {
    baseConfig: { environment: Environment.SANDBOX },
    overrides: {
      provider: new providers.JsonRpcProvider(
        "https://zkevm-rpc.sandbox.x.immutable.com"
      ),
    },
  };
  const sdk = new Orderbook(config);
  // const offerer = "0x1E8dC77BEd0da06621e819fa0AFb59D50F76CfDf";
  const tokenAddress = "0xE0D4764D4081F38024c674b0Ea1e8fBf4f08b38F";
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState(0);

  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (!web3Provider) return;
    const fetchData = async () => {
      const address = await web3Provider.getSigner().getAddress();
      const response = await client.listNFTsByAccountAddress({
        chainName: CHAIN_NAME,
        accountAddress: address,
      });
      console.log("assets", response);
      setNfts(response.result as any);
    };
    fetchData();
  }, [web3Provider]);

  const onCreate = async (e: any) => {
    await createListing();
  };

  const createListing = async () => {
    if (!web3Provider) return;
    console.log("createlisting called!");

    const signer = web3Provider!.getSigner();
    const offerer = await signer.getAddress();

    console.log("get signer", signer);
    const listing = await sdk.prepareListing({
      makerAddress: offerer,
      buy: {
        amount: amount,
        type: "NATIVE",
      },
      sell: {
        contractAddress: tokenAddress,
        tokenId,
        type: "ERC721",
      },
    });
    console.log("preparelisted");

    // If the user hasn't yet approved the Immutable Seaport contract to transfer assets from this
    // collection on their behalf they'll need to do so before they create an order
    if (listing.unsignedApprovalTransaction) {
      const receipt = await signer.sendTransaction(
        listing.unsignedApprovalTransaction
      );
      await receipt.wait();
    }

    console.log("approved");

    const signature = await signer._signTypedData(
      listing.typedOrderMessageForSigning.domain,
      listing.typedOrderMessageForSigning.types,
      listing.typedOrderMessageForSigning.value
    );
    console.log("signmsg");

    const {
      result: { id: orderId },
    } = await sdk.createListing({
      orderComponents: listing.orderComponents,
      orderHash: listing.orderHash,
      orderSignature: signature,
    });
    if (orderId) {
      alert(orderId);
      notifications.show({
        title: "Order created",
        color: "green",
        icon: <IconCheck />,
        message: `Your order is created, you are awesome! orderId: ${orderId} 🤥`,
      });
    }
  };

  const onSell = () => {};

  return (
    <Container size="sm">
      <Title>My Inventory</Title>
      {nfts.map((x: any, index) => (
        <NFTCard key={`nft-${index}`} {...x} />
      ))}
    </Container>
  );
}
// <TextInput
//   placeholder="1000"
//   label="Token  id"
//   value={tokenId}
//   onChange={(e) => {
//     setTokenId(e.currentTarget.value);
//   }}
// />
// <TextInput
//   type="number"
//   placeholder="1000"
//   label="List amount"
//   value={amount}
//   onChange={(e) => {
//     setAmount(parseFloat(e.currentTarget.value || "0"));
//   }}
// />
// <Button onClick={onCreate} mt={12}>
//   Create
// </Button>
