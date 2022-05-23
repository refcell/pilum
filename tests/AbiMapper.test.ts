import { networks } from '../src/networks';
import { Address, Mapping } from '../src/models';
import {
  abiMap,
  constructWithAddress,
  networkToMapping,
} from '../src/AbiMapper';
import { multicall1, multicall2, multicall3 } from '../src/abis';
import { ethers } from 'ethers';

// IMMUTABLES
const MULTICALL_3_ADDRESS: Address =
  '0xcA11bde05977b3631167028862bE2a173976CA11';
const GOERLI_MULTICALL_ADDRESS: Address =
  '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e';
const DEFAULT_MAPPING: Mapping = {
  found: false,
  address: MULTICALL_3_ADDRESS,
  network: 1,
  interface: new ethers.utils.Interface(multicall3),
  abi: multicall3,
};

describe('Constructs Mapping with Address', () => {
  it('Non-existent address returns default mapping', () => {
    const zero: Address = '0x0000000000000000000000000000000000000000';
    const mapping: Mapping = constructWithAddress(zero);
    expect(mapping).toEqual(DEFAULT_MAPPING);
  });

  it('Existing Multicall 3 properly construct mappings', () => {
    const goerliMulticall3: Address = networks['5']['multicall3'];
    const mapping: Mapping = constructWithAddress(goerliMulticall3);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(goerliMulticall3);
    // Since all the multicall3 addresses are the same, we will get back network 1
    expect(mapping.network).toEqual(1);
    expect(mapping.abi).toEqual(multicall3);
  });

  it('Existing Multicall 2 properly construct mappings', () => {
    const rinkebyMulticall2: Address = networks['4']['multicall2'];
    const mapping: Mapping = constructWithAddress(rinkebyMulticall2);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(rinkebyMulticall2);
    // MakerDAO deployed five instances of multicall2 to the same address so we'll get back network 1
    expect(mapping.network).toEqual(1);
    expect(mapping.abi).toEqual(multicall2);
  });

  it('Existing Multicall 1 properly construct mappings', () => {
    const ropstenMulticall1: Address = networks['3']['multicall'];
    const mapping: Mapping = constructWithAddress(ropstenMulticall1);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(ropstenMulticall1);
    expect(mapping.network).toEqual(3);
    expect(mapping.abi).toEqual(multicall1);
  });
});

describe('Maps Network to Mapping Object', () => {
  it('Constructs Correct Mapping with Zero', () => {
    const zero: Address = '0x0000000000000000000000000000000000000000';
    const mapping: Mapping = networkToMapping(5, networks['5'], zero);
    expect(mapping).toEqual(DEFAULT_MAPPING);
  });

  it('Constructs Correct Mapping with Multicall Address', () => {
    const m1addr: Address = '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e';
    const mapping: Mapping = networkToMapping(5, networks['5'], m1addr);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(m1addr);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall1);
  });

  it('Constructs Correct Mapping with Multicall 2 Address', () => {
    const m2addr: Address = '0x5ba1e12693dc8f9c48aad8770482f4739beed696';
    const mapping: Mapping = networkToMapping(5, networks['5'], m2addr);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(m2addr);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall2);
  });

  it('Constructs Correct Mapping with Multicall 3 Address', () => {
    const mapping: Mapping = networkToMapping(
      5,
      networks['5'],
      MULTICALL_3_ADDRESS
    );

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(MULTICALL_3_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall3);
  });
});

describe('Abi Mapper', () => {
  it('Returns Default Mapping with no Options', () => {
    const mapping: Mapping = abiMap();
    expect(mapping).toEqual(DEFAULT_MAPPING);
  });

  it('returns default mapping for invalid network', () => {
    const mapping: Mapping = abiMap({ network: -1 });
    expect(mapping).toEqual(DEFAULT_MAPPING);
  });

  it('returns default mapping for an out of bounds network', () => {
    const mapping: Mapping = abiMap({ network: 10e6 });
    expect(mapping).toEqual(DEFAULT_MAPPING);
  });

  it('returns the network mapping for invalid address', () => {
    const mapping: Mapping = abiMap({ network: 5, address: '0x' });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(MULTICALL_3_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall3);
  });

  it('returns the network mapping for invalid network but valid address', () => {
    const mapping: Mapping = abiMap({
      network: -1,
      address: GOERLI_MULTICALL_ADDRESS,
    });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(GOERLI_MULTICALL_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall1);
  });

  it('returns the network mapping for an out of bounds network but valid address', () => {
    const mapping: Mapping = abiMap({
      network: 10e6,
      address: GOERLI_MULTICALL_ADDRESS,
    });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(GOERLI_MULTICALL_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall1);
  });

  it('returns the network mapping for valid network', () => {
    const mapping: Mapping = abiMap({ network: 5 });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(MULTICALL_3_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall3);
  });

  it('returns the network mapping for both valid network and valid address', () => {
    const mapping: Mapping = abiMap({
      network: 5,
      address: GOERLI_MULTICALL_ADDRESS,
    });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(GOERLI_MULTICALL_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall1);
  });

  it('prioritizes address over network', () => {
    const mapping: Mapping = abiMap({
      network: 4,
      address: GOERLI_MULTICALL_ADDRESS,
    });
    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(GOERLI_MULTICALL_ADDRESS);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall1);
  });
});
