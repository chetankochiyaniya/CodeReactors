const hre = require("hardhat");

async function setupMarket(marketplaceAddress, nftAddress) {
  const networkName = hre.network.name.toUpperCase();
  marketplaceAddress = marketplaceAddress || process.env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`];
  nftAddress = nftAddress || process.env[`NFT_CONTRACT_ADDRESS_${networkName}`];
}

async function main() {
  if (process.env.IS_RUNNING) return;
  await setupMarket();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

module.exports = {
  setupMarket: setupMarket,
};