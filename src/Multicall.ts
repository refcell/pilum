import { Contract, ContractInterface, ethers } from 'ethers';
import { networks } from './networks';
import { multicall1, multicall2, multicall3 } from './abis';
import {
  MulticallResponse,
  ContractCall,
  EncodedCall,
  Options,
  RawCallResponse,
  Address,
} from './models';
import { abiMap, Mapping } from './AbiMapper';
import { Interface } from '@ethersproject/abi';

/**
 * @class Multicall
 * @classdesc A library for calling multiple contracts in aggregate
 * @author Andreas Bigger <andreas@nascent.xyz>
 */
export class Multicall {
  public provider: ethers.providers.Provider | ethers.Signer;
  public chainId: number;
  public network: object;
  public multicall: string;
  public abi: object;
  public interface: Interface;

  /**
   * @notice Constructs a Multicall instance
   * @param {Options} options Options for creating the Multicall instance
   * @returns {Multicall} An instance of Multicall
   */
  constructor(options?: Options) {
    // Extract the network or default to 1
    this.chainId = options && options.network ? options.network : 1;
    // If we have a network but not a provider, let's get the default provider for the given network
    this.provider =
      options && options.provider
        ? options.provider
        : ethers.getDefaultProvider(this.chainId);
    this.network = networks[this.chainId.toString()];
    this.abi = multicall3;
    this.multicall = this.network['multicall3'];
    if (options && options.address) {
      if (
        this.network['multicall'].toLowerCase() == options.address.toLowerCase()
      ) {
        this.abi = multicall1;
        this.multicall = this.network['multicall'];
      } else if (
        this.network['multicall2'].toLowerCase() ==
        options.address.toLowerCase()
      ) {
        this.abi = multicall2;
        this.multicall = this.network['multicall2'];
      }
    }
    this.interface = new ethers.utils.Interface(JSON.stringify(this.abi));
  }

  /**
   * @notice Encodes calls using their provided contract abis
   * @param {ContractCall[]} calls An array of raw contract calls that need to be encoded with the provided contract abis
   * @returns {EncodedCall[]} An array of encoded calls
   */
  public static encode(calls: ContractCall[] | ContractCall): EncodedCall[] {
    const callArray: ContractCall[] = !Array.isArray(calls) ? [calls] : calls;
    const encodedCalls: EncodedCall[] = [];
    callArray.forEach((call) => {
      // Grab each call's abi
      const callInterface = new ethers.utils.Interface(call.abi);
      // Encode the call
      const encodedData = callInterface.encodeFunctionData(
        call.method,
        call.params
      );
      // Push to the list of encoded calls
      const newCall = { encodedData, ...call };
      encodedCalls.push(newCall);
    });

    return encodedCalls;
  }

  /**
   * @notice Constructs an ethers Contract
   * @param {ContractCall[]} calls An array of raw contract calls that need to be encoded with the provided contract abis
   * @returns {Contract} An ethers Contract instance
   */
  public static getContract(
    address: string,
    abi: object,
    provider: ethers.providers.Provider | ethers.Signer
  ): Contract {
    // Create the contract interface using the provided abi
    const contractInterface: ContractInterface = new ethers.utils.Interface(
      JSON.stringify(abi)
    );

    // Construct the contract
    return new ethers.Contract(address, contractInterface, provider);
  }

  /**
   * @notice Explodes a call response into an original call + response object
   * @param {RawCallResponse} callres The call response from the multicall contract
   * @param {EncodedCall[]} calls The original calls that were sent to the multicall contract
   * @returns {MulticallResponse} A response object containing the original calls and their responses
   */
  public static explode(
    callres: RawCallResponse,
    calls: EncodedCall[]
  ): MulticallResponse {
    // Build the final result
    const exploded: MulticallResponse = {
      blockNumber: callres.blockNumber,
      blockHash: callres.blockHash,
      results: [],
    };

    // Map call responses to their original calls
    exploded.results = callres.returnData.map((res: any, index: number) => {
      return {
        returnData: res,
        ...calls[index],
      };
    });

    // Finally, return the full response
    return exploded;
  }

  /**
   * @notice Calls the Multicall3 `aggregate3` function with the provided calls
   * @param {EncodedCall[]} calls An array of encoded contract calls
   * @param {Contract} contract The Multicall contract
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public static async aggregate3(
    calls: EncodedCall[],
    contract: Contract
  ): Promise<MulticallResponse> {
    // Construct Multicall3 Aggregate3 Calls
    const a3calls = calls.map((call) => {
      return {
        target: call.address,
        allowFailure: call.allowFailure,
        callData: call.encodedData,
      };
    });

    const callres = await contract.callStatic.aggregate3(a3calls);

    // Call Multicall3 aggregate3 method and get back the returnData[]
    const res: RawCallResponse = {
      returnData: callres,
    };

    return Multicall.explode(res, calls);
  }

  /**
   * @notice Calls the Multicall2 `tryAggregate` function with the provided calls
   * @param {EncodedCall[]} calls An array of encoded contract calls
   * @param {Contract} contract The Multicall contract
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public static async tryAggregate(
    calls: EncodedCall[],
    contract: Contract
  ): Promise<MulticallResponse> {
    // Map calls to the Multicall Call Struct format
    const mcalls = calls.map((call) => {
      return {
        target: call.address,
        callData: call.encodedData,
      };
    });

    const callres = await contract.callStatic.tryBlockAndAggregate(
      // If any call doesn't allow failure, the whole tried aggregation should fail
      calls
        .map((call) => call.allowFailure)
        .reduce((acc, cur) => cur || acc, false),
      mcalls
    );

    const res: RawCallResponse = {
      blockNumber: callres[0],
      blockHash: callres[1],
      returnData: callres[2],
    };

    return Multicall.explode(res, calls);
  }

  /**
   * @notice Calls the Multicall `aggregate` function with the provided calls
   * @param {EncodedCall[]} calls An array of encoded contract calls
   * @param {Contract} contract The Multicall contract
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public static async aggregate(
    calls: EncodedCall[],
    contract: Contract
  ): Promise<MulticallResponse> {
    // Map calls to the Multicall Call Struct format
    const mcalls = calls.map((call) => {
      return {
        target: call.address,
        callData: call.encodedData,
      };
    });

    // Statically call on the multicall contract
    const res = await contract.callStatic.aggregate(mcalls);

    // Translate the raw response into our response format
    const callres: RawCallResponse = {
      blockNumber: res[0],
      returnData: res[1],
    };

    return Multicall.explode(callres, calls);
  }

  /**
   * @notice Executes the Multicall, on the respective Multicall 1, 2, or 3 contracts
   * @param {object} abi The Multicall ABI
   * @param {string} multicall The Multicall contract address
   * @param {ethers.providers.Provider | ethers.Signer} provider The ethers provider to send the multicall to
   * @param {EncodedCall[]} calls An array of encoded contract calls
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public static async execute(
    abi: object,
    multicall: string,
    provider: ethers.providers.Provider | ethers.Signer,
    calls: EncodedCall[]
  ): Promise<MulticallResponse> {
    const contract: Contract = Multicall.getContract(multicall, abi, provider);

    // If the multicall contract has an aggregate3 method, use it
    if (
      contract.interface.functions['aggregate3((address,bool,bytes)[])']?.name
        .length > 0
    ) {
      return await Multicall.aggregate3(calls, contract);
    } else if (
      contract.interface.functions['tryAggregate(bool,(address,bytes)[])']?.name
        .length > 0
    ) {
      // TODO: best design pattern to pass in a tryAggregate graceful param?
      // TODO: maybe in the top-level call methods, an object should be passed in with an option graceful param
      // TODO: and each call's allowFailure flag should also be an optional param
      return await Multicall.tryAggregate(calls, contract);
    } else if (
      contract.interface.functions['aggregate((address,bytes)[])']?.name
        .length > 0
    ) {
      return await Multicall.aggregate(calls, contract);
    } else {
      throw new Error(
        'Multicall contract does not have any supported aggregation method!'
      );
    }
  }

  /**
   * @notice Aggregates a list of calls into a single Multicall and returns the response
   * @notice Since this method is static, a Multicall does not need to be instantiated
   * @param {ContractCall[] | ContractCall} calls An array of contract calls
   * @param {Options} options Optional Multicall parameters
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public static async call(
    calls: ContractCall[] | ContractCall,
    options?: Options
  ): Promise<MulticallResponse> {
    // Encode the calls
    const encoded: EncodedCall[] = Multicall.encode(calls);

    // Craft default configuration
    const map: Mapping = abiMap(options);
    const abi: object = map.abi;
    const address: Address = map.address;
    const provider: ethers.providers.Provider | ethers.Signer =
      options && options.provider
        ? options.provider
        : ethers.getDefaultProvider();

    // Execute and return the calls
    return await Multicall.execute(abi, address, provider, encoded);
  }

  /**
   * @notice Aggregates a list of calls into a single Multicall and returns the response
   * @param {ContractCall[] | ContractCall} calls An array of contract calls
   * @param {Options} options Optional Multicall parameters
   * @returns {Promise<MulticallResponse>} A promise that resolves to the multicall response
   */
  public async call(
    calls: ContractCall[] | ContractCall,
    options?: Options
  ): Promise<MulticallResponse> {
    // Encode the calls
    const encoded: EncodedCall[] = Multicall.encode(calls);

    // Craft custom configuration
    const map: Mapping =
      options && (options.address || options.network)
        ? abiMap(options)
        : {
            found: false,
            abi: this.abi,
            address: this.multicall,
            network: this.chainId,
            interface: this.interface,
          };
    const abi: object = map.abi;
    const address: Address = map.address;
    const provider: ethers.providers.Provider | ethers.Signer =
      options && options.provider ? options.provider : this.provider;

    // Execute and return the calls
    return await Multicall.execute(abi, address, provider, encoded);
  }
}
