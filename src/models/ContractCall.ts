import { BigNumberish } from 'ethers';

export interface ContractCall {
  reference: string;
  method: string;
  address: string;
  abi: any[];
  allowFailure?: boolean;
  value: BigNumberish;
  params: any[];
}

export interface EncodedCall extends ContractCall {
  encodedData: string;
}

export interface SingleCallResult extends EncodedCall {
  returnData: any;
}

// The raw data returned from the static multicall
export interface RawCallResponse {
  blockNumber?: any;
  blockHash?: string;
  returnData: any;
}

// The final response, translating each calls' raw return data to its original ContractCall
export interface MulticallResponse {
  blockNumber?: any;
  blockHash?: string;
  results: SingleCallResult[];
}
