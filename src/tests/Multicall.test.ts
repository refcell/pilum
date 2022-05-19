import { ethers } from 'ethers';
import { AggregateFullResponse } from 'models';
import { Multicall } from 'Multicall';
import { multicall3 } from 'abis';
import { networks } from 'networks';

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
    expect(multicall.network).toEqual(networks["1"]);
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
    expect(multicall.network).toBeInstanceOf(networks["5"]);
    expect(multicall.multicall).toBe('0x0000000000000000000000000000000000000000');
    expect(multicall.abi).toEqual(multicall3);
  });
});

describe('Calling', () => {
  it('Can Call Without Instantiation', async () => {
    // Call the Multicall associated functions directly
    let call_results: AggregateFullResponse = await Multicall.call(calls);

    // Print the call result
    console.log(call_results);
  });
});
