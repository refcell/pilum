export interface AggregatedCall {
  contractContextIndex: number;
  contractMethodIndex: number;
  allowFailure: boolean;
  target: string;
  encodedData: string;
}
