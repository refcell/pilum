import { SingleCall } from './SingleCall';

export interface SingleResult extends SingleCall {
  return: any[];
  decoded: boolean;
  success: boolean;
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}
