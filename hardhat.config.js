require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
require('solidity-coverage')
require('./tasks/start_vote.js')
require('./tasks/add_candidate.js')
require('./tasks/vote.js')
require('./tasks/end_vote.js')
require('./tasks/withdraw.js')
require('./tasks/voters.js')
require('./tasks/votes.js')
require('./tasks/votings_count.js')
require('./tasks/is_active.js')
require('./tasks/winner.js')
require('./tasks/winner_votes.js')

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "rinkeby",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    rinkeby: {
      url: process.env.URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4
    }
  },
};
