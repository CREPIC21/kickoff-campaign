/**This script will take our raw contract code and spit out both the ABI and the bytecode for the contract. */

const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');

// Delete entire build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Create build folder
fs.ensureDirSync(buildPath);
const source = fs.readFileSync(campaignPath, 'utf8');
const input = {
    language: 'Solidity',
    sources: {
        'Campaign.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Campaign.sol'];
console.log(output)
// looping through contract so we can store each contract seperatly
for (let contract in output) {
    fs.outputJsonSync(path.resolve(buildPath, contract + '.json'), output[contract]);
}


/**Running the compile script
 * node compile.js
 *
*/