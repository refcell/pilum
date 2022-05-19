import { Contract, ContractInterface, ethers } from 'ethers';
import { BaseProvider } from '@ethersproject/providers';

import { networks } from './networks';
import { multicall1, multicall2, multicall3 } from './abis';
import { AggregateCallResponse, AggregatedCall, AggregateFullResponse, ContractCall, RawAggregateCallResponse } from 'models';

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
    this.multicall = this.network['multicall3'];
    if (options && options.address) {
      if (this.network["multicall"].toLowerCase() == options.address.toLowerCase()) {
        this.abi = multicall1;
        this.multicall = this.network['multicall'];
      } else if (this.network["multicall2"].toLowerCase() == options.address.toLowerCase()) {
        this.abi = multicall2;
        this.multicall = this.network['multicall2'];
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
          allowFailure: method.allowFailure || false,
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

  // Explodes an Aggregate Response into the Full Response
  public static explodeResponse(res: AggregateCallResponse, calls: AggregatedCall[]): AggregateFullResponse {
    // Build the AggregateFullResponse from the Multicall3 Aggregate3Response
    const a3Response: AggregateFullResponse = {
      results: [],
    };

    // Iterate over the return data
    for (let i = 0; i < res.returnData.length; i++) {
      // For existing contracts in the multicall, we can just append to the method results
      const existingResponse = a3Response.results.find(
        (c) => c.contractContextIndex === calls[i].contractContextIndex
      );
      if (existingResponse) {
        existingResponse.methodResults.push({
          result: res.returnData[i],
          contractMethodIndex: calls[i].contractMethodIndex,
        });
      } else {
        a3Response.results.push({
          methodResults: [
            {
              result: res.returnData[i],
              contractMethodIndex: calls[i].contractMethodIndex,
            },
          ],
          contractContextIndex: calls[i].contractContextIndex,
        });
      }
    }

    // Finally, return the full response
    return a3Response;
  }

  // Aggregate3 Call on Multicall3 Contract
  // Builds response from Multicall3 specific response format
  public static async aggregate3(calls: AggregatedCall[], contract: Contract): Promise<AggregateFullResponse> {
    // Call Multicall3 aggregate3 method and get back the returnData[]
    const res = (await contract.callStatic.aggregate3(
      calls.map(call => {
        return {
          target: call.encodedData,
          allowFailure: call.allowFailure,
          callData: call.encodedData,
        }
      })
    )) as AggregateCallResponse;

    return Multicall.explodeResponse(res, calls);
  }

  // tryAggregate Call on Multicall2 or Multicall3 Contract
  public static async tryAggregate(calls: AggregatedCall[], contract: Contract): Promise<AggregateFullResponse> {
    const res = (await contract.callStatic.tryAggregate(
      // If any call doesn't allow failure, the whole tried aggregation should fail
      calls.map(call => call.allowFailure).reduce((acc, cur) => cur || acc, false),
      calls.map(call => {
        return {
          target: call.encodedData,
          callData: call.encodedData,
        }
      })
    )) as AggregateCallResponse;

    return Multicall.explodeResponse(res, calls);
  }

  // tryAggregate Call on Multicall2 or Multicall3 Contract
  public static async aggregate(calls: AggregatedCall[], contract: Contract): Promise<AggregateFullResponse> {
    const res = (await contract.callStatic.aggregate(
      calls.map(call => {
        return {
          target: call.encodedData,
          callData: call.encodedData,
        }
      })
    )) as RawAggregateCallResponse;

    // Translate the raw response into an aggregate3 and tryAggregate response
    // NOTE: Ignores the block number from the response
    const aggregatedResponse: AggregateCallResponse = {
      returnData: res.returnData,
    };

    return Multicall.explodeResponse(aggregatedResponse, calls);
  }

  // Aggregates Calls with verbose parameters
  public static async execVerbose(
    abi: object,
    multicall: string,
    provider: BaseProvider,
    calls: AggregatedCall[]
  ): Promise<AggregateFullResponse> {
    const contract: Contract = Multicall.getContract(multicall, abi, provider);

    // TODO: make this "adaptive" by allowing calls to not specify graceful/allowFailure param
    // TODO: in this case, multicalls should fall back to backwards-compatible method

    // If the multicall contract has an aggregate3 method, use it
    if (contract.interface.functions['aggregate3'].name.length > 0) {
      return await Multicall.aggregate3(calls, contract);
    } else if (contract.interface.functions['tryAggregate'].name.length > 0) {
      // TODO: best design pattern to pass in a tryAggregate graceful param?
      // TODO: maybe in the top-level call methods, an object should be passed in with an option graceful param
      // TODO: and each call's allowFailure flag should also be an optional param
      return await Multicall.tryAggregate(calls, contract);
    } else if (contract.interface.functions['aggregate'].name.length > 0) {
      return await Multicall.aggregate(calls, contract);
    } else {
      throw new Error('Multicall contract does not have any supported aggregation method!');
    }
  }

  public static async execute(abi: object, multicall: string, provider: BaseProvider, calls: AggregatedCall[]): Promise<AggregateFullResponse> {
    return await Multicall.execVerbose(abi, multicall, provider, calls);
  }

  public static async call(calls: ContractCall[] | ContractCall): Promise<AggregateFullResponse> {
    // Array validation
    let callray: ContractCall[] = !Array.isArray(calls) ? [calls] : calls;

    // Encode the calls
    const encoded: AggregatedCall[] = Multicall.encode(callray);

    // Craft default configuration
    const abi: object = multicall3;
    const multicall3Address: string = networks["1"]["multicall3"];
    const provider: BaseProvider = ethers.getDefaultProvider();

    // Execute and return the calls
    return await Multicall.execute(abi, multicall3Address, provider, encoded);
  }

  public async call(calls: ContractCall[] | ContractCall): Promise<AggregateFullResponse> {
    // Array validation
    let callray: ContractCall[] = !Array.isArray(calls) ? [calls] : calls;

    // Encode the calls
    const encoded: AggregatedCall[] = Multicall.encode(callray);

    // Execute and return the calls
    return await Multicall.execute(this.abi, this.multicall, this.provider, encoded);
  }
}

