export interface AggregateFullResponse {
  results: Array<{
    contractContextIndex: number;
    methodResults: Array<{
      contractMethodIndex: number;
      blockNumber?: any;
      blockHash?: string;
      returnData: any;
    }>;
  }>;
}
