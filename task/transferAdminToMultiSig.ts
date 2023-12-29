import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as types from '../typechain-types';
import jsonProtocol from '../constants/protocol.json';
const task = async (args: { onft: string }, hre: HardhatRuntimeEnvironment) => {
  const protocols = jsonProtocol as Record<string, { admin: string }>;
  const { deployer } = await hre.getNamedAccounts();
  if (!(hre.network.name == 'arbitrum_prod' || hre.network.name == 'mainnet_prod'))
    throw 'network not arbitrum_prod or mainnet_prod';
  const adminAddr = hre.ethers.utils.getAddress(protocols[hre.network.name].admin);
  console.log(`${hre.network.name} admin target is ${protocols[hre.network.name].admin}`);
  const onft = await hre.ethers.getContractAt('ONFT721Base', (await hre.deployments.get(args.onft)).address);
  if (!adminAddr) throw 'not admin address';
  if ((await onft.owner()) != adminAddr) {
    console.log(`🟢 onft owner is ${await onft.owner()}`);

    const tx = await onft.transferOwnership(adminAddr);
    console.log(`🟢pending onft${args.onft} transferOwnership ${onft.address} owner to ${adminAddr}`);
    await tx.wait();

    console.log(`✅ onft transferOwnership`);
  } else console.log(`✅ onft owner is ${await onft.owner()}`);
};
export default task;
