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
  const { deployer } = await hre.getNamedAccounts();
  const defaultAdapterParams = hre.ethers.utils.solidityPack(['uint16', 'uint256'], [1, 5000000]);
  const onft = (await hre.ethers.getContractAt(
    args.onft,
    (await hre.deployments.get(args.onft)).address,
  )) as types.CustomONFT721Base;
  const nftAddr = await onft.collateral();
  const nft = await hre.ethers.getContractAt('BoredApeYachtClub', nftAddr);
  console.log(`nft(${nft.address}),name(${await nft.name()})`);
  const lzTarget = lzName(args.target);
  const targertOnftAddr = getDeploymentAddresses(args.target)[args.onft];

  const tokenId = 5;
  try {
    await nft.tokenURI(tokenId);
  } catch (err) {
    if ((err as Error).message.includes('ERC721: invalid token ID')) {
      await (await nft.mint(deployer, tokenId, { value: hre.ethers.utils.parseEther('0.1') })).wait();
    } else throw err;
  }
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
  if ((await nft.ownerOf(tokenId)) == deployer) {
    const nativeFee = (await onft.estimateSendFee(lzChainIds[lzTarget], deployer, tokenId, false, defaultAdapterParams))
      .nativeFee;
    console.log(`🟢nativeFee(${hre.ethers.utils.formatUnits(nativeFee, 'ether')})`);
    await (await nft.approve(onft.address, tokenId)).wait();
    const tx = await onft.crossTo(tokenId, lzChainIds[lzTarget], defaultAdapterParams, { value: nativeFee });
    console.log(`🟢onft.crossTo pending...tx:${tx.hash}`);
  } else {
    const provider = new hre.ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc');
    const targetNft = new hre.ethers.Contract(
      targertOnftAddr,
      (await hre.deployments.get(args.onft)).abi,
      provider,
    ) as types.CustomONFT721Base;
    console.log(await targetNft.ownerOf(tokenId));
  }
};
export default task;
