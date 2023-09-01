# Decentralized Crowdfunding Platform

This Solidity project introduces a decentralized crowdfunding platform powered by smart contracts on the Ethereum blockchain and it is part of learning Solidity and blockchain technologies following a Udemy course ["Ethereum and Solidity: The Complete Developer's Guide"](https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/) created by Stephen Grider.

Project consists of two primary smart contracts: Factory Campaign Contract and individual Campaign Contract where the Factory Campaign Contract facilitates the deployment of new Campaign Contracts.

## Key Features

### 1. Campaign Contract

The Campaign Contract is the heart of the platform and serves as a crowdfunding campaign for various projects. Its core features include:

- **Project Creation**: Users can create online campaigns for the projects they want to execute.

- **Funding**: Individuals interested in supporting these projects can donate or invest money directly into the campaign's contract address.

- **Request Creation**: The campaign owner can create expenditure requests, specifying the purpose and amount. These requests are subject to approval by contributors.

- **Request Voting**: Contributors have the power to vote on expenditure requests, deciding whether the owner can spend money on the specified project-related expenses.

- **Finalization**: Once a request receives a majority of favorable votes, the request is finalized, and the owner can execute the expenditure.

### 2. Factory Campaign Contract

The Factory Campaign Contract allows users to create new Campaign Contracts, each corresponding to a distinct project or fundraising campaign. It streamlines the deployment process and ensures the creation of isolated crowdfunding environments for different projects.

## How It Works

1. Users deploy a individual Campaign Contracts for their specific projects. New Campaign Contracts is deployed by Factory Campaign Contract functionality.

2. The owner of the campaign can draft and submit expenditure requests, outlining how funds will be used for the project.

3. Contributors vote on expenditure requests, democratically deciding whether the project owner can spend funds as proposed.

4. Upon receiving a majority of favorable votes, the request is finalized and the owner can execute the expenditure according to the project plan.

## Getting Started

To get started with this decentralized crowdfunding platform, you'll need:

1. A development environment set up for Ethereum smart contract development, such as Ganache.

2. Access to an Ethereum wallet, like MetaMask, for interacting with the contracts.

3. The project's Solidity smart contract source code.

## Usage

1. Clone the project repository to your local machine.
```shell
git clone https://github.com/CREPIC21/kickoff-campaign
```

2. Initialize your project and install the required Node.js packages by running the following commands in your project's root directory:
```shell
npm init
npm install ganache-cli mocha solc@0.8.19 fs-extra web3
```

3. Compile the contracts:
```shell
cd ethereum/
node compile.js
```

4. Running tests:
```shell
cd ethereum/
npm run test
```
