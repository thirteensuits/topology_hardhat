require('@nomiclabs/hardhat-ethers'); // Add ethers plugin for Ethereum network interactions
const path = require('path');

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./stuff/contracts",
    artifacts: "./stuff/artifacts",
    cache: "./stuff/cache",
  },
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/demo", // Replace with your Infura project ID or another Sepolia RPC URL
    }
  },
};