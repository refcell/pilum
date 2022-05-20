import { ethers } from 'ethers';
import { Multicall } from '../src/Multicall';
import { multicall1, multicall3 } from '../src/abis';
import { networks } from '../src/networks';

// Globally define calls
const calls = [
  {
    reference: 'multicall3',
    contractAddress: networks['1']['multicall3'],
    abi: [
      {
        name: 'getBlockNumber',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            name: 'blockNumber',
            type: 'uint256',
          },
        ],
      },
    ],
    calls: [
      {
        reference: 'blockNumCall',
        method: 'getBlockNumber',
        params: [],
        value: 0,
      },
    ],
  },
];

describe('Initialization', () => {
  it('Instantiates Default Multicall Correctly', () => {
    const multicall = new Multicall();

    expect(multicall.chainId).toBe(1);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(1);
    expect(multicall.multicall).toBe(networks['1']['multicall3']);
    expect(multicall.abi).toEqual(multicall3);
  });

  it('Instantiates Configed Multicall Correctly', () => {
    // Create interesting multicalls
    const multicall = new Multicall({
      address: '0x0000000000000000000000000000000000000000',
      network: 5,
      provider: new ethers.providers.JsonRpcProvider('http://localhost:8545'),
    });

    expect(multicall.chainId).toBe(5);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(5);
    // Address should revert to multicall3 if it is not a valid multicall address
    expect(multicall.multicall).toBe(
      '0xcA11bde05977b3631167028862bE2a173976CA11'
    );
    expect(multicall.abi).toEqual(multicall3);
  });

  it('Instantiates Custom Address Multicall Correctly', () => {
    // Create interesting multicalls
    const multicall = new Multicall({
      address: networks['5']['multicall'],
      network: 5,
      provider: new ethers.providers.JsonRpcProvider('http://localhost:8545'),
    });

    expect(multicall.chainId).toBe(5);
    expect(multicall.provider).toBeInstanceOf(ethers.providers.BaseProvider);
    expect(multicall.network['chainId']).toEqual(5);
    expect(multicall.multicall).toBe(networks['5']['multicall']);
    expect(multicall.abi).toEqual(multicall1);
  });
});

describe('Calling', () => {
  it('Can Call Without Instantiation', async () => {
    // Call the Multicall associated functions directly
    const call_results = await Multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].methodResults.length).toBe(1);
    expect(call_results.results[0].methodResults[0].result.success).toBe(true);
  });

  it('Can Call With Recommended Instantiation', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance
    const multicall = new Multicall({
      address: networks['1']['multicall3'],
      network: 1,
      provider,
    });

    // Method Call
    const call_results = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].methodResults.length).toBe(1);
    expect(call_results.results[0].methodResults[0].result.success).toBe(true);
  });

  it('Can Call With Multicall2', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance with Multicall2
    const multicall = new Multicall({
      address: networks['1']['multicall2'],
      network: 1,
      provider,
    });

    // Method Call
    const call_results = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].methodResults.length).toBe(1);
    expect(call_results.results[0].methodResults[0].result.success).toBe(true);
  });

  it('Can Call With Multicall', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance with Multicall2
    const multicall = new Multicall({
      address: networks['1']['multicall'],
      network: 1,
      provider,
    });

    // Method Call
    const call_results = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].methodResults.length).toBe(1);
    expect(
      call_results.results[0].methodResults[0].result.blockNumber.toNumber()
    ).toBeGreaterThan(0);
  });
});
