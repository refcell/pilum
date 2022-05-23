import { goerli, kovan, mainnet, rinkeby, ropsten } from './config';

/**
 * @notice Collects the token addresses across the 5 compound-deployed networks
 * @param {string} symbol The token symbol
 * @returns {object} The token addresses across the 5 compound-deployed networks
 */
const collectCTokenAddresses = (symbol: string) => {
  return {
    goerli: goerli['Contracts'][symbol],
    kovan: kovan['Contracts'][symbol],
    mainnet: mainnet['Contracts'][symbol],
    rinkeby: rinkeby['Contracts'][symbol],
    ropsten: ropsten['Contracts'][symbol],
  };
};

export default collectCTokenAddresses;
export { collectCTokenAddresses };
