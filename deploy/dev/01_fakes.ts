import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chain = hre.hardhatArguments.network;

  const bayc = await deploy('BoredApeYachtClub', {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      proxyContract: 'OpenZeppelinTransparentProxy',
      owner: deployer,
      execute: { init: { methodName: 'initialize', args: [] } },
    },
  });

  console.log(`🟢[${chain}]bayc.address(${bayc.address})`);
  const brc20 = await deploy('MockBrc20', {
    from: deployer,
    args: ['Gold', 'GLD', ethers.utils.parseEther('1').mul(21_000_000), ethers.utils.parseEther('1').mul(1_000), 8],
    log: true,
  });
  console.log(`🟢[${chain}]brc20.address(${brc20.address})`);
};
func.tags = ['dev'];
export default func;
