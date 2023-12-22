import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as types from '../typechain-types';
import getDeploymentAddresses from '../utils/readStatic';
import jsonChainIds from '../constants/chainIds.json';
import jsonEndpoints from '../constants/layerzeroEndpoints.json';
const lzChainIds = jsonChainIds as Record<string, number>;
const lzEndpoints = jsonEndpoints as Record<string, any>;
const lzName = (name: string) => {
  return name == 'arbitrum_goerli' ? 'arbitrum-goerli' : name;
};
const task = async (args: { onft: string; target: string }, hre: HardhatRuntimeEnvironment) => {
  console.log(`🟢setLayerZeroBridge,onft(${args.onft}),source(${hre.network.name}),target(${args.target})`);
  if (!hre.network || hre.network.name == 'hardhat') throw 'need network.';
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
  if (!targertOnftAddr) throw 'tagertOnftAddr is null';
  const trustedRemote = await onft.trustedRemoteLookup(lzChainIds[lzTarget]);
  if (trustedRemote == '0x') {
    const params = hre.ethers.utils.solidityPack(['address', 'address'], [targertOnftAddr, onft.address]);
    const tx = await onft.setTrustedRemote(lzChainIds[lzTarget], params);
    console.log(
      `🟢onft.setTrustedRemote pending...tx:${tx.hash},lzChainId(${lzChainIds[lzTarget]}),trustedRemote:{${params}}`,
    );
    await tx.wait();
  } else console.log(`✅trustedRemote:${trustedRemote}`);
  const BATCH_LIMIT = 300;
  const batchLimit = await onft.dstChainIdToBatchLimit(lzChainIds[lzTarget]);
  if (!batchLimit.eq(BATCH_LIMIT)) {
    const tx = await onft.setDstChainIdToBatchLimit(lzChainIds[lzTarget], BATCH_LIMIT);
    console.log(`🟢onft.setDstChainIdToBatchLimit pending...tx:${tx.hash},lzChainId(${lzChainIds[lzTarget]})`);
    await tx.wait();
  } else console.log(`✅batchLimit:${batchLimit}`);
  const minDstGas = await onft.minDstGasLookup(lzChainIds[lzTarget], 1);
  if (minDstGas.eq(0)) {
    const tx = await onft.setMinDstGas(lzChainIds[lzTarget], 1, 1);
    console.log(`🟢onft.setMinDstGas pending...tx:${tx.hash},lzChainId(${lzChainIds[lzTarget]})`);
    await tx.wait();
  } else console.log(`✅minDstGas:${minDstGas}`);
};
export default task;
