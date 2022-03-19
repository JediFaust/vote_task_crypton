const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("start-vote", "Start voting")
  .setAction(async () => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.startVote()
    
    console.log(result)
  });