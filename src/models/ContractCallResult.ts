
import { ContractCall } from './ContractCall';
import { CallResult } from './CallResult';

export interface ContractCallResult {
  call: ContractCall;
  result: CallResult[];
}

export interface ContractCallResults {
  results: { [key: string]: ContractCallReturnContext };
  blockNumber: number;
}