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
  const lzChainName = chain == 'arbitrum_prod' ? 'arbitrum' : chain == 'mainnet_prod' ? 'ethereum' : chain;
  if (!chain! || !lzChainName) throw '!chain!||lzChainName';
  const lzChainId = lzChainIds[lzChainName];
  const lzEndopint = lzEndpoints[lzChainName];
  console.log(`🟢chain(${chain}),lzChainNme(${lzChainName}),lzChainId(${lzChainId}),lzEndopint(${lzEndopint})`);

  const onfts = [{ nft: 'GoldenChipmunk', executor: '0xd441D3185A95b8476c36C32E63605cc3b43Dc3Ef' }];
  for (const cfg of onfts) {
    console.log(`deploying ${JSON.stringify(cfg)}`);
    const onft = await deploy(cfg.nft, {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy',
        owner: deployer,
        execute: {
          init: {
            methodName: 'initialize',
            args: [1 /*mainnet*/, lzEndopint, cfg.executor],
          },
        },
      },
    });
    const instance = await ethers.getContractAt(cfg.nft, onft.address);
    console.log(await instance.lzEndpoint(), lzEndopint);
    console.log(`✅[${chain}]onft(${cfg.nft}).address(${onft.address})`);

    if ((await instance.executor()) != cfg.executor) {
      const tx = await instance.setExecutor(ethers.utils.getAddress(cfg.executor));
      const resp = await tx.wait();
    }
  }
};
func.tags = ['prod_officialNfts'];
export default func;
