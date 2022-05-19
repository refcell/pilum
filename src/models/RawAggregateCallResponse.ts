import { BigNumber } from "ethers";

// This is the response from the original aggregate call
export interface RawAggregateCallResponse {
  blockNumber: BigNumber;
  returnData: string[];
}