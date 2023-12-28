import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import * as types from '../../typechain-types';
import jsonChainIds from '../../constants/chainIds.json';
import jsonEndpoints from '../../constants/layerzeroEndpoints.json';
import jsonOnfts from '../../constants/onfts.json';

const lzChainIds = jsonChainIds as Record<string, number>;
const lzEndpoints = jsonEndpoints as Record<string, any>;
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chain = hre.hardhatArguments.network;
  const lzChainName = chain == 'arbitrum_prod' ? 'arbitrum' : chain == 'mainnet_prod' ? 'ethereum' : chain;
  if (!chain! || !lzChainName) throw '!chain!||lzChainName';
  const lzChainId = lzChainIds[lzChainName];
  const lzEndopint = lzEndpoints[lzChainName];
  console.log(`🟢chain(${chain}),lzChainNme(${lzChainName}),lzChainId(${lzChainId}),lzEndopint(${lzEndopint})`);

  const onfts = jsonOnfts as Record<string, { collateral: string; assetChain: string; onft: string }>;
  for (const key of Object.keys(onfts)) {
    const cfg = onfts[key];
    console.log(`deploying ${JSON.stringify(cfg)}`);
    const collateral = new ethers.Contract(cfg.collateral, types.ERC721__factory.abi) as types.ERC721;
    const assetAddr = cfg.assetChain == chain ? collateral.address : ethers.constants.AddressZero;
    console.log(`🟢asset address: ${assetAddr}`);

    const onft = await deploy(cfg.onft, {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy',
        owner: deployer,
        execute: {
          init: {
            methodName: 'initialize',
            args: [assetAddr, lzEndopint],
          },
        },
      },
    });
    console.log(`✅[${chain}]onft(${cfg.onft}).address(${onft.address})`);
  }
};
func.tags = ['prod_ghost'];
export default func;
