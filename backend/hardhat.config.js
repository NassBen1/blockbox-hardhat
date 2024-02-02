require("@nomicfoundation/hardhat-toolbox");

// Go to https://alchemy.com/, sign up, create a new App in
// its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = "xgEtz-rfGufncLy5hG2hlpbPLUns_1VL";

// Replace this private key with your Sepolia account private key
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = "7ae7bb383ac2c2a8d38b9ba3d385298fe78c2a5cd5aed17782e4726c4806897d";

module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }, // Ajout de la virgule ici
  paths: {
    artifacts: './artifacts/contract',
  },
  allowUnlimitedContractSize: true,
};

