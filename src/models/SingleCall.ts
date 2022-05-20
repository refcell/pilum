import { BigNumberish } from 'ethers';

export interface SingleCall {
  reference: string;
  method: string;
  allowFailure?: boolean;
  value: BigNumberish;
  params: any[];
}
