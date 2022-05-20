// Import the entire json compile output
import Multicall1 from './Multicall.json';
import Multicall2 from './Multicall2.json';
import Multicall3 from './Multicall3.json';

// Extract abis
const m1abi = Multicall1.abi;
const m2abi = Multicall2.abi;
const m3abi = Multicall3.abi;

// Re-export our abis
export {
  m1abi as multicall,
  m1abi as multicall1,
  m2abi as multicall2,
  m3abi as multicall3,
};
export default {
  multicall: m1abi,
  multicall1: m1abi,
  multicall2: m2abi,
  multicall3: m3abi,
};
