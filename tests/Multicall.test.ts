import { BigNumber, ethers } from 'ethers';
import { Multicall } from '../src/Multicall';
import { multicall1, multicall3 } from '../src/abis';
import { networks } from '../src/networks';
import { ContractCall, MulticallResponse } from '../src/models';

// Globally define calls
const calls: ContractCall[] = [
  {
    reference: 'blockNumCall',
    address: networks['1']['multicall3'],
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
    method: 'getBlockNumber',
    params: [],
    value: 0,
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

describe('Single Calls', () => {
  it('Can Call Without Instantiation', async () => {
    // Call the Multicall associated functions directly
    const call_results: MulticallResponse = await Multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].returnData[0]).toBe(true);
    expect(
      BigNumber.from(call_results.results[0].returnData[1]).toNumber()
    ).toBeGreaterThan(0);
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
    const call_results: MulticallResponse = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].returnData[0]).toBe(true);
    expect(
      BigNumber.from(call_results.results[0].returnData[1]).toNumber()
    ).toBeGreaterThan(0);
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
    const call_results: MulticallResponse = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    expect(call_results.results[0].returnData[0]).toBe(true);
    const blockNumber = call_results.blockNumber;
    if (blockNumber) {
      expect(blockNumber.toNumber()).toBeGreaterThan(0);
    }
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
    const call_results: MulticallResponse = await multicall.call(calls);

    // Expect Successful Calls
    expect(call_results.results.length).toBe(1);
    const blockNumber = call_results.blockNumber;
    if (blockNumber) {
      expect(blockNumber.toNumber()).toBeGreaterThan(0);
    }
  });
});

// Globally define calls
const multicalls = [...calls, ...calls, ...calls];

describe('Multicalls', () => {
  it('Statically Multicalls', async () => {
    // Call the Multicall associated functions directly
    const res: MulticallResponse = await Multicall.call(multicalls);

    // Expect results to equal the number of calls we made
    expect(res.results.length).toBe(multicalls.length);

    // Expect each call to be successful
    res.results.map((result) => expect(result.returnData[0]).toBe(true));
    res.results.map((result) =>
      expect(BigNumber.from(result.returnData[1]).toNumber()).toBeGreaterThan(0)
    );
  });

  it('Statically Multicalls With Options', async () => {
    // Call the Multicall associated functions directly
    const res: MulticallResponse = await Multicall.call(multicalls, {
      network: 5,
    });

    // Expect results to equal the number of calls we made
    expect(res.results.length).toBe(multicalls.length);

    // Expect each call to be successful
    res.results.map((result) => expect(result.returnData[0]).toBe(true));
    res.results.map((result) =>
      expect(BigNumber.from(result.returnData[1]).toNumber()).toBeGreaterThan(0)
    );
  });

  it('Multicalls With Recommended Instantiation', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance
    const multicall = new Multicall({
      address: networks['1']['multicall3'],
      network: 1,
      provider,
    });

    // Method Call
    const res: MulticallResponse = await multicall.call(multicalls);

    // Expect results to equal the number of calls we made
    expect(res.results.length).toBe(multicalls.length);

    // Expect each call to be successful
    res.results.map((result) => expect(result.returnData[0]).toBe(true));
    res.results.map((result) =>
      expect(BigNumber.from(result.returnData[1]).toNumber()).toBeGreaterThan(0)
    );
  });

  it('Multicalls With Multicall2', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance with Multicall2
    const multicall = new Multicall({
      address: networks['1']['multicall2'],
      network: 1,
      provider,
    });

    // Method Call
    const res: MulticallResponse = await multicall.call(multicalls);

    // Expect results to equal the number of calls we made
    expect(res.results.length).toBe(multicalls.length);

    // Expect each call to be successful
    res.results.map((result) => expect(result.returnData[0]).toBe(true));
    res.results.map((result) =>
      expect(BigNumber.from(result.returnData[1]).toNumber()).toBeGreaterThan(0)
    );
  });

  it('Multicalls With Multicall', async () => {
    // Use the default provider ;P
    const provider = ethers.getDefaultProvider();

    // Instantiate a Multicall Instance with Multicall2
    const multicall = new Multicall({
      address: networks['1']['multicall'],
      network: 1,
      provider,
    });

    // Method Call
    const res: MulticallResponse = await multicall.call(multicalls);

    // Expect results to equal the number of calls we made
    expect(res.results.length).toBe(multicalls.length);

    // Expect each call to be successful
    res.results.map((result) =>
      expect(BigNumber.from(result.returnData).toNumber()).toBeGreaterThan(0)
    );
    const blockNumber = res.blockNumber;
    if (blockNumber) {
      expect(blockNumber.toNumber()).toBeGreaterThan(0);
    }
  });
});
