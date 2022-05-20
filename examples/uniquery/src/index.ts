import { Multicall } from 'pilum';

// Pre-configured Parameters
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const FEE = 3_000;
const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

// Define our calls
const calls = [
  {
    reference: 'getOwner',
    contractAddress: UNISWAP_V3_FACTORY,
    abi: [
      {
        name: 'owner',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
      },
    ],
    calls: [
      {
        reference: 'getOwner',
        method: 'owner',
        params: [],
        value: 0,
      },
    ],
  },
  {
    reference: 'getPool',
    contractAddress: UNISWAP_V3_FACTORY,
    abi: [
      {
        name: 'getPool',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          {
            type: 'address',
          },
          {
            type: 'address',
          },
          {
            type: 'uint24',
          },
        ],
        outputs: [
          {
            type: 'address',
          },
        ],
      },
    ],
    calls: [
      {
        reference: 'getPool',
        method: 'getPool',
        params: [DAI, WETH9, FEE],
        value: 0,
      },
    ],
  },
];

(async () => {
  // Declare a new Multicall Instance
  const multicall = new Multicall();

  // Multicall the UniV3 LPs
  const { results } = await multicall.call(calls);

  // Validate the results
  expect(results.length).toBe(2);

  console.log(results);
})();
