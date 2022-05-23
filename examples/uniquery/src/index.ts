import { BigNumber, ethers } from 'ethers';
import { Multicall, ContractCall } from 'pilum';

// Pre-configured Parameters
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const FEE = 3_000;
const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

/** @global Uniswap V3 Factory Contract Calls */
const FACTORY_CALLS: ContractCall[] = [
  {
    reference: 'getOwner',
    address: UNISWAP_V3_FACTORY,
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
    method: 'owner',
    params: [],
    value: 0,
  },
  {
    reference: 'getPool',
    address: UNISWAP_V3_FACTORY,
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
    method: 'getPool',
    params: [DAI, WETH9, FEE],
    value: 0,
  },
];

/** @global Uniswap V3 Pool Contract Calls */
const createPoolCalls = (address: string) => [
  {
    reference: 'liquidity',
    address: address,
    abi: [
      {
        name: 'liquidity',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            type: 'uint128',
          },
        ],
      },
    ],
    method: 'liquidity',
    params: [],
    value: 0,
  },
  {
    reference: 'fees',
    address: address,
    abi: [
      {
        name: 'protocolFees',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            name: 'token0',
            type: 'uint128',
          },
          {
            name: 'token1',
            type: 'uint128',
          },
        ],
      },
    ],
    method: 'protocolFees',
    params: [],
    value: 0,
  },
];

(async () => {
  // Declare a new Multicall Instance
  const multicall = new Multicall();

  // Multicall the UniV3 Factory
  const { results } = await multicall.call(FACTORY_CALLS);

  // Deconstruct the factory owner
  const factory_owner_bn: string =
    '0x' + results[0].returnData[1].substring(26);
  const factory_owner: string = ethers.utils.getAddress(factory_owner_bn);
  console.log(`Uniswap Factory ${UNISWAP_V3_FACTORY} Owner: ${factory_owner}`);

  // Deconstruct the pool
  const pool: string = '0x' + results[1].returnData[1].substring(26);
  const formatted_pool: string = ethers.utils.getAddress(pool);
  console.log(`
POOL ${formatted_pool}
Token A: ${DAI}
Token B: ${WETH9}
Fee: ${FEE}
`);

  // Use the pool to get it's info
  const pool_calls = createPoolCalls(formatted_pool);

  // Multicall the pool
  const { results: poolres } = await multicall.call(pool_calls);

  // Deconstruct the query results
  const liquidity: BigNumber = BigNumber.from(poolres[0].returnData[1]);
  try {
    console.log(`Pool Liquidity: ${liquidity.toNumber()}`);
  } catch (e) {
    console.log(`Pool Liquidity: ${liquidity}`);
  }
  const fees: BigNumber = BigNumber.from(poolres[1].returnData[1]);
  console.log(`Pool Fees: ${fees.toNumber()}`);

  return;
})();
