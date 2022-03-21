// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract VotingStruct {
    address owner;
    uint startDate;
    bool active; // Check if voting active
    address[] candidates;
    address payable winner;

    struct Candidate {
        bool registered;
        uint votes;
        bool voted;
    }

    mapping(address => Candidate) private candidate;

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
            active, "Voting is inactive"
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

    function addCandidate(address _candidate) public ownerOnly activeOnly {
        require(!candidate[_candidate].registered, "Candidate is already in list");
        candidates.push(_candidate);
        candidate[_candidate].registered = true;
    }

    function vote(address payable to) public payable activeOnly {
        require(candidate[msg.sender].registered, "You are not candidate");
        require(!candidate[msg.sender].voted, "You already voted");
        require(candidate[to].registered, "You can vote only to candidate");
        require(msg.value == 10000000000000000, "Cost of voting is 0.01 ETH");
        
        candidate[msg.sender].voted = true;
        candidate[to].votes += 1;

        // Due to this condition winner is the first who beats last max vote
        if (candidate[to].votes > candidate[winner].votes) { 
            // Register new winner
            winner = to;
        }
    }

    function endVote() public payable activeOnly {
        require(block.timestamp >= startDate + 3 days, "End time is not came yet");

        // calculate prize as 90 percent's of current vote budget
        // and send to the winner
        winner.transfer(uint(address(this).balance / 10) * 9); 

        active = false;
    }

    function withdraw(address payable to) public ownerOnly {
        require(!active, "End vote before withdraw");
        require(address(this).balance > 0, "Zero balance");
        to.transfer(address(this).balance);
    }

    function getCandidates() public view activeOnly returns(address[] memory) {
        return candidates;
    }
    
    function getVotes(address partipicant) public view activeOnly returns(uint) {
        require(candidate[partipicant].registered, "Address is not candidate");
        return candidate[partipicant].votes;
    }

    function getWinner() public view activeOnly returns(address) {
        return winner;
    }

    function getWinnerVotes() public view activeOnly returns(uint) {
        return candidate[winner].votes;
    }

}