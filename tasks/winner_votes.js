const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("winner-votes", "Current winner's votes")
  .setAction(async () => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.getWinnerVotes()
    
    console.log(result)
  });