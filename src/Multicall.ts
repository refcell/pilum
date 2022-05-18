import { ethers } from 'ethers';
import { BaseProvider, Networkish } from '@ethersproject/providers';

import { networks } from './networks';
import { multicall1, multicall2, multicall3 } from './abis';
import { AggregatedCall, ContractCall, ContractCallResult } from 'models';

type Address = string;

// Multicall - A library for calling multiple contracts in aggregate
export class Multicall {
  public provider: BaseProvider;
  public networkId: Networkish;
  public network: object;
  public multicall: object;
  public chainId: number;

  // TODO: cache calls by block

  async constructor(options?: {
    address?: Address;
    provider?: BaseProvider;
    network?: Networkish;
  }) {
    // Extract the network or default to 1
    this.networkId = options && options.network ? options.network : 1;
    // If we have a network but not a provider, let's get the default provider for the given network
    this.provider = options && options.provider ? options.provider : ethers.getDefaultProvider(this.network);
    const { chainId } = await this.provider.getNetwork();
    this.chainId = chainId;
    this.network = networks[chainId.toString()];
    this.multicall = multicall3;
    if (options && options.address) {
      if (this.network["multicall"].toLowerCase() == options.address.toLowerCase()) {
        this.multicall = multicall1;
      } else if (this.network["multicall2"].toLowerCase() == options.address.toLowerCase()) {
        this.multicall = multicall2;
      }
    }

    // TODO: remove debugs
    console.log('provider', this.provider);
    console.log('networkId', this.networkId);
    console.log('network', this.network);
    console.log('Multicall', this.multicall);
    console.log('chainId', this.chainId);
  }

  public static encode(calls: ContractCall[]): AggregatedCall[] {
    const encodedCalls: AggregatedCall[] = [];
    calls.forEach((call, index) => {
      // Grab each call's abi
      const calliface = new ethers.utils.Interface(
        JSON.stringify(call.abi)
      );
      call.calls.forEach((method, calli) => {
        // Encode the call
        const encodedData = calliface.encodeFunctionData(
          method.method,
          method.params
        );
        // Push to the list of encoded calls
        encodedCalls.push({
          contractContextIndex: index,
          contractMethodIndex: calli,
          target: call.contractAddress,
          encodedData,
        });
      });
    });
    return encodedCalls;
  }

  public static async execute(calls: AggregatedCall[]): Promise<AggregateResponse> {
    let ethersProvider = this.getTypedOptions<MulticallOptionsEthers>()
      .ethersProvider;

    if (!ethersProvider) {
      const customProvider = this.getTypedOptions<
        MulticallOptionsCustomJsonRpcProvider
      >();
      if (customProvider.nodeUrl) {
        ethersProvider = new ethers.providers.JsonRpcProvider(
          customProvider.nodeUrl
        );
      } else {
        ethersProvider = ethers.getDefaultProvider();
      }
    }

    const network = await ethersProvider.getNetwork();

    const contract = new ethers.Contract(
      this.getContractBasedOnNetwork(network.chainId),
      this.ABI,
      ethersProvider
    );

    if (this._options.tryAggregate) {
      const contractResponse = (await contract.callStatic.tryBlockAndAggregate(
        false,
        this.mapCallContextToMatchContractFormat(calls)
      )) as AggregateContractResponse;

      return this.buildUpAggregateResponse(contractResponse, calls);
    } else {
      const contractResponse = (await contract.callStatic.aggregate(
        this.mapCallContextToMatchContractFormat(calls)
      )) as AggregateContractResponse;

      return this.buildUpAggregateResponse(contractResponse, calls);
    }
  }


  public async call(calls: ContractCall[] | ContractCall): Promise<ContractCallResult[]> {
    // Array validation
    let callray: ContractCall[] = !Array.isArray(calls) ? [calls] : calls;

    // Encode the calls
    const encoded: AggregatedCall[] = Multicall.encode(callray);

    // Execute the calls
    const execres: AggregatedResult[] = await Multicall.execute(encoded);

    // TODO: remove
    console.log('execres', execres);

    // TODO: actually return the results
    return [];
  }


}

