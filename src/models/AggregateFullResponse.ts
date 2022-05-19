export interface AggregateFullResponse {
  results: Array<{
    contractContextIndex: number;
    methodResults: Array<{
      contractMethodIndex: number;
      result: any;
    }>;
  }>;
}