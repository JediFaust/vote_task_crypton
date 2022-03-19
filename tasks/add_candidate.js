const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("add-candidate", "Add candidate to voting")
  .addParam("address", "Address of candidate")
  .setAction(async (taskArgs) => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.addCandidate(taskArgs.address)
    
    console.log(result)
  });