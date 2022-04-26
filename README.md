<img align="right" width="150" height="150" top="100" src="./assets/parcels.png">

# parcels • [![tests](https://github.com/abigger87/parcels/actions/workflows/tests.yml/badge.svg)](https://github.com/abigger87/parcels/actions/workflows/tests.yml) [![lints](https://github.com/abigger87/parcels/actions/workflows/lints.yml/badge.svg)](https://github.com/abigger87/parcels/actions/workflows/lints.yml) ![GitHub](https://img.shields.io/github/license/abigger87/parcels)  ![GitHub package.json version](https://img.shields.io/github/package-json/v/abigger87/parcels)

<!-- <hr width="80%" /> -->

<!-- <img style="padding:2px 2px 2px 0;margin:0;" align="left" alt="tests" src="https://github.com/abigger87/parcels/actions/workflows/tests.yml/badge.svg" />
<img style="padding:2px 2px 2px 0;margin:0;" align="left" alt="lints" src="https://github.com/abigger87/parcels/actions/workflows/lints.yml/badge.svg" />
<img style="padding:2px 2px 2px 0;margin:0;" align="left" alt="Github" src="https://img.shields.io/github/license/abigger87/parcels" />
<img style="padding:2px 2px 2px 0;margin:0;" align="left" alt="Version" src="https://img.shields.io/github/package-json/v/abigger87/parcels" /
 -->
<!-- <br />
<br />
<br /> -->

A Rigorously Tested, Modern, Opinionated Multicall Library


**⚠️ Depreciation Notice ⚠️**
-------------------------
-------------------------

This Repository is not maintained and is only used as a Proof-of-Concept for [Multicall3](https://github.com/mds1/multicall) as part of [Matt Solomon](https://github.com/mds1)'s maintained [multicall repository](https://github.com/mds1/multicall).

[mds1/multicall](https://github.com/mds1/multicall) is an actively maintained fork from MakerDAO's inactive [multicall repository](https://github.com/makerdao/multicall).

-------------------------

## Overview

Adapted from Makerdao's [`multicall`](https://github.com/makerdao/multicall), this library provides a simple way to call multiple contracts at once.

Built with [`foundry`](https://github.com/gakonst/foundry), parcels is rigorously tested and maintained.

## Deployed Contracts

```md
// TODO: Deploy Contracts
```

| Chain   | Address |
| ------- | ------- |
| Mainnet | [](https://etherscan.io/address/#contracts) |
| Kovan   | [](https://kovan.etherscan.io/address/) |
| Rinkeby | [](https://rinkeby.etherscan.io/address/) |
| Görli   | [](https://goerli.etherscan.io/address/) |
| Ropsten | [](https://ropsten.etherscan.io/address/) |
| xDai    | [](https://blockscout.com/poa/dai/address/) |
| Polygon | [](https://explorer-mainnet.maticvigil.com/address/)
| Mumbai  | [](https://explorer-mumbai.maticvigil.com/address/)


## Blueprint

```ml
lib
├─ ds-test — https://github.com/dapphub/ds-test
├─ forge-std — https://github.com/brockelmore/forge-std
├─ solmate — https://github.com/Rari-Capital/solmate
├─ clones-with-immutable-args — https://github.com/wighawag/clones-with-immutable-args
src
├─ tests
│  └─ Multicall.t — "Multicall Tests"
└─ Multicall — "The Multicall Contract"
```

## Development

#### First time with Forge/Foundry?

See the official Foundry installation [instructions](https://github.com/gakonst/foundry/blob/master/README.md#installation).

Don't have [rust](https://www.rust-lang.org/tools/install) installed?
Run
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then, install the [foundry](https://github.com/gakonst/foundry) toolchain installer (`foundryup`) with:
```bash
curl -L https://foundry.paradigm.xyz | bash
```

Now that you've installed the `foundryup` binary,
anytime you need to get the latest `forge` or `cast` binaries,
you can run `foundryup`.

So, simply execute:
```bash
foundryup
```

🎉 Foundry is installed! 🎉

#### Configure Foundry

Using [foundry.toml](./foundry.toml), Foundry is easily configurable.

#### Setup

```bash
make
# OR #
make setup
```

#### Install DappTools

Install DappTools using their [installation guide](https://github.com/dapphub/dapptools#installation).


#### Build

```bash
make build
```

#### Run Tests

```bash
make test
```

## License

[AGPL-3.0-only](https://github.com/abigger87/parcels/blob/master/LICENSE)

# Acknowledgements

- [foundry](https://github.com/gakonst/foundry)
- [solmate](https://github.com/Rari-Capital/solmate)
- [forge-std](https://github.com/brockelmore/forge-std)
- [clones-with-immutable-args](https://github.com/wighawag/clones-with-immutable-args).
- [foundry-toolchain](https://github.com/onbjerg/foundry-toolchain) by [onbjerg](https://github.com/onbjerg).
- [forge-template](https://github.com/FrankieIsLost/forge-template) by [FrankieIsLost](https://github.com/FrankieIsLost).
- [Georgios Konstantopoulos](https://github.com/gakonst) for [forge-template](https://github.com/gakonst/forge-template) resource.

## Disclaimer

_These smart contracts are being provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the user interface or the smart contracts. They have not been audited and as such there can be no assurance they will work as intended, and users may experience delays, failures, errors, omissions, loss of transmitted information or loss of funds. The creators are not liable for any of the foregoing. Users should proceed with caution and use at their own risk._
