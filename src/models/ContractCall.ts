import { SingleCall } from './SingleCall';

export interface ContractCall<SomeContext = any> {
  reference: string;
  contractAddress: string;
  abi: any[];
  calls: SingleCall[];
  context?: SomeContext | undefined;
}