# Adapter’s Manual

## How to build an adapter

### Research

To build an adapter it is necessary to understand how the protocol you are building an adapter for works. To gain an understanding, the suggested approach is:

1. Interact with protocol’s UI to familiarize with major features
2. Check protocol’s docs (**<span style="text-decoration:underline;">note:</span>** protocol can have both _docs_ and _developer docs_)
3. The docs may be insufficient to gain in-depth understanding. If so, a suggested plan of attack is:
   1. Check protocol’s smart contracts directly
   2. Gather list of important smart contracts (e.g., Comptroller and cTokens in Compound or LendingPoolAddressProvider and aTokens in Aave)

### Coding

First of all, after understanding the protocol, choose which ones of the adapters interfaces you will need to inherit in your adapter smart contract. Most of the time, some of the interfaces can be omitted. Then, you will be ready to code the logic of the functions. As you know, the functions in our adapters return batches of code that will be executed by the vault contracts so **_all you need to include in that logic are the (encoded) signatures of the functions with the proper arguments_**. Feel free (we encourage you), to check the adapters that have been already done by OptyFi’s team and use them as a reference.

**Note**: if the protocol supports staking, create two different adapters: ProtocolXXXDepositAdapter and ProtocolXXXStakingAdapter. Previous adapters coded by OptyFi's team included staking as part of the deposit adapter but we decided to keep staking and depositing separated. _This means that `canStake` function should always return `false`._

### TL;DR:

1. Locate useful interface
2. Find the functions you will need.
3. Gather function signatures (with proper variables!).

### Considerations when writing adapters

#### Functions’ signatures

In other protocols, they usually have auto-explanatory names, but it can happen that the logic doesn’t correspond completely with the function’s name. Take care and check if the logic of the function represents what the name says.

#### ETH or WETH?

Some protocols accept ETH, WETH, or even both, so code your adapter accordingly. _If the protocol accepts ETH, you will have to create an ETH gateway_ contract the same way we did it for Compound.

#### Different versions

DeFi is constantly evolving as well as their protocols so it is important to check whether all the pools or vaults have the same ABI. In some cases, a protocol can have active V1 and V2 vaults at the same time. You will need to decide either you can handle that situation with a single adapter or you will need two different adapters.

#### Check the fees

Some protocols implement withdrawal fees (usually a percentage of the withdrawn amount). Please check this because a protocol like OptyFi, which is constantly rebalancing and switching strategies, can not afford paying a withdrawal fee. **_Note:_** This may mean the adapter will not be used.

#### Contact the team

Have in mind that OptyFi’s team have already created a bunch of adapters. Don’t hesitate to contact them to solve your doubts. It can happen that you face a protocol that doesn’t work like the previous ones we have created, so it could be useful to reach out to someone that unblocks you.
