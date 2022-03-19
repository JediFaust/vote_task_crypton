const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Vote", function() {
    let signer
    let acc1
    let acc2
    let acc3
    let voting

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
        await expect(voting.addCandidate(acc1.address)).to.be.revertedWith('There is no active voting')
        await expect(voting.vote(acc1.address)).to.be.revertedWith('There is no active voting')
        await expect(voting.endVote()).to.be.revertedWith('There is no active voting')

        await expect(voting.getCandidates()).to.be.revertedWith('There is no active voting')
        await expect(voting.getVotes(acc1.address)).to.be.revertedWith('There is no active voting')
        await expect(voting.getWinner()).to.be.revertedWith('There is no active voting')
        await expect(voting.getWinnerVotes()).to.be.revertedWith('There is no active voting')
    })

    it("should revert starting new vote when already active", async function() {
        await voting.startVote()
        await expect(voting.startVote()).to.be.revertedWith("Voting is already started")
    })

    it("should not be able to add already existed candidate", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await expect(voting.addCandidate(acc1.address)).to.be.revertedWith("Candidate is already in list")
    })

    it("should revert when called by non-owner", async function() {
        await expect(voting.connect(acc1).startVote()).to.be.revertedWith("Permission denied")
    })

    it("should not able to end vote when 3 days not pass", async function() {
        voting.startVote()

        await expect(voting.connect(acc1).endVote()).to.be.revertedWith("Voting end time is not came yet")
    })


    it("should be able to add candidate and get list of it", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        let candidates = await voting.getCandidates()
        expect(candidates[0]).to.eq(acc1.address)
    })

    it("should be able to get list of candidates", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.addCandidate(acc2.address)
        await voting.addCandidate(acc3.address)
        
        let candidates = await voting.connect(acc1).getCandidates()
        expect(candidates[0]).to.eq(acc1.address)
        expect(candidates[1]).to.eq(acc2.address)
        expect(candidates[2]).to.eq(acc3.address)
    })

    it("should not be able to vote by non-candidate", async function() {
        await voting.startVote()
        await expect(voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" }))
        .to.be.revertedWith("You are not partipicant of the vote")
    })

    it("should be able to vote and get votes of candidate", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.addCandidate(acc2.address)

        await voting.connect(acc1).vote(acc2.address, { value: "10000000000000000" })
        
        let votes = await voting.connect(acc1).getVotes(acc2.address)
        expect(votes).to.eq(1)
    })

    it("should be able to change winner and their vote", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.addCandidate(acc2.address)
        await voting.addCandidate(acc3.address)

        await voting.connect(acc1).vote(acc2.address, { value: "10000000000000000" })

        let firstWinner = await voting.getWinner()
        expect(firstWinner).to.eq(acc2.address)

        let firstVote = await voting.getWinnerVotes()
        expect(firstVote).to.eq(1)

        await voting.connect(acc2).vote(acc1.address, { value: "10000000000000000" })
        await voting.connect(acc3).vote(acc1.address, { value: "10000000000000000" })

        let secondWinner = await voting.getWinner()
        expect(secondWinner).to.eq(acc1.address)
        
        let secondVote = await voting.getWinnerVotes()
        expect(secondVote).to.eq(2)
    })

    it("should be able to get votes", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)

        await voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" })
        
        let votes = await voting.connect(acc1).getVotes(acc1.address)
        expect(votes).to.eq(1)
    })

    it("should not be able to get votes of non-candidate", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)

        await expect(voting.connect(acc1).getVotes(acc2.address))
            .to.be.revertedWith("Address is not partipicant")
    })


    it("should not be able to vote second time", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)

        await voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" })

        await expect(voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" }))
            .to.be.revertedWith("You already voted")   
    })

    it("should not be able to vote to non-candidate", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)

        await expect(voting.connect(acc1).vote(acc2.address, { value: "10000000000000000" }))
            .to.be.revertedWith("You can vote only to candidates") 
    })

    it("should provide more than 0.01 ETH", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)

        await expect(voting.connect(acc1).vote(acc1.address, { value: "1" }))
            .to.be.revertedWith("Cost of voting is 0.01 ETH") 
    })

    it("end vote should send amount to winner", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" })

        let prize = BigInt(9000000000000000)

        const acc1Before = await ethers.provider.getBalance(acc1.address);
        const contractBefore = await ethers.provider.getBalance(voting.address);

        await voting.turnTimeBack()
        let tx = await voting.endVote()
        await tx.wait()

        const acc1After = await ethers.provider.getBalance(acc1.address); 
        const contractAfter = await ethers.provider.getBalance(voting.address);

        expect(acc1After.toBigInt()).to.eq(acc1Before.toBigInt() + prize)
        expect(contractAfter.toBigInt()).to.eq(contractBefore.toBigInt() - prize)
    })

    it("withdraw should send commission to address", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" })
        await voting.turnTimeBack()
        await voting.endVote()

        let commission = BigInt(1000000000000000)

        const acc2Before = await ethers.provider.getBalance(acc2.address);
        const contractBefore = await ethers.provider.getBalance(voting.address);

        let tx = await voting.withdraw(acc2.address)
        await tx.wait()

        const acc2After = await ethers.provider.getBalance(acc2.address);
        const contractAfter = await ethers.provider.getBalance(voting.address);     

        expect(acc2After.toBigInt()).to.eq(acc2Before.toBigInt() + commission)
        expect(contractAfter.toBigInt()).to.eq(contractBefore.toBigInt() - commission)
    })

    it("should not be able to withdraw when voting is active", async function() {
        await voting.startVote()

        await expect(voting.withdraw(acc2.address)).to.be.revertedWith("Can't withdraw when voting is active")
    })

    it("withdraw should be reveted when calling on zero balance", async function() {
        await voting.startVote()
        await voting.addCandidate(acc1.address)
        await voting.connect(acc1).vote(acc1.address, { value: "10000000000000000" })
        await voting.turnTimeBack()
        await voting.endVote()

        await voting.withdraw(acc2.address)

        await expect(voting.withdraw(acc2.address)).to.be.revertedWith("There is no balance to withdraw")
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