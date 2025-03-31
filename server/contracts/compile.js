import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the contract source code
const contractPath = path.resolve(__dirname, '../../contracts/BloodBank.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Configure the compiler input
const input = {
  language: 'Solidity',
  sources: {
    'BloodBank.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Extract the contract
const contract = output.contracts['BloodBank.sol']['BloodBank'];

// Export the contract ABI and bytecode
export const abi = contract.abi;
export const bytecode = contract.evm.bytecode.object;

export default { abi, bytecode };