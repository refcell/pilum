<img align="right" width="150" height="150" top="100" src="./assets/parcels.png">

# parcels • [![tests](https://github.com/abigger87/parcels/actions/workflows/tests.yml/badge.svg)](https://github.com/abigger87/parcels/actions/workflows/tests.yml) [![lints](https://github.com/abigger87/parcels/actions/workflows/lints.yml/badge.svg)](https://github.com/abigger87/parcels/actions/workflows/lints.yml) ![GitHub](https://img.shields.io/github/license/abigger87/parcels)  ![GitHub package.json version](https://img.shields.io/github/package-json/v/abigger87/parcels)

Lightweight, Modern, Typescript Library for **[Multicall3](https://github.com/mds1/multicall)**.

Multicall3 flexibly aggregates results from multiple smart contract function calls. By allowing the caller to specify an additional parameter per call (a boolean for if the call should be required to succeed), the call results _can_ be aggregated gracefully on a per-call basis.

Since calls are bundled as a single JSON-RPC request to the Multicall3 contract, this dramatically reduces the load on RPC servers, especially important for remote hosts like Infura and Alchemy. Additionally, packing calls in one request causes the calls to be executed in the same block, with the block number returned so potential responses from outdated RPC nodes may be ignored.

By default, the deployed [Multicall3](https://github.com/mds1/multicall/blob/master/src/Multicall3.sol) contract is used. This can be overridden (more details provided below in [Custom-Multicall-Contracts](####Custom-Multicall-Contracts)).

But, [Multicall3](https://github.com/mds1/multicall/blob/master/src/Multicall3.sol) is highly recommendeded. It's ABI is backwards compatible with Multicall and Multicall2, but it's cheaper to use (so you can fit more calls into a single request), and it adds an `aggregate3` method so you can specify whether calls are allowed to fail on a per-call basis. Additionally, it's deployed on every network at the same address.


## Usage



#### Custom Multicall Contracts

By default, the deployed [Multicall3](https://github.com/mds1/multicall/blob/master/src/Multicall3.sol) contract is used. This can be overridden by specifying the `address` parameter in the constructor like so:

```typescript
const multicall = new Multicall({
  address: '0xcA11bde05977b3631167028862bE2a173976CA11',
});
```


## Development

**Repository Blueprint**

```ml
src
├─ tests
│  └─ Multicall.t — "Multicall Tests"
├─ index.ts — "Package Re-exports"
└─ Multicall — "The Multicall Contract"
```


## License

[AGPL-3.0-only](https://github.com/abigger87/parcels/blob/master/LICENSE)

## Acknowledgements

- [Multicall3](https://github.com/mds1/multicall)
- [snapshot.js](https://github.com/snapshot-labs/snapshot.js)
- [MakerDAO's Multicall](https://github.com/makerdao/multicall)
- [0xSequence's Multicall](https://github.com/0xsequence/sequence.js)
- [ethereum-multicall](https://github.com/joshstevens19/ethereum-multicall)
- [foundry](https://github.com/gakonst/foundry)


## Disclaimer

_This library is provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the user interface or library code. None of the content present here has been audited and as such there can be no assurance it will work as intended, and users may experience delays, failures, errors, omissions, loss of transmitted information or loss of funds. The creators are not liable for any of the foregoing. Users should proceed with caution and use at their own risk._
