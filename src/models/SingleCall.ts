import { BigNumberish } from "ethers";

export interface SingleCall {
  reference: string;
  method: string;
  graceful: boolean;
  value: BigNumberish;
  params: any[];
}