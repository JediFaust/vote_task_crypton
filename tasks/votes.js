const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("votes", "Votes of candidate")
  .addParam("address", "Address of candidate")
  .setAction(async (taskArgs) => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.getVotes(taskArgs.address)
    
    console.log(result)
  });