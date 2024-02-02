const { ethers } = require("hardhat");

async function main() {
  // Déployer le contrat
  const DecentralizedSocialNetwork = await ethers.getContractFactory("DecentralizedSocialNetwork");
  const socialMedia = await DecentralizedSocialNetwork.deploy();

  console.log("DecentralizedSocialNetwork deployed to:", socialMedia.address);
}

// Utilisation de la fonction main pour déployer le contrat
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

