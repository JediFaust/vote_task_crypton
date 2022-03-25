const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Vote", function() {
    let signer
    let acc1
    let acc2
    let acc3
    let voting
    let voteID = 0;

    beforeEach(async function() {
        [signer, acc1, acc2, acc3] = await ethers.getSigners()
        const Voting = await ethers.getContractFactory("Voting", signer)
        voting = await Voting.deploy()
        await voting.deployed()
        console.log(voting.address)
    })

    it("should be deployed", async function() {
        expect(voting.address).to.be.properAddress;
    })

    it("should revert when not active", async function() {
        await expect(voting.vote(voteID, acc1.address, { value: "10000000000000000" })).to.be.revertedWith('Voting is not active')
        await expect(voting.endVoting(voteID)).to.be.revertedWith('Voting is not active')
    })

    it("should revert when called by non-owner", async function() {
        await expect(voting.connect(acc1).startVoting([acc1.address, acc2.address])).to.be.revertedWith("Permission denied")
    })

    it("should be able to check active vote", async function() {
        let state = await voting.isActive(voteID)
        expect(state).to.eq(false)

        await voting.startVoting([acc1.address, acc2.address])

        state = await voting.isActive(voteID)

        expect(state).to.eq(true)
    })

    it("should be able to get number of votings", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        await voting.startVoting([acc1.address, acc2.address])

        let count = await voting.votingsCount()

        expect(count).to.eq(2)
    })

    it("should not able to end vote when 3 days not pass", async function() {
        await voting.startVoting([acc1.address, acc2.address])

        await expect(voting.connect(acc1).endVoting(voteID))
            .to.be.revertedWith("End time is not came yet")
    })

    it("should be able to get list of voters", async function() {
        await voting.startVoting([acc1.address, acc2.address])

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })
        await voting.connect(acc2).vote(voteID, acc2.address, { value: "10000000000000000" })
        
        let voters = await voting.getVoters(voteID)
        expect(voters[0]).to.eq(acc1.address)
        expect(voters[1]).to.eq(acc2.address)
    })

    it("should be able to start another voting", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        await voting.startVoting([acc2.address, acc3.address])

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })
        await voting.connect(acc1).vote(voteID + 1, acc3.address, { value: "10000000000000000" })
        await voting.connect(acc2).vote(voteID + 1, acc3.address, { value: "10000000000000000" })

        
        let firstVoters = await voting.getVoters(voteID)
        let secondVoters = await voting.getVoters(voteID + 1)
        expect(firstVoters[0]).to.eq(acc1.address)
        expect(secondVoters[0]).to.eq(acc1.address)
        expect(secondVoters[1]).to.eq(acc2.address)

        let firstWinner = await voting.getWinner(voteID)
        expect(firstWinner).to.eq(acc2.address)

        let secondWinner = await voting.getWinner(voteID + 1)
        expect(secondWinner).to.eq(acc3.address)
    })

    it("should not be able to vote to non-candidate", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        
        await expect(voting.connect(acc1).vote(voteID, acc3.address, { value: "10000000000000000" }))
            .to.be.revertedWith("No such candidate on the vote")
    })

    it("should be able to vote and get votes of candidate", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })
        
        let votes = await voting.getVotes(voteID, acc2.address)
        expect(votes).to.eq(1)
    })

    it("should be able to change winner and their vote", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })

        let firstWinner = await voting.getWinner(voteID)
        expect(firstWinner).to.eq(acc2.address)

        let firstVote = await voting.getWinnerVotes(voteID)
        expect(firstVote).to.eq(1)

        await voting.connect(acc2).vote(voteID, acc1.address, { value: "10000000000000000" })
        await voting.connect(acc3).vote(voteID, acc1.address, { value: "10000000000000000" })

        let secondWinner = await voting.getWinner(voteID)
        expect(secondWinner).to.eq(acc1.address)
        
        let secondVote = await voting.getWinnerVotes(voteID)
        expect(secondVote).to.eq(2)
    })

    it("should be able to get votes", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })
        
        let votes = await voting.getVotes(voteID, acc2.address)
        expect(votes).to.eq(1)
    })

    it("should not be able to vote second time", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await voting.connect(acc1).vote(voteID, acc1.address, { value: "10000000000000000" })

        await expect(voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" }))
            .to.be.revertedWith("You already voted")   
    })

    it("should provide exact 0.01 ETH", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await expect(voting.connect(acc1).vote(voteID, acc1.address, { value: "1" }))
            .to.be.revertedWith("Cost of voting is 0.01 ETH") 
    })

    it("end vote should send amount to winner", async function() {
        await voting.startVoting([acc1.address, acc2.address])
     

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })

        let prize = BigInt(9000000000000000)

        const acc2Before = await ethers.provider.getBalance(acc2.address);
        const contractBefore = await ethers.provider.getBalance(voting.address);

        await voting.turnTimeBack(voteID)
        let tx = await voting.endVoting(voteID)
        await tx.wait()

        const acc2After = await ethers.provider.getBalance(acc2.address); 
        const contractAfter = await ethers.provider.getBalance(voting.address);

        expect(acc2After.toBigInt()).to.eq(acc2Before.toBigInt() + prize)
        expect(contractAfter.toBigInt()).to.eq(contractBefore.toBigInt() - prize)
    })

    it("withdraw should send commission to address", async function() {
        await voting.startVoting([acc1.address, acc2.address])
       

        await voting.connect(acc1).vote(voteID, acc2.address, { value: "10000000000000000" })
        await voting.turnTimeBack(voteID)
        await voting.endVoting(voteID)

        let comission = BigInt(1000000000000000)

        const acc3Before = await ethers.provider.getBalance(acc3.address);
        const contractBefore = await ethers.provider.getBalance(voting.address);

        let tx = await voting.withdraw(acc3.address)
        await tx.wait()

        const acc3After = await ethers.provider.getBalance(acc3.address);
        const contractAfter = await ethers.provider.getBalance(voting.address);     

        expect(acc3After.toBigInt()).to.eq(acc3Before.toBigInt() + comission)
        expect(contractAfter.toBigInt()).to.eq(contractBefore.toBigInt() - comission)
    })

    it("withdraw should be reverted when calling on zero balance", async function() {
        await voting.startVoting([acc1.address, acc2.address])
        

        await voting.turnTimeBack(voteID)
        await voting.endVoting(voteID)

        await expect(voting.withdraw(acc1.address)).to.be.revertedWith("Zero balance")
    })

    

    


    

//     it("should return 0 amount when address is not in donators", async function() {
//         expect(await voting.getAmount(acc2.address)).to.eq(0)
//     })

//     it("should have 3 donators with amounts of 50", async function() {
//         let donation = 50
//         await voting.donate(donation, { value: donation })
//         await voting.connect(acc1).donate(donation, { value: donation })
//         await voting.connect(acc2).donate(donation, { value: donation })
//         let donators = await voting.getDonators()

//         for (let i = 0; i < donators.length; i++) {
//             let amount = await voting.getAmount(donators[i])
//             expect(amount).to.eq(donation) // Checking every amount
//         }
//         expect(donators.length).to.eq(3)
//     })

//     it("should add unique donator to the list", async function() {
//         let donation = 50
//         await voting.donate(donation, { value: donation })
//         let donators = await voting.getDonators()

//         expect(donators.length).to.eq(1)

//         await voting.connect(acc1).donate(donation, { value: donation })
//         donators = await voting.getDonators()

//         expect(donators.length).to.eq(2)
//     })

//     it("should not add non-unique donator to the address and just increment total amount by 50", async function() {
//         let donation = 50
//         await voting.connect(acc1).donate(donation, { value: donation })
//         let donators = await voting.getDonators()

//         expect(donators.length).to.eq(1)
//         expect(await voting.getAmount(acc1.address)).to.eq(donation)


//         await voting.connect(acc1).donate(donation, { value: donation })
//         donators = await voting.getDonators()
        
//         expect(donators.length).to.eq(1)
//         expect(await voting.getAmount(acc1.address)).to.eq(donation * 2)
//     })

//     it("should revert donation when have no enough token", async function() {
//         await expect(voting.donate(100), { value: 50 })
//   .to.be.revertedWith('Not enough token provided.');
//     })

//     it("should revert withdraw when balance is not enough", async function() {
//         await expect(voting.withdraw('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', 100))
//   .to.be.revertedWith('Not enough token on balance.')
//     })

//     it("should revert withdraw when called by non-owner", async function() {
//         await expect(voting.connect(acc2).withdraw('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', 0))
//   .to.be.revertedWith('Permission denied.')
//     })

//     it("should change balance when withdraw", async function() {
//         let amount = 10
//         await voting.connect(acc1).donate(50, { value: 50 })
//         let tx = await voting.withdraw(acc2.address, amount)
//         await expect(() => tx)
//             .to.changeEtherBalances([voting, acc2], [-amount, amount])

//         await tx.wait()
//     })
})