import { BigNumber } from 'ethers';
import { Multicall } from 'pilum';
import { collectCTokenAddresses } from './Collect';

// This script calculates the supply and borrow apy per block for eth
// References: https://compound.finance/docs#protocol-math
// Steps
// 1. [CALL] Get the supply rate per block for cETH
// 2. [CALL] Get the borrow rate per block for cETH
// 3. Calculate the supply apy per block
// 4. Calculate the borrow apy per block

// IMMUTABLES
const ETH_MANTISSA = 1e18;
const BLOCKS_PER_DAY = 6570; // 13.15 seconds per block
const DAYS_PER_YEAR = 365;
const eth_addresses = collectCTokenAddresses('cETH');
const CETH = eth_addresses['mainnet'];

// Define the calls to be queried with multicall
const craftCalls = () => [
  {
    reference: 'supply',
    contractAddress: CETH,
    abi: [
      {
        name: 'supplyRatePerBlock',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            type: 'uint256',
          },
        ],
      },
    ],
    calls: [
      {
        reference: 'supply',
        method: 'supplyRatePerBlock',
        params: [],
        value: 0,
      },
    ],
  },
  {
    reference: 'borrow',
    contractAddress: CETH,
    abi: [
      {
        name: 'borrowRatePerBlock',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            type: 'uint256',
          },
        ],
      },
    ],
    calls: [
      {
        reference: 'borrow',
        method: 'borrowRatePerBlock',
        params: [],
        value: 0,
      },
    ],
  },
];

// Performs the Exchange Rate Calculation from tokena to the underlying tokenb
const calculateBlockAPY = async () => {
  // Instantiate a new Multicall
  const multicall = new Multicall();

  // Craft calls (can be statically defined)
  const calls = craftCalls();

  // Multicall
  const { results } = await multicall.call(calls);

  console.log(results);

  // Deconstruct decimals and exchange rate from results
  // const underlyingDecimals: BigNumber = BigNumber.from(
  //   results[0].methodResults[0].returnData[1]
  // );
  // const exchangeRateStored: BigNumber = BigNumber.from(
  //   results[1].methodResults[0].returnData[1]
  // );

  // // Calculate the mantissa differential
  // const mantissa: BigNumber = BigNumber.from(18)
  //   .add(underlyingDecimals)
  //   .sub(C_TOKEN_DECIMALS);

  // // Calculate the ratio of 1 cToken to DAIs using the mantissa differential
  // const oneCTokenInUnderlying: BigNumber = exchangeRateStored
  //   .mul(BigNumber.from(1000)) // Scale by 1000 to avoid rounding truncation
  //   .div(BigNumber.from(10).pow(mantissa));

  // // Try to convert the amount to a number, otherwise print the raw BigNumber
  // try {
  //   const amount: number = oneCTokenInUnderlying.toNumber() / 1000.0; // Scale back down to float
  //   return amount;
  // } catch (e) {
  //   throw new Error(`Could not convert ${oneCTokenInUnderlying} to number`);
  // }
};

export default calculateBlockAPY;
export { calculateBlockAPY };
