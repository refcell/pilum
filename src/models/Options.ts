import { ethers } from 'ethers';

export interface Options {
  abi?: any[];
  address?: string;
  provider?: ethers.providers.Provider | ethers.Signer;
  network?: number;
  // TODO
  // returnBlockNumber?: boolean;
  // returnBlockHash?: boolean;
}
