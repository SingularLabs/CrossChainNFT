import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import * as types from '../../typechain-types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chain = hre.hardhatArguments.network;

  const ordnfts = [{ nft: 'WFROG', executor: '0xfA54030BDf5310cB074CbBda3B28e577Cf9Af7a2' }];
  for (const cfg of ordnfts) {
    console.log(`deploying ${JSON.stringify(cfg)}`);
    const ordnft = await deploy(cfg.nft, {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy',
        owner: deployer,
        execute: {
          init: {
            methodName: 'initialize',
            args: [cfg.executor],
          },
        },
      },
    });
    console.log(`✅[${chain}]ordnft(${cfg.nft}).address(${ordnft.address})`);
    const ordnftInstance = (await ethers.getContractAt(cfg.nft, ordnft.address)) as types.OrdAssetWrapBase;
    if ((await ordnftInstance.executor()) != cfg.executor) {
      const tx = await ordnftInstance.setExecutor(ethers.utils.getAddress(cfg.executor));
      const resp = await tx.wait();
    }
  }
};
func.tags = ['prod_ordnfts'];
export default func;
