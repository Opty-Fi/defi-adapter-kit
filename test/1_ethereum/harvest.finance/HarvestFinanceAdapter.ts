import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { default as HarvestExports } from "@optyfi/defi-legos/ethereum/harvest.finance/contracts";
import { HarvestFinanceAdapter } from "../../../typechain/HarvestFinanceAdapter";
import { TestDeFiAdapter } from "../../../typechain/TestDeFiAdapter";
import { LiquidityPool, Signers } from "../types";
import { shouldBehaveLikeHarvestFinanceAdapter } from "./HarvestFinanceAdapter.behavior";
import { IUniswapV2Router02 } from "../../../typechain";
import { getOverrideOptions } from "../../utils";

const { deployContract } = hre.waffle;

const HarvestFinancePools = HarvestExports.harvestV1Pools;

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.owner = signers[1];
    this.signers.deployer = signers[2];
    this.signers.alice = signers[3];
    this.signers.operator = await hre.ethers.getSigner("0x6bd60f089B6E8BA75c409a54CDea34AA511277f6");

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

    // impersonate operator
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [this.signers.operator.address],
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.operator.address,
      value: hre.ethers.utils.parseEther("10"),
      ...getOverrideOptions(),
    });

    // whitelist TestDeFiAdapter contract into HarvestFinance's Vaults
    // by impersonating the governance's address
    const harvestFinanceGovernance = "0xf00dD244228F51547f0563e60bCa65a30FBF5f7f";
    const harvestFinanceController = "0x3cC47874dC50D98425ec79e647d83495637C55e3";
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [harvestFinanceGovernance],
    });
    const harvestController = await hre.ethers.getContractAt(
      "IHarvestController",
      harvestFinanceController,
      await hre.ethers.getSigner(harvestFinanceGovernance),
    );
    await this.signers.admin.sendTransaction({
      to: harvestFinanceGovernance,
      value: hre.ethers.utils.parseEther("1000"),
      ...getOverrideOptions(),
    });
    await harvestController.addToWhitelist(this.testDeFiAdapter.address, getOverrideOptions());
    await harvestController.addCodeToWhitelist(this.testDeFiAdapter.address, getOverrideOptions());
  });

  describe("HarvestFinanceAdapter", function () {
    Object.keys(HarvestFinancePools).map((token: string) => {
      shouldBehaveLikeHarvestFinanceAdapter(token, (HarvestFinancePools as LiquidityPool)[token]);
    });
  });
});
