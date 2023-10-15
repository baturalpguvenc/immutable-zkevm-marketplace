import React, { useContext, useEffect, useState } from "react";
import { Container, Group, Title } from "@mantine/core";

import { Web3Context } from "@/contexts/Web3ProviderContext";
import { NFTCard } from "@/components/NFTCard/NFTCard";
import { blockChainSDK, CHAIN_NAME } from "@/sdk/immutable";

export default function Assets() {
  const { web3Provider, userAddress } = useContext(Web3Context);

  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (!web3Provider || !userAddress) return;
    const fetchData = async () => {
      const response = await blockChainSDK.listNFTsByAccountAddress({
        chainName: CHAIN_NAME,
        accountAddress: userAddress!,
      });
      setNfts(response.result as any);
    };
    fetchData();
  }, [web3Provider, userAddress]);

  return (
    <Container size="sm">
      <Title size="h1" sx={{ marginBottom: "1.5rem" }}>
        Inventory
      </Title>
      <Group>
        {nfts.map((x: any, index) => (
          <NFTCard key={`nft-${index}`} {...x} />
        ))}
      </Group>
    </Container>
  );
}
