const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("vote", "Vote to candidate")
  .addParam("address", "Address to vote")
  .setAction(async (taskArgs) => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.vote(taskArgs.address, { value: "10000000000000000" })
    
    console.log(result)
  });