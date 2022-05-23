import { ethers } from 'ethers';

export interface Options {
  abi?: any[];
  multicall?: string;
  provider?: ethers.providers.Provider | ethers.Signer;
  network?: number;
}
