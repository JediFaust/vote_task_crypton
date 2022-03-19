// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Voting {
    address owner;
    uint startDate;
    bool active = false; // Check if voting active
    address[] candidates;
    address payable winner;
    mapping(address => bool) isCandidate; // Checking if candidate already in voting
    mapping(address => uint) votes; // votes of certain candidate
    mapping(address => bool) voted; // check if user already voted

    bool testing = true;

    constructor() {
        owner = msg.sender;
    }

    modifier ownerOnly {
        require (
            msg.sender == owner, "Permission denied"
        );
        _;
    }

    modifier activeOnly {
        require (
            active, "There is no active voting"
        );
        _;
    }

    function startVote() public ownerOnly {
        require(
         !active,
         "Voting is already started"
        );

        startDate = block.timestamp;
        active = true;
    }

    function turnTimeBack() public ownerOnly { 
        // function to turn back time
        // for testing
        startDate -= 4 days;
    }

    function addCandidate(address candidate) public ownerOnly activeOnly {
        require(!isCandidate[candidate], "Candidate is already in list");
        candidates.push(candidate);
        isCandidate[candidate] = true;
    }

    function vote(address payable to) public payable activeOnly {
        require(isCandidate[msg.sender], "You are not partipicant of the vote");
        require(!voted[msg.sender], "You already voted");
        require(isCandidate[to], "You can vote only to candidates");
        require(msg.value >= 10000000000000000, "Cost of voting is 0.01 ETH");
        
        voted[msg.sender] = true;
        votes[to] += 1;
        if (votes[to] > votes[winner]) { // Due to this condition winner is the first who beats last max vote
            winner = to; // Register new winner
        }
    }

    function endVote() public payable activeOnly {
        require(block.timestamp >= startDate + 3 days, "Voting end time is not came yet");

        // calculate prize as 90 percent's of current vote budget
        // and send to the winner

        winner.transfer(uint(address(this).balance / 10) * 9); 

        active = false;
    }

    function withdraw(address payable to) public ownerOnly {
        require(!active, "Can't withdraw when voting is active");
        require(address(this).balance > 0, "There is no balance to withdraw");
        to.transfer(address(this).balance);
    }

    function getCandidates() public view activeOnly returns(address[] memory) {
        return candidates;
    }
    
    function getVotes(address partipicant) public view activeOnly returns(uint) {
        require(isCandidate[partipicant], "Address is not partipicant");
        return votes[partipicant];
    }

    function getWinner() public view activeOnly returns(address) {
        return winner;
    }

    function getWinnerVotes() public view activeOnly returns(uint) {
        return votes[winner];
    }

}