import { useContext, useEffect, useState } from 'react'
import { makeStyles } from "@mui/styles";
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { Container, LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract, nftContract, isReady, network } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [isReady])
  async function loadNFTs() {
    if (!isReady) return
    const data = await marketplaceContract.fetchAvailableMarketItems()
    const items = await Promise.all(data.map(mapAvailableMarketItems(nftContract)))
    setNfts(items)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain />
  if (isLoading) return <LinearProgress />
  if (!isLoading && !nfts.length) return (<Container maxWidth="100%"><h1 style={{ color: 'white', padding: '15px' }}>No NFTs for Sale</h1></Container>)
  return (
    <Container maxWidth="100%">
      <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false} />
    </Container>
  )
}
