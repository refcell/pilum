export interface Aggregate3FullResponse {
  results: Array<{
    contractContextIndex: number;
    methodResults: Array<{
      contractMethodIndex: number;
      result: any;
    }>;
  }>;
}