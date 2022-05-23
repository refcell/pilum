import { BigNumber } from 'ethers';
import { ContractCall, Multicall } from 'pilum';
import { collectCTokenAddresses } from './Collect';

// This script calculates the price of Token A in underlying Token B
// References: https://compound.finance/docs#protocol-math
// Steps
// 1. [CALL] Get the number of underlying decimals of Token B
// 2. [CALL] Get the current exchange rate of Token A
// 3. Calculate the mantissa
// 4. Calculate ratio of 1 Token A to Token B

// Define the calls to be queried with multicall
const craftCalls = (tokena: string, tokenb: string): ContractCall[] => [
  // Get the number of underlying decimals of token b
  {
    reference: 'decimals',
    address: tokenb,
    abi: [
      {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
          {
            type: 'uint8',
          },
        ],
      },
    ],
    method: 'decimals',
    params: [],
    value: 0,
  },
  // Get the current exchange rate of token a
  {
    reference: 'exchangeRate',
    address: tokena,
    abi: [
      {
        name: 'exchangeRateStored',
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
    method: 'exchangeRateStored',
    params: [],
    value: 0,
  },
];

// Performs the Exchange Rate Calculation from tokena to the underlying tokenb
const calculateExchangeRate = async (tokena: string, tokenb: string) => {
  // Instantiate a new Multicall
  const multicall = new Multicall();

  // Get the token addresses using compounds configuration library
  const b_addresses = collectCTokenAddresses(tokenb);
  const b_mainnet = b_addresses['mainnet'];
  const a_addresses = collectCTokenAddresses(tokena);
  const a_mainnet = a_addresses['mainnet'];
  const C_TOKEN_DECIMALS = 8; // All cTokens have 8 decimals

  // Craft calls using the derived token addresses
  const calls = craftCalls(a_mainnet, b_mainnet);

  // Multicall
  const { results } = await multicall.call(calls);

  // Deconstruct decimals and exchange rate from results
  const underlyingDecimals: BigNumber = BigNumber.from(
    results[0].returnData[1]
  );
  const exchangeRateStored: BigNumber = BigNumber.from(
    results[1].returnData[1]
  );

  // Calculate the mantissa differential
  const mantissa: BigNumber = BigNumber.from(18)
    .add(underlyingDecimals)
    .sub(C_TOKEN_DECIMALS);

  // Calculate the ratio of 1 cToken to DAIs using the mantissa differential
  const oneCTokenInUnderlying: BigNumber = exchangeRateStored
    .mul(BigNumber.from(1000)) // Scale by 1000 to avoid rounding truncation
    .div(BigNumber.from(10).pow(mantissa));

  // Try to convert the amount to a number, otherwise print the raw BigNumber
  try {
    const amount: number = oneCTokenInUnderlying.toNumber() / 1000.0; // Scale back down to float
    return amount;
  } catch (e) {
    throw new Error(`Could not convert ${oneCTokenInUnderlying} to number`);
  }
};

export default calculateExchangeRate;
export { calculateExchangeRate };
