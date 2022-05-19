import { ethers } from 'ethers';
import { Multicall } from '../Multicall';
import { multicall1, multicall3 } from '../abis';

// Globally define calls
const calls = [
  {
    reference: 'multicall3',
    contractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
    abi: [
      {
        name: 'getBlockNumber',
        type: 'function',
        inputs: [],
        outputs: [
          {
            name: 'blockNumber',
            type: 'uint256'
          }
        ]
      }
    ],
    calls: [
      {
        reference: 'blockNumCall',
        method: 'getBlockNumber',
        params: [],
        value: 0
      }
    ]
  }
];

describe('Initialization', () => {
  it('Instantiates Default Multicall Correctly', async () => {
    const multicall = new Multicall();

    expect(multicall.chainId).toBe(1);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(1);
    expect(multicall.multicall).toBe('0xcA11bde05977b3631167028862bE2a173976CA11');
    expect(multicall.abi).toEqual(multicall3);
  });

  it('Instantiates Configed Multicall Correctly', async () => {
    // Create interesting multicalls
    const multicall = new Multicall({
      address: '0x0000000000000000000000000000000000000000',
      network: 5,
      provider: new ethers.providers.JsonRpcProvider('http://localhost:8545')
    });

    expect(multicall.chainId).toBe(5);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(5);
    // Address should revert to multicall3 if it is not a valid multicall address
    expect(multicall.multicall).toBe('0xcA11bde05977b3631167028862bE2a173976CA11');
    expect(multicall.abi).toEqual(multicall3);
  });

  it('Instantiates Custom Address Multicall Correctly', async () => {
    // Create interesting multicalls
    const multicall = new Multicall({
      address: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
      network: 5,
      provider: new ethers.providers.JsonRpcProvider('http://localhost:8545')
    });

    expect(multicall.chainId).toBe(5);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(5);
    expect(multicall.multicall).toBe('0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e');
    expect(multicall.abi).toEqual(multicall1);
  });
});

describe('Calling', () => {
  it('Can Call Without Instantiation', async () => {
    // Call the Multicall associated functions directly
    let call_results = await Multicall.call(calls);

    // Print the call result
    console.log(call_results);
  });
});
