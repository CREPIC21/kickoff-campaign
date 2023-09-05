// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// /**
//  * @title Campaign Contract
//  * @author Danijel Crepic
//  * @notice This contract is for creating a sample contribute contract where
//  * @dev
//  */

contract CampaignFactory {
    address[] public listOfDeployedCampaignContracts;

    // function that creates new Campaign contract
    function createCampaignContract(uint256 minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender); // we need to pass msg.sender otherwise the CampaignFactory contract will be the manager of every new deployed Campaign contract
        listOfDeployedCampaignContracts.push(address(newCampaign)); // Store the address of the newCampaign contract
    }

    // function that will return all deployed Campaign contracts
    function getDeployedCampaigns() public view returns (address[] memory) {
        return listOfDeployedCampaignContracts;
    }
}

contract Campaign {
    /**Errors*/
    error Campaign__NotEnoughEthSent();
    error Campaign__ApproverIsNotContributor();
    error Campaign__ApproverAlreadyVotedForThisRequest();
    error Campaign__RequestWasAlreadyFinalized();
    error Campaign__RequestCanNotBeFinalizedAsNotEnoughApprovers();

    /**Type declarations*/
    // Request that manager can make to ask approvers to spend certain amount of money for business purposes
    struct Request {
        string requestDescription; // purpose of request
        uint256 requestValue; // ETH to transfer
        address requestRecipient; // who gets the money
        bool complete; // whether the request is approved
        uint256 approvalCount; // track number of YES approvals
        mapping(address => bool) approvals; // track who has voted
    }

    // https://ethereum.stackexchange.com/questions/87451/solidity-error-struct-containing-a-nested-mapping-cannot-be-constructed/97883#97883
    uint256 public numRequests;
    mapping(uint256 => Request) requests;
    // Request[] public requests; // list of requests that the manager has created
    address public manager; // address of the person that is managing the campaign
    uint256 private immutable i_minimumContribution; // minimum donation required to be consideres a contributor or approver
    mapping(address => bool) public approvers; // mapping of addresses for every person that donated money
    uint256 public approversCount; // every single time someone donates to our campaign, we're going to increment the value of approver count

    /**Modifiers*/
    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this function.");
        _; // add what ever else executes in the function
    }

    /** Functions*/
    // sets the minimumContribution and the owner/manager
    constructor(uint256 minimum, address creator) {
        // manager = msg.sender; // changed to creator below as we are using CampaignFactory contract to deploy Campaign contracts
        manager = creator;
        i_minimumContribution = minimum;
    }

    // called when someone wants to donate money to campaign and become approver
    function contribute() public payable {
        if (msg.value < i_minimumContribution) {
            revert Campaign__NotEnoughEthSent();
        }
        // adding approver to mapping
        approvers[msg.sender] = true;
        // incrementing the variable approversCount
        approversCount++;
    }

    // called only by manager to create a new request for spending the money
    function createRequest(
        string memory _requestDescription,
        uint256 _requestValue,
        address _requestRecipient
    ) public onlyManager {
        Request storage newRequest = requests[numRequests++];
        newRequest.requestDescription = _requestDescription;
        newRequest.requestValue = _requestValue;
        newRequest.requestRecipient = _requestRecipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    // called by each approver/contributor to approve spending request
    /* Requirements: 
    /* 1. make sure that the person approving request is one of the contributors
    /* 2. make sure that a single contributor cannot vote multiple times on a single spending request
    /* 3. make sure that whatever voting system we come up with, it should be resilient for if we have many, many, many different contributors or many different approvers in our campaign
    **/
    function approveRequest(uint256 requestIndex) public {
        // creating a storage variable for request that caller wants to approve
        Request storage request = requests[requestIndex];
        // checking if person that wants to approve request is also contributor(donated money to the campaign)
        if (!approvers[msg.sender]) {
            revert Campaign__ApproverIsNotContributor();
        }
        // checking if person that wants to approve request didn't already voted for this request
        if (request.approvals[msg.sender]) {
            revert Campaign__ApproverAlreadyVotedForThisRequest();
        }

        // if checks above pass we will add the person to approvals mappings and increase approvalCount for this request
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    // function which after a request has gotten enough approvals, the manager can call this to get money sent to the vendor
    function finalizeRequest(uint256 requestIndex) public onlyManager {
        // creating a storage variable for request that caller wants to approve
        Request storage request = requests[requestIndex];
        // check if request is not already marked as complete
        if (request.complete) {
            revert Campaign__RequestWasAlreadyFinalized();
        }

        // at least 50% of all the people who have contributed to this campaign have to vote yes in order for this thing to be finalized
        if (!(request.approvalCount > (approversCount / 2))) {
            revert Campaign__RequestCanNotBeFinalizedAsNotEnoughApprovers();
        }

        // takeing the money that is specified inside the request and attempt to send it to the recipient
        // request.requestRecipient.transfer()
        // - call -> recomended way
        (bool callSuccess /*bytes memory dataReturned*/, ) = payable(
            request.requestRecipient
        ).call{value: request.requestValue}("");
        require(callSuccess, "Call failed.");

        // mark the request as finalized
        request.complete = true;
    }

    /**Getter functions*/
    function getMinimumContribution() external view returns (uint256) {
        return i_minimumContribution;
    }

    function getRequest(
        uint256 index
    ) public view returns (string memory, uint256, address, bool, uint256) {
        Request storage request = requests[index];

        return (
            request.requestDescription,
            request.requestValue,
            request.requestRecipient,
            request.complete,
            request.approvalCount
        );
    }

    function isApprover(address _address) public view returns (bool) {
        return approvers[_address];
    }
}
