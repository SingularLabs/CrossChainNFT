import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as types from '../typechain-types';
import getDeploymentAddresses from '../utils/readStatic';
import jsonChainIds from '../constants/chainIds.json';
import jsonEndpoints from '../constants/layerzeroEndpoints.json';
const lzChainIds = jsonChainIds as Record<string, number>;
const lzEndpoints = jsonEndpoints as Record<string, any>;
const lzName = (name: string) => {
  return name == 'arbitrum_prod'
    ? 'arbitrum'
    : name == 'mainnet_prod'
      ? 'ethereum'
      : name == 'arbitrum_goerli'
        ? 'arbitrum-goerli'
        : name;
};
const task = async (args: { onft: string; target: string }, hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  /*
  const asset = await hre.ethers.getContractAt('OrdAssetWrapBase', '0x6E932393aF2498CfD784FB99f8992A7167B8392b');
  console.log(await asset.ownerOf(1));

  return;*/
  const lzSource = lzName(hre.network.name);
  const lzSourceEndpoint = await hre.ethers.getContractAt('ILayerZeroEndpoint', lzEndpoints[lzSource]);
  const onft = await hre.ethers.getContractAt('ONFT721Base', (await hre.deployments.get(args.onft)).address);
  const lzTarget = lzName(args.target);
  const targertOnftAddr = getDeploymentAddresses(args.target)[args.onft];
  console.log(
    `🟢current chainId(${await lzSourceEndpoint.getChainId()}),source lzChainId(${
      lzChainIds[lzSource]
    }),target lzChainId(${lzChainIds[lzTarget]}),onft(${onft.address})`,
  );
  let adapterParams = hre.ethers.utils.solidityPack(['uint16', 'uint256'], [1, 350000 + 50000 * 1]);
  const fee = await onft.estimateSendFee(lzChainIds[lzTarget], deployer, 0, false, adapterParams);
  console.log(fee, hre.ethers.utils.formatUnits(fee.nativeFee, 'ether'));

  adapterParams = hre.ethers.utils.solidityPack(['uint16', 'uint256'], [1, 350000 + 50000 * 2]);
  const batchFee = await onft.estimateSendBatchFee(lzChainIds[lzTarget], deployer, [0, 1], false, adapterParams);
  console.log(batchFee, hre.ethers.utils.formatUnits(batchFee.nativeFee, 'ether'));
};
export default task;
