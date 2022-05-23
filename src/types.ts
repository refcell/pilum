import { Interface } from 'ethers/lib/utils';

export type Network = number;
export type Address = string;

export interface Mapping {
  found: boolean;
  address: Address;
  network: Network;
  interface: Interface;
  abi: object;
}
