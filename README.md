<img src="https://avatars.githubusercontent.com/u/71294241?s=400&u=0b62a061c11a7536c27b1d53760152b5e9bd40f5&v=4" alt="Header" style="width:200px;align=center;float: right;" />

## DeFi Adapter Kit

Starter kit for defi adapter development compatible with Opty-Fi's earn-protocol

### Prerequisites

- Install [Node JS](https://nodejs.org/en/download/) >= v12.0.0
- Learn [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and [Typescript](https://www.typescriptlang.org/)
- Learn [Solidity](https://docs.soliditylang.org/en/latest/) >=v0.6.12.
- Learn smart contract development environment like [Hardhat](https://hardhat.org/getting-started/)
- Learn testing framework like [mocha](https://mochajs.org/)
- Learn assertion library like [chai](https://www.chaijs.com/)

And passion for financial freedom...

## Contribution guidelines

1. Join our [Discord](https://discord.com/channels/839603941419646990/879375531789910056).
2. Show your interest on becoming a builder.
3. Reach out to one of the members of OptyFi's team.
4. Sign a builder contract.
5. Get onboarded during the workgroup call.
6. Get assigned a bounty.
7. Buidl!

## Getting started

### Development Setup

- Create a `.env` file and set a BIP-39 compatible mnemonic as an environment variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.
- You will require access to archive Node URL for forking the mainnet.

Proceed with installing dependencies:

```sh
yarn install
```

One of the most important dependencies is **@optyfi/defi-legos**. In that package, OptyFi's dev team has included all the interfaces that need to be implemented in order to create a proper adapter. Those interfaces are: **IAdapter**, **IAdapterInvestLimit**, **IAdapterHarvestReward** and **IAdapterBorrow**. You will find more information below.

### What is a DeFiAdapter

- DeFi adapter is a vital building block for executing [opty.fi](https://opty.fi)'s network of strategies. It is the bridge that allows our vaults to invest in a protocol.
- Specifications for DeFi adapter help perform:
  - transactions like deposit, withdraw, staking, un-staking, adding liquidity, claim reward and harvesting of the reward.
  - read calls for liquidity pool token contract address, liquidity pool token balance, staked token balance, balance in underlying token of both staked and non-staked liquidity pool token, unclaimed reward tokens and reward token contract address
- A DeFi Adapter smart contract requires implementation of following interfaces:
  - IAdapter.sol **(Mandatory)**
  - IAdapterInvestLimit.sol **(Mandatory)**
  - IAdapterHarvestReward.sol **(Optional)**
  - IAdapterBorrow.sol **(Optional)**
  - IAdapterStaking.sol **(Don't use it if possible)**

> Pro Tip : Inherit IAdapterFull interface from IAdapterFull.sol to Adapter Contract if the protocol you choose required implementation of all the above interfaces.

### Developing DeFiAdapter

#### Step #1 - Use this template

- This is a GitHub template, so click on green button "Use this template" on the top-right corner of the page to create new defi adapter.

#### Step #2 - Explore the protocol

- Choose a DeFi protocol and dig into it. The deeper understanding you have of the protocol, the faster you will code the adapter and the better the adapter will be.
- A suggested plan of attack is:
  1. Explore the UI. This will help you discover the major features of the protocol.
  2. Read the docs. Some protocols have both _docs_ and _developer docs_. Sometimes they may be insufficient to gain in-depth understanding, but you are likely to find important contract addresses there that will help you with the next steps.
  3. Find the fee model. **If the protocol have either deposit or withdrawal fee, it is not compatible with OptyFi's architecture**. If not, you can continue.
  4. Check protocol's smart contracts. Everything you need to know will be there: math models, functionalities, fees, rewards,...

#### Step #3 - Pool(s), LP token(s) and underlying token(s) address gathering

- Gather protocol pool data using [defi-legos](https://github.com/Opty-Fi/defi-legos). Make a PR in defi-legos repo for any missing data. It will get reviewed and published on `npm` by optyfi team

#### Step #4 - Implementing `IAdapter` interface(s)

- Implement an adapter contract using above interface(s) similar to [HarvestFinanceAdapter.sol](./contracts/1_ethereum/harvest.finance/HarvestFinanceAdapter.sol).
- You just have to import the files and inherit the interfaces like this:

```
// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@optyfi/defi-legos/interfaces/defiAdapters/contracts/IAdapterInvestLimit.sol";

contract HarvestFinanceAdapter is IAdapterInvestLimit {
    /** @notice  Maps liquidityPool to max deposit value in percentage */
    mapping(address => uint256) public maxDepositPoolPct; // basis points

    /**
     * @inheritdoc IAdapterInvestLimit
     */
    function setMaxDepositPoolPct(address _liquidityPool, uint256 _maxDepositPoolPct) external override {
        maxDepositPoolPct[_liquidityPool] = _maxDepositPoolPct;
    }
}
```

- Take into account that most of the times, some of the interfaces can be omitted.

#### Step #5 - Unit Tests

- Write unit tests for all the functions across all the pool contracts gathered in Step 1.
- You might want to use a test utility contract like [TestDeFiAdapter](./contracts/mock/TestDeFiAdapter.sol) for creating a sandbox environment to execute the transaction based on function signature and target address returned from `getCodes()`-style functions from DeFiAdapter.
- All other functions can be directly tested from the DeFiAdapter contract.
- The unit test for `HarvestFinanceAdapter.sol` can be found in [HarvestFinanceAdapter.ts](./test/1_ethereum/harvest.finance/HarvestFinanceAdapter.ts)

#### Considerations when writing adapters

##### ETH or WETH?

Some protocols accept ETH, WETH, or even both, so code your adapter accordingly. _If the protocol accepts ETH, you will have to create an ETH gateway_. Have [Lido adapter](https://github.com/Opty-Fi/defi-adapters/tree/main/contracts/1_ethereum/2_lido.fi) as a reference.

##### Different versions

DeFi is constantly evolving as well as their protocols so it is important to check whether all the pools or vaults have the same ABI. In some cases, a protocol can have active V1 and V2 vaults at the same time. You will need to decide either you can handle that situation with a single adapter or you will need two different adapters.

#### Useful commands

| Usage                                                                           | Command                                |
| ------------------------------------------------------------------------------- | -------------------------------------- |
| Compile the smart contracts with Hardhat                                        | `$ yarn compile`                       |
| Compile the smart contracts and generate TypeChain artifacts                    | `$ yarn typechain`                     |
| Lint the Solidity Code                                                          | `$ yarn lint:sol`                      |
| Lint the TypeScript Code                                                        | `$ yarn lint:ts`                       |
| Run the Mocha tests                                                             | `$ yarn test:<name_of_the_chain>:fork` |
| Run the Mocha tests for an Ethereum adapter                                     | `$ yarn test:ethereum:fork`            |
| Generate the code coverage report                                               | `$ yarn coverage`                      |
| Delete the smart contract artifacts, the coverage reports and the Hardhat cache | `$ yarn clean`                         |
| Deploy the adapter to Hardhat Network                                           | `$ yarn deploy`                        |

> You can find all the scripts in [package.json](./package.json)

#### Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.6.12+commit.27d51765",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.6.12+commit.27d51765` can be replaced with any other version.

### References

- [Hardhat](https://hardhat.org/getting-started/)
- [Ethereum Development Documentation](https://ethereum.org/en/developers/docs/)
- [Harvest Finance Docs](https://harvest-finance.gitbook.io/harvest-finance/)

### Contact the team

Have in mind that OptyFi’s team have already created a bunch of adapters. Don’t hesitate to contact us to solve your doubts. It can happen that you face a protocol that doesn’t work like the previous ones we have created, so it could be useful to reach out to someone that unblocks you.

[OptyFi's protocols integrations channel](https://discord.com/channels/839603941419646990/879375531789910056)
