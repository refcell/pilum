import { Multicall } from '../Multicall';

test('Instantiates Multicall Correctly', async () => {
  const multicall = new Multicall();

  
});

test('Can Call Without Instantiation', async () => {
  // Define our calls
  const calls = [
    {
      reference: 'multicall3',
      contractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      abi: [ { name: 'getBlockNumber', type: 'function', inputs: [], outputs: [ { name: 'blockNumber', type: 'uint256' }] } ],
      calls: [{ reference: 'blockNumCall', methodName: 'getBlockNumber', methodParameters: [] }]
    }
  ];

  // Call the Multicall associated functions directly
  let call_results = await Multicall.call(calls);

  // Print the call result
  console.log(call_results);
});