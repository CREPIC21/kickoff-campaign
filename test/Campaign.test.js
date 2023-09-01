const { Web3, eth } = require('web3'); // portal to ethereum word
const ganache = require('ganache'); // hosts local test network giving us accounts to play with
const assert = require('assert'); // helper library from npm
const events = require('events').EventEmitter.defaultMaxListeners = 0;

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
    it('Deploys a Campaignfactory and Campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    })
})


// /**Running the tests
//  * npm run test -> 'test' script from package.json
//  */