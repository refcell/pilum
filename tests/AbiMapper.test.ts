import { multicall1, multicall2, multicall3 } from '../src/abis';
import { networks } from '../src/networks';
import { Address, Mapping } from '../src/types';
import { constructWithAddress } from '../src';

describe('Constructs Mapping with Address', () => {
  it('Non-existent address returns default mapping', () => {
    const zero: Address = '0x0000000000000000000000000000000000000000';
    const mapping: Mapping = constructWithAddress(zero);

    expect(mapping.found).toBe(false);
    expect(mapping.address).toEqual(networks['1']['multicall3']);
    expect(mapping.network).toEqual(1);
    expect(mapping.abi).toEqual(multicall3);
  });

  it('Existing Multicall 3 properly construct mappings', () => {
    const goerliMulticall3: Address = networks['5']['multicall3'];
    const mapping: Mapping = constructWithAddress(goerliMulticall3);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(goerliMulticall3);
    expect(mapping.network).toEqual(5);
    expect(mapping.abi).toEqual(multicall3);
  });

  it('Existing Multicall 2 properly construct mappings', () => {
    const rinkebyMulticall2: Address = networks['4']['multicall2'];
    const mapping: Mapping = constructWithAddress(rinkebyMulticall2);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(rinkebyMulticall2);
    expect(mapping.network).toEqual(4);
    expect(mapping.abi).toEqual(multicall2);
  });

  it('Existing Multicall 1 properly construct mappings', () => {
    const ropstenMulticall1: Address = networks['3']['multicall1'];
    const mapping: Mapping = constructWithAddress(ropstenMulticall1);

    expect(mapping.found).toBe(true);
    expect(mapping.address).toEqual(ropstenMulticall1);
    expect(mapping.network).toEqual(3);
    expect(mapping.abi).toEqual(multicall1);
  });
});
