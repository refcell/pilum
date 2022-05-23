import { BigNumber } from 'ethers';
import { ContractCall, Multicall } from 'pilum';
import { collectCTokenAddresses } from './Collect';

// This script calculates the supply and borrow apy per block for eth
// References: https://compound.finance/docs#protocol-math
// Steps
// 1. [CALL] Get the supply rate per block for cETH
// 2. [CALL] Get the borrow rate per block for cETH
// 3. Calculate the supply apy per block
// 4. Calculate the borrow apy per block

// IMMUTABLES
const ETH_MANTISSA = BigNumber.from(10).pow(18);
const BLOCKS_PER_DAY = BigNumber.from(6570); // 13.15 seconds per block
const DAYS_PER_YEAR = BigNumber.from(365);
const eth_addresses = collectCTokenAddresses('cETH');
const CETH = eth_addresses['mainnet'];

/** @global Compound Calls to fetch the supply and borrow rates for cETH */
const calls: ContractCall[] = [
  {
    reference: 'supply',
    address: CETH,
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
    method: 'supplyRatePerBlock',
    params: [],
    value: 0,
  },
  {
    reference: 'borrow',
    address: CETH,
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
    method: 'borrowRatePerBlock',
    params: [],
    value: 0,
  },
];

/**
 * @notice Calculates the supply and borrow apy per block for cETH
 * @returns {object} The supply and borrow apy per block for cETH denominated in `base_unit`
 */
const calculateBlockAPY = async () => {
  // Instantiate a new Multicall
  const multicall = new Multicall();

  // Multicall
  const { results } = await multicall.call(calls);

  // Deconstruct apys from the multicall results
  const supplyApyPerBlock: BigNumber = BigNumber.from(results[0].returnData[1]);
  const borrowApyPerBlock = BigNumber.from(results[1].returnData[1]);

  // Calculate the apys
  const supplyapy = BigNumber.from(1_000_000)
    .mul(
      supplyApyPerBlock
        .mul(BLOCKS_PER_DAY)
        .add(ETH_MANTISSA)
        .pow(DAYS_PER_YEAR)
        .sub(ETH_MANTISSA)
    )
    .div(ETH_MANTISSA.pow(DAYS_PER_YEAR));
  const borrowapy = BigNumber.from(1_000_000)
    .mul(
      borrowApyPerBlock
        .mul(BLOCKS_PER_DAY)
        .add(ETH_MANTISSA)
        .pow(DAYS_PER_YEAR)
        .sub(ETH_MANTISSA)
    )
    .div(ETH_MANTISSA.pow(DAYS_PER_YEAR));

  return {
    supply: supplyapy,
    borrow: borrowapy,
    base_unit: 1_000_000.0, // we want the base unit to be a float
  };
};

export default calculateBlockAPY;
export { calculateBlockAPY };
