const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("start-vote", "Start voting")
  .addParam("candidates", "Address of candidates separated by , comma")
  .setAction(async (taskArgs) => {
    let candidatesList = taskArgs.candidates.split(',')

    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.startVoting(candidatesList)
    
    
    console.log(result)
  });