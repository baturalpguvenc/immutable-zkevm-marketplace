import React, { useContext, useEffect, useState } from "react";
import { Container, Group, Title } from "@mantine/core";

import { Web3Context } from "@/contexts/Web3ProviderContext";
import { NFTCard } from "@/components/NFTCard/NFTCard";
import { CHAIN_NAME, client } from "@/api/immutable";

export default function Assets() {
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
      <Title sx={{ marginBottom: "2rem" }}>My Inventory</Title>
      <Group>
        {nfts.map((x: any, index) => (
          <NFTCard key={`nft-${index}`} {...x} />
        ))}
      </Group>
    </Container>
  );
}
