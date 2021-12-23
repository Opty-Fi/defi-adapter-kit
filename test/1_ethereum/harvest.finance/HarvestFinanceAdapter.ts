import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { getAddress } from "ethers/lib/utils";
import { HarvestFinanceAdapter } from "../../../typechain/HarvestFinanceAdapter";
import { TestDeFiAdapter } from "../../../typechain/TestDeFiAdapter";
import { LiquidityPool, Signers } from "../types";
import { shouldBehaveLikeHarvestFinanceAdapter } from "./HarvestFinanceAdapter.behavior";
import { default as HarvestExports } from "@optyfi/defi-legos/ethereum/harvest.finance/contracts";
import { ERC20, IUniswapV2Router02 } from "../../../typechain";
import { getOverrideOptions, setTokenBalanceInStorage } from "../../utils";

const { deployContract } = hre.waffle;

const HarvestFinancePools = {
  dai: {
    pool: HarvestExports.harvestV1Pools.dai.pool,
    stakingPool: HarvestExports.harvestV1Pools.dai.stakingVault,
    lpToken: HarvestExports.harvestV1Pools.dai.lpToken,
    tokens: HarvestExports.harvestV1Pools.dai.tokens,
    rewardTokens: ["0xa0246c9032bC3A600820415aE600c6388619A14D"],
  },
  usdt: {
    pool: HarvestExports.harvestV1Pools.usdt.pool,
    stakingPool: HarvestExports.harvestV1Pools.usdt.stakingVault,
    lpToken: HarvestExports.harvestV1Pools.usdt.lpToken,
    tokens: HarvestExports.harvestV1Pools.usdt.tokens,
    rewardTokens: ["0xa0246c9032bC3A600820415aE600c6388619A14D"],
  },
};

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    const DAI_ADDRESS: string = getAddress("0x6b175474e89094c44da98b954eedeac495271d0f");
    const USDT_ADDRESS: string = getAddress("0xdac17f958d2ee523a2206206994597c13d831ec7");
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    const dai: ERC20 = await hre.ethers.getContractAt("ERC20", DAI_ADDRESS);
    const usdt: ERC20 = await hre.ethers.getContractAt("ERC20", USDT_ADDRESS);
    this.signers.admin = signers[0];
    this.signers.owner = signers[1];
    this.signers.deployer = signers[2];
    this.signers.alice = signers[3];

    // get the UniswapV2Router contract instance
    this.uniswapV2Router02 = <IUniswapV2Router02>(
      await hre.ethers.getContractAt("IUniswapV2Router02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    );

    // deploy Harvest Finance Adapter
    const harvestFinanceAdapterArtifact: Artifact = await hre.artifacts.readArtifact("HarvestFinanceAdapter");
    this.harvestFinanceAdapter = <HarvestFinanceAdapter>(
      await deployContract(
        this.signers.deployer,
        harvestFinanceAdapterArtifact,
        ["0x99fa011e33a8c6196869dec7bc407e896ba67fe3"],
        getOverrideOptions(),
      )
    );

    // deploy TestDeFiAdapter Contract
    const testDeFiAdapterArtifact: Artifact = await hre.artifacts.readArtifact("TestDeFiAdapter");
    this.testDeFiAdapter = <TestDeFiAdapter>(
      await deployContract(this.signers.deployer, testDeFiAdapterArtifact, [], getOverrideOptions())
    );

    await setTokenBalanceInStorage(dai, this.testDeFiAdapter.address, "10000");
    await setTokenBalanceInStorage(usdt, this.testDeFiAdapter.address, "10000");

    // whitelist TestDeFiAdapter contract into HarvestFinance's Vaults
    // by impersonating the governance's address
    const tokenNames = Object.keys(HarvestFinancePools);
    for (const tokenName of tokenNames) {
      const { pool } = (HarvestFinancePools as LiquidityPool)[tokenName];
      const harvestVault = await hre.ethers.getContractAt("IHarvestDeposit", pool);
      const governance = await harvestVault.governance();
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [governance],
      });
      const harvestController = await hre.ethers.getContractAt(
        "IHarvestController",
        await harvestVault.controller(),
        await hre.ethers.getSigner(governance),
      );
      await this.signers.admin.sendTransaction({
        to: governance,
        value: hre.ethers.utils.parseEther("1000"),
        ...getOverrideOptions(),
      });
      await harvestController.addToWhitelist(this.testDeFiAdapter.address, getOverrideOptions());
      await harvestController.addCodeToWhitelist(this.testDeFiAdapter.address, getOverrideOptions());
    }
  });

  describe("HarvestFinanceAdapter", function () {
    Object.keys(HarvestFinancePools).map((token: string) => {
      shouldBehaveLikeHarvestFinanceAdapter(token, (HarvestFinancePools as LiquidityPool)[token]);
    });
  });
});
