import { Interface } from '@ethersproject/abi';
import { multicall1, multicall2, multicall3 } from './abis';
import { Options } from './models';
import { networks } from './networks';
import { Address, Mapping, Network } from './types';

// Checks if the provided address is a valid multicall address in our network definitions
const constructWithAddress = (address: Address): Mapping => {
  let mapping: Mapping = {
    found: false,
    address: networks['1']['multicall3'],
    network: 1,
    interface: new Interface(multicall3),
    abi: multicall3,
  };

  // Iterate over the networks
  for (const network in networks) {
    // If we have a match, return the network
    const networkObject: Mapping = networkToMapping(
      parseInt(network),
      networks[network],
      address
    );
    if (networkObject.found) {
      mapping = networkObject;
      break;
    }
  }

  return mapping;
};

// Attempts to construct a mapping from a network object with the provided multicall address
const networkToMapping = (
  network: Network,
  networkObject: object,
  address: Address
): Mapping => {
  let mapping: Mapping = {
    found: false,
    address: networks['1']['multicall3'],
    network: 1,
    interface: new Interface(multicall3),
    abi: multicall3,
  };

  if (networkObject['multicall3'].toLowerCase() == address.toLowerCase()) {
    mapping = {
      found: true,
      address: networkObject['multicall3'],
      network,
      interface: new Interface(multicall3),
      abi: multicall3,
    };
  } else if (
    networkObject['multicall2'].toLowerCase() == address.toLowerCase()
  ) {
    mapping = {
      found: true,
      address: networkObject['multicall2'],
      network,
      interface: new Interface(multicall2),
      abi: multicall2,
    };
  } else if (
    networkObject['multicall'].toLowerCase() == address.toLowerCase()
  ) {
    mapping = {
      found: true,
      address: networks[network.toString()]['multicall'],
      network,
      interface: new Interface(multicall1),
      abi: multicall1,
    };
  }

  return mapping;
};

// Maps Multicall address string to an Interface generated from our stored ABIs
// Network defaults to 1 (mainnet) if multicall address isn't found
// If an inconsistency is found between the network and multicall address string,
//  the multicall address is first checked, then we will default to the multicall
//  instance of the provided network
const abiMap = (options?: Options): Mapping => {
  // Craft the default mapping
  let mapping: Mapping = {
    found: false,
    address: networks['1']['multicall3'],
    network: 1,
    interface: new Interface(multicall3),
    abi: multicall3,
  };

  // If we have options
  if (options) {
    // Deconstruct our option parameters
    const { multicall: address, network } = options;

    if (network) {
      const networkObject: object = networks[network.toString()];

      // If we have a network, let's check if we have a multicall address
      if (networkObject) {
        // Try to get multicall with address
        const foundMulticall = networkToMapping(
          network,
          networkObject,
          address || '0x0' // if no address, 0x0 shouldn't work
        );
        if (foundMulticall.found) {
          mapping = foundMulticall;
        } else {
          // The network didn't contain the expected multicall address
          // Check if networks contains the address
          const validatedNetwork: Mapping = constructWithAddress(
            address || '0x0'
          );

          // If the address isn't found, we can use the network
          if (!validatedNetwork.found) {
            // Grab the most up to date multicall address
            if (networkObject['multicall3']) {
              mapping = {
                found: true,
                address: networkObject['multicall3'],
                network,
                interface: new Interface(multicall3),
                abi: multicall3,
              };
            } else if (networkObject['multicall2']) {
              mapping = {
                found: true,
                address: networkObject['multicall2'],
                network,
                interface: new Interface(multicall2),
                abi: multicall2,
              };
            } else if (networkObject['multicall1']) {
              mapping = {
                found: true,
                address: networkObject['multicall1'],
                network,
                interface: new Interface(multicall1),
                abi: multicall1,
              };
            } else {
              // We have to use the default since none of the network multicalls are defined
              // This should really never happen
            }
          } else {
            // Otherwise, use the address
            mapping = validatedNetwork;
          }
        }
      } else {
        // No network, try to find multicall address and use it
        mapping = constructWithAddress(address || '0x0');
      }
    } else {
      // No network, try to find multicall address and use it
      mapping = constructWithAddress(address || '0x0');
    }
  }

  // Return the constructed mapping
  return mapping;
};

export default abiMap;
export { Mapping, abiMap, constructWithAddress, networkToMapping };
