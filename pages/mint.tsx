import { Web3Context } from "@/Web3ProviderContext";
import { Container, Title } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { CHAIN_NAME, client } from "../api/immutable";
import { NFTCard } from "../components/NFTCard/NFTCard";

export default function Mint() {
  const { web3Provider } = useContext(Web3Context);

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

  return (
    <Container size="sm">
      <Title>My Inventory</Title>
      {nfts.map((x: any, index) => (
        <NFTCard key={`nft-${index}`} {...x} />
      ))}
    </Container>
  );
}
