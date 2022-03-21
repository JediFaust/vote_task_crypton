
<h1 align="center"><b>Voting Smart Contract</b></h3>

<div align="left">


[![Language](https://img.shields.io/badge/language-solidity-orange.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

</div>

---

<p align="center"><h2 align="center"><b>Solidity Smart contract for voting among candidates
    </h2></b><br> 
</p>

## 📝 Table of Contents

- [Installing](#install)
- [Contract Functions](#functions)
- [View Functions](#views)
- [Deploy & Test Scripts](#scripts)
- [HardHat Tasks](#tasks)

## 🚀 Installing <a name = "install"></a>
- Deploy contract running on console:
```shell
node scripts/deploy.js
```
- Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS
- Start voting running command:
```shell
npx hardhat start-vote
```
- Add candidates and let them vote




## ⛓️ Contract Functions <a name = "functions"></a>

- **startVote()**
>Starting new vote<br>Can be called only by <b>Owner  </b>

- **addCandidate(address)**
>Adding new <b>Candidate</b><br>Can be called only by <b>Owner  </b>

- **vote(address)**
>Voting for provided address<br>
Must provide <b>0.01 ETH</b> as value<br>Can be called only by <b>Candidate</b> <br>
Provided address should be <b>Candidate</b>

- **endVote()**
>Ending active vote<br>Can be called by <b>anyone</b> <br>
Can be executed only after <b>3</b> days from starting date<br>
Sends 90% of all collected amount to the <b>Winner</b>

- **withdraw(address)**
>Sends left commission to provided address<br>Can be called only by <b>Owner</b> <br>
Can be executed only after ending vote<br>

## ⛓️ View Functions <a name = "views"></a>

- **getCandidates()**
>Returns list of unique candidates<br>

- **getVotes(address)**
>Returns votes of provided address<br>

- **getWinner()**
>Returns address of <b>Winner</b><br>

- **getWinnerVotes()**
>Returns votes of <b>Winner</b><br>

## 🎈 Deploy & Test Scripts <a name = "scripts"></a>

```shell
node scripts/deploy.js --network rinkeby
npx hardhat test
npx hardhat coverage --testfiles "test/*.js"
```


## 💡 HardHat Tasks <a name = "tasks"></a>


```shell
npx hardhat start-vote
npx hardhat add-candidate --address
npx hardhat vote --address
npx hardhat end-vote
npx hardhat withdraw --address
npx hardhat candidates
npx hardhat votes --address
npx hardhat winner
npx hardhat winner-votes
```

