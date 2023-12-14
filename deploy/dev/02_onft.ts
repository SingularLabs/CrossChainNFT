import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import * as types from '../../typechain-types';
import jsonChainIds from '../../constants/chainIds.json';
import jsonEndpoints from '../../constants/layerzeroEndpoints.json';
const lzChainIds = jsonChainIds as Record<string, number>;
const lzEndpoints = jsonEndpoints as Record<string, any>;
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chain = hre.hardhatArguments.network;
  const lzChainName = chain == 'arbitrum_goerli' ? 'arbitrum-goerli' : undefined;
  if (!chain! || !lzChainName) throw '!chain!||lzChainName';
  const lzChainId = lzChainIds[lzChainName];
  const lzEndopint = lzEndpoints[lzChainName];
  console.log(`🟢chain(${chain}),lzChainNme(${lzChainName}),lzChainId(${lzChainId}),lzEndopint(${lzEndopint})`);

  const onfts = [{ collateral: 'BoredApeYachtClub', onft: 'MockOBoredApeYachtClub' }];
  for (const cfg of onfts) {
    const collateral = (await ethers.getContractAt(
      cfg.collateral,
      (await deployments.get(cfg.collateral)).address,
    )) as types.ERC721;
    const onft = await deploy(cfg.onft, {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy',
        owner: deployer,
        execute: { init: { methodName: 'initialize', args: [collateral.address, lzEndopint] } },
      },
    });
    console.log(`✅[${chain}]onft(${cfg.onft}).address(${onft.address})`);
  }
};
func.tags = ['dev'];
export default func;
