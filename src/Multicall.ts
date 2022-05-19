import { Contract, ContractInterface, ethers } from 'ethers';
import { BaseProvider, Networkish } from '@ethersproject/providers';

import { networks } from './networks';
import { multicall1, multicall2, multicall3 } from './abis';
import { Aggregate3FullResponse, Aggregate3Response, AggregatedCall, ContractCall, ContractCallResult } from 'models';

type Address = string;

// Multicall - A library for calling multiple contracts in aggregate
export class Multicall {
  public provider: BaseProvider;
  public chainId: number;
  public network: object;
  public multicall: string;
  public abi: object;

  // TODO: cache calls by block

  constructor(options?: {
    address?: Address;
    provider?: BaseProvider;
    network?: number;
  }) {
    // Extract the network or default to 1
    this.chainId = options && options.network ? options.network : 1;
    // If we have a network but not a provider, let's get the default provider for the given network
    this.provider = options && options.provider ? options.provider : ethers.getDefaultProvider(this.chainId);
    this.network = networks[this.chainId.toString()];
    this.abi = multicall3;
    this.multicall = this.network['multicall'];
    if (options && options.address) {
      if (this.network["multicall"].toLowerCase() == options.address.toLowerCase()) {
        this.abi = multicall1;
        this.multicall = this.network['multicall2'];
      } else if (this.network["multicall2"].toLowerCase() == options.address.toLowerCase()) {
        this.abi = multicall2;
        this.multicall = this.network['multicall3'];
      }
    }

    // TODO: remove debugs
    console.log('provider', this.provider);
    console.log('chainId', this.chainId);
    console.log('network', this.network);
    console.log('Multicall', this.multicall);
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
          allowFailure: method.allowFailure,
          target: call.contractAddress,
          encodedData,
        });
      });
    });
    return encodedCalls;
  }

  // Constructs an ethers Contract
  public static getContract(address: string, abi: object, provider: ethers.providers.Provider | ethers.Signer): Contract {
    // Create the contract interface using the provided abi
    const contractInterface: ContractInterface = new ethers.utils.Interface(JSON.stringify(abi));

    // Construct the contract
    return new ethers.Contract(
      address,
      contractInterface,
      provider
    );
  }

  // Aggregate3 Call on Multicall3 Contract
  // Builds response from Multicall3 specific response format
  public async aggregate3(calls: AggregatedCall[], contract: Contract): Promise<Aggregate3FullResponse> {
    // Call Multicall3 aggregate3 method and get back the returnData[]
    const contractResponse = (await contract.callStatic.aggregate3(
      calls.map(call => {
        return {
          target: call.encodedData,
          allowFailure: call.allowFailure,
          callData: call.encodedData,
        }
      })
    )) as Aggregate3Response;

    // Build the Aggregate3FullResponse from the Multicall3 Aggregate3Response
    const a3Response: Aggregate3FullResponse = {
      results: [],
    };

    for (let i = 0; i < contractResponse.returnData.length; i++) {
      const existingResponse = aggregateResponse.results.find(
        (c) => c.contractContextIndex === calls[i].contractContextIndex
      );
      if (existingResponse) {
        existingResponse.methodResults.push({
          result: contractResponse.returnData[i],
          contractMethodIndex: calls[i].contractMethodIndex,
        });
      } else {
        aggregateResponse.results.push({
          methodResults: [
            {
              result: contractResponse.returnData[i],
              contractMethodIndex: calls[i].contractMethodIndex,
            },
          ],
          contractContextIndex: calls[i].contractContextIndex,
        });
      }
    }

    return a3Response;
  }

  // Aggregates Calls with verbose parameters
  public static async execVerbose(
    abi: object,
    multicall: string,
    version: number,
    provider: BaseProvider,
    calls: AggregatedCall[]
  ): Promise<AggregateResponse> {
    const contract: Contract = Multicall.getContract(multicall, abi, provider);

    // Vary call by multicall version and gracefull specification
    switch (version) {
      case 1: {

      }
      case 2: {

      }
      case 3: {

      }
    }


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

  public static async execute(calls: AggregatedCall[]): Promise<AggregateResponse> {
    return await Multicall.execVerbose(ethers.getDefaultProvider(), calls);
  }

  public async execute(calls: AggregatedCall[]): Promise<AggregateResponse> {
    return await Multicall.execVerbose(this.provider, calls);
  }


  public async call(calls: ContractCall[] | ContractCall): Promise<ContractCallResult[]> {
    // Array validation
    let callray: ContractCall[] = !Array.isArray(calls) ? [calls] : calls;

    // Encode the calls
    const encoded: AggregatedCall[] = Multicall.encode(callray);

    // Execute the calls
    const execres: AggregatedResult[] = await Multicall.execute(encoded);

    // TODO: remove
    console.log('exec result:', execres);

    // TODO: actually return the results
    return [];
  }


}

