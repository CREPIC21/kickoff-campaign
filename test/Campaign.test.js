const { Web3, eth } = require('web3'); // portal to ethereum word
const ganache = require('ganache'); // hosts local test network giving us accounts to play with
const assert = require('assert'); // helper library from npm
const events = require('events').EventEmitter.defaultMaxListeners = 0;
const { expectRevert } = require("@openzeppelin/test-helpers");

/*
 below line of code is what creates an instance of web3 and tells that instance to
 attempt to connect to this local test network that we are hosting on our machine solely for the purpose of running these tests in the future
 */
const web3 = new Web3(ganache.provider());

const compiledCampaign = require('../ethereum/build/Campaign.json');
const compiledCampaignFactory = require('../ethereum/build/CampaignFactory.json');

// accounts is going to list of all the different accounts that exist on this local network
let accounts;
// factory is a reference to the deployed instance of the factory that we are going to make
let factory;

// campaign address that we will use through the testing so we don't have to create new campaign on every test
let campaignAddress;

// use the factory to create an instance of a campaign and assign it to the campaign variable
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    // deploying CampaingFactory contract
    factory = await new web3.eth.Contract(compiledCampaignFactory.abi)
        .deploy({ data: compiledCampaignFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '5000000' });

    // creating an instance of Campaing with 100 wei
    await factory.methods.createCampaignContract('100').send({ from: accounts[0], gas: '5000000' });

    // getting deployed campaings - we're saying that we want to take the first element out of the array that is returned and assign it to the campaignAddress variable
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    // accessing deployed campaign contract deployed in previous step by CampaingFactory
    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
})



describe('Campaings', () => {
    // Testing if CampaignFactory contract and Campaign contract were succesfully deployed
    it('Deploys a Campaignfactory and Campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    })

    // Testing to make sure that the manager of the campaign is account's at zero -> accounts[0]
    it('Checks if the manager of the campaign is the account that created campaign', async () => {
        const manager = await campaign.methods.manager().call();
        // console.log(manager);
        // console.log(accounts[0]);
        assert.equal(manager, accounts[0]);
    })

    // Testing if people can contribute money and then are marked as approvers
    it('Checks if other accounts can contribute money and then they are added as approvers', async () => {
        // Sending money from account[2]
        await campaign.methods.contribute().send({ from: accounts[1], value: '200' });
        // Checking if account[1] is approver -> true or false
        const isApprover = await campaign.methods.isApprover(accounts[1]);
        // assert(true, isApprover);
        assert(isApprover);
    })

    // Testing if account that wants to contribute to campaign has contributed minimum contribution
    it('It should revert if account did not contribute the minimum contribution', async () => {
        let executed;
        try {
            await campaign.methods.contribute().send({ from: accounts[1], value: '50' });
            executed = "success";
        } catch (error) {
            executed = "fail"
        }
        assert.equal('fail', executed);
    })

    it('Tests if manager can make a payment request', async () => {
        await campaign.methods.createRequest('Test Request', '1000', accounts[3]).send({ from: accounts[0], gas: '2000000' });
        const request = await campaign.methods.getRequest(0).call();
        // console.log(request)
        assert.equal(request['0'], 'Test Request');
    })

    it('Processes requests', async () => {
        let accountThreeStartingBalance = await web3.eth.getBalance(accounts[3]);
        accountThreeStartingBalance = parseFloat(web3.utils.fromWei(accountThreeStartingBalance, 'ether'));

        let amountToTransfer = web3.utils.toWei('5', 'ether');

        await campaign.methods.contribute().send({ from: accounts[1], value: web3.utils.toWei('10', 'ether') });
        await campaign.methods.createRequest('Test Request', amountToTransfer, accounts[3]).send({ from: accounts[0], gas: '2000000' });
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '2000000' });
        await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: '2000000' });

        let accountThreeEndingBalance = await web3.eth.getBalance(accounts[3]);
        accountThreeEndingBalance = parseFloat(web3.utils.fromWei(accountThreeEndingBalance, 'ether'));

        amountToTransfer = parseFloat(web3.utils.fromWei(amountToTransfer, 'ether'));
        // console.log(accountThreeStartingBalance);
        // console.log(accountThreeEndingBalance);
        // console.log(parseFloat(web3.utils.fromWei(amountToTransfer, 'ether')));
        // it is possible to get different results or failures as we don't know what is happenning with accounts in ganache(how much money they have between tests and so on...)
        assert.equal(accountThreeEndingBalance, accountThreeStartingBalance + amountToTransfer);
    })
})


// /**Running the tests
//  * npm run test -> 'test' script from package.json
//  */