import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import * as types from '../../typechain-types';
import jsonProtocol from '../../constants/protocol.json';
const protocol = jsonProtocol as Record<string, any>;
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chain = hre.hardhatArguments.network;
  if (!chain) throw `chain is null`;
  console.log(
    `🟢00_base[${chain}]deployer(${deployer}),balance(${ethers.utils.formatEther(
      await ethers.provider.getBalance(deployer),
    )});`,
  );

  const admin = await deploy('CustomProxyAdmin', {
    from: deployer,
    args: [deployer],
  });
  console.log(`✅[${chain}]admin.address(${admin.address})`);

  const timelocker = await deploy('CustomTimelocker', {
    from: deployer,
    args: [
      protocol[chain as string].timelock.minDelay,
      protocol[chain as string].timelock.proposers,
      protocol[chain as string].timelock.executors,
      protocol[chain as string].timelock.admin,
    ],
  });
  console.log(`✅[${chain}]timelocker.address(${timelocker.address})`);
};
func.tags = ['dev'];
export default func;
