import { ethers } from 'ethers';
import { BaseProvider, Networkish } from '@ethersproject/providers';

import { networks } from './networks';
import { multicall1, multicall2, multicall3 } from './abis';
import { ContractCall, ContractCallResult } from 'models';

// Multicall - A library for calling multiple contracts in aggregate
export class Multicall {
  public provider: BaseProvider;
  public network: Networkish;

  // TODO: cache calls by block

  constructor(options?: {
    provider?: BaseProvider;
    network?: Networkish;
  }) {
    // Extract the network or default to 1
    this.network = options && options.network ? options.network : 1;
    // If we have a network but not a provider, let's get the default provider for the given network
    this.provider = options && options.provider ? options.provider : ethers.getDefaultProvider(this.network);
  }

  public async call(calls: ContractCall[] | ContractCall): Promise<ContractCallResult[]> {

  }

}


export class Multicaller {
  public network: string;
  public provider: StaticJsonRpcProvider;
  public abi: any[];
  public options: any = {};
  public calls: any[] = [];
  public paths: any[] = [];

  constructor(
    network: string,
    provider: StaticJsonRpcProvider,
    abi: any[],
    options?
  ) {
    this.network = network;
    this.provider = provider;
    this.abi = abi;
    this.options = options || {};
  }

  call(path, address, fn, params?): Multicaller {
    this.calls.push([address, fn, params]);
    this.paths.push(path);
    return this;
  }

  async execute(from?: any): Promise<any> {
    const obj = from || {};
    const result = await multicall(
      this.network,
      this.provider,
      this.abi,
      this.calls,
      this.options
    );
    result.forEach((r, i) => set(obj, this.paths[i], r.length > 1 ? r : r[0]));
    this.calls = [];
    this.paths = [];
    return obj;
  }

  async function multicall(
    network: string,
    provider,
    abi: any[],
    calls: any[],
    options?
  ) {
    const multicallAbi = [
      'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'
    ];
    const multi = new Contract(
      networks[network].multicall,
      multicallAbi,
      provider
    );
    const itf = new Interface(abi);
    try {
      const max = options?.limit || 500;
      const pages = Math.ceil(calls.length / max);
      const promises: any = [];
      Array.from(Array(pages)).forEach((x, i) => {
        const callsInPage = calls.slice(max * i, max * (i + 1));
        promises.push(
          multi.aggregate(
            callsInPage.map((call) => [
              call[0].toLowerCase(),
              itf.encodeFunctionData(call[1], call[2])
            ]),
            options || {}
          )
        );
      });
      let results: any = await Promise.all(promises);
      results = results.reduce((prev: any, [, res]: any) => prev.concat(res), []);
      return results.map((call, i) =>
        itf.decodeFunctionResult(calls[i][1], call)
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }


}

