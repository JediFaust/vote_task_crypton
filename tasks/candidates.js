const VotingArtifact = require('../artifacts/contracts/Voting.sol/Voting.json')
require('dotenv').config()

task("candidates", "List of candidates")
  .setAction(async () => {
    const [signer] = await hre.ethers.getSigners()
    const contractAddr = process.env.CONTRACT_ADDRESS

    const voteContract = new hre.ethers.Contract(
      contractAddr,
      VotingArtifact.abi,
      signer
    )

    const result = await voteContract.getCandidates()
    
    console.log(result)
  });