const hre = require("hardhat");
const ethers = hre.ethers

async function main() {

  const [signer] = await ethers.getSigners()

  const Voting = await hre.ethers.getContractFactory("Voting", signer);
  const vote = await Voting.deploy();

  await vote.deployed();

  console.log("Voting contract deployed to:", vote.address); // Save this address to .env file
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });