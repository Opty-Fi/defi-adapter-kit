import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { HarvestFinanceAdapter, HarvestFinanceAdapter__factory } from "../../typechain";

const registryContractAddress = "0x99fa011E33A8c6196869DeC7Bc407E896BA67fE3";

task("deploy-harvest.finance-adapter").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const harvestFinanceAdapterFactory: HarvestFinanceAdapter__factory = await ethers.getContractFactory(
    "HarvestFinanceAdapter",
  );
  const harvestFinanceAdapter: HarvestFinanceAdapter = <HarvestFinanceAdapter>(
    await harvestFinanceAdapterFactory.deploy(registryContractAddress)
  );
  await harvestFinanceAdapter.deployed();
  console.log("HarvestFinanceAdapter deployed to: ", harvestFinanceAdapter.address);
});
