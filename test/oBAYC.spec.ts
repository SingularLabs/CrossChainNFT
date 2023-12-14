import hre from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, upgrades, tracer } from 'hardhat';
import * as types from '../typechain-types';
const enabledRracer = true;
const chainId_A = 1;
const chainId_B = 2;
const batchSizeLimit = 300;
const defaultAdapterParams = ethers.utils.solidityPack(['uint16', 'uint256'], [1, 5000000]);
describe('oBAYC.spec.spec', () => {
  async function deployFixture() {
    const LZEndpointMock = await ethers.getContractFactory('LZEndpointMock');
    const lzEndpointMockA = await LZEndpointMock.deploy(chainId_A);
    const lzEndpointMockB = await LZEndpointMock.deploy(chainId_B);

    const BoredApeYachtClub = await ethers.getContractFactory('BoredApeYachtClub');
    const bayc = (await upgrades.deployProxy(BoredApeYachtClub, [], {})) as types.BoredApeYachtClub;
    await bayc.deployed();

    const MockOBoredApeYachtClub = await ethers.getContractFactory('MockOBoredApeYachtClub');
    const obaycSource = (await upgrades.deployProxy(
      MockOBoredApeYachtClub,
      [bayc.address, lzEndpointMockA.address],
      {},
    )) as types.CustomONFT721Base;
    await obaycSource.deployed();

    const obaycTarget = (await upgrades.deployProxy(
      MockOBoredApeYachtClub,
      [ethers.constants.AddressZero, lzEndpointMockB.address],
      {},
    )) as types.CustomONFT721Base;
    await obaycTarget.deployed();

    await lzEndpointMockA.setDestLzEndpoint(obaycTarget.address, lzEndpointMockB.address);
    await lzEndpointMockB.setDestLzEndpoint(obaycSource.address, lzEndpointMockA.address);

    await obaycSource.setTrustedRemote(
      chainId_B,
      ethers.utils.solidityPack(['address', 'address'], [obaycTarget.address, obaycSource.address]),
    );
    await obaycTarget.setTrustedRemote(
      chainId_A,
      ethers.utils.solidityPack(['address', 'address'], [obaycSource.address, obaycTarget.address]),
    );

    // set batch size limit
    await obaycSource.setDstChainIdToBatchLimit(chainId_B, batchSizeLimit);
    await obaycTarget.setDstChainIdToBatchLimit(chainId_A, batchSizeLimit);

    // set min dst gas for swap
    await obaycSource.setMinDstGas(chainId_B, 1, 1);
    await obaycTarget.setMinDstGas(chainId_A, 1, 1);

    return { lzEndpointMockA, lzEndpointMockB, bayc, obaycSource, obaycTarget };
  }
  it('crossTo() - your own token', async () => {
    const [deployer, user] = await ethers.getSigners();
    const { bayc, obaycSource, obaycTarget } = await loadFixture(deployFixture);
    const tokenId = 0;
    await bayc.connect(user).mint(user.address, tokenId, { value: ethers.utils.parseEther('0.1') });
    expect(await bayc.ownerOf(0)).to.equal(user.address);

    //1 cross to B
    let nativeFeeA1 = (await obaycSource.estimateSendFee(chainId_B, user.address, tokenId, false, defaultAdapterParams))
      .nativeFee;
    await bayc.connect(user).approve(obaycSource.address, tokenId);
    await obaycSource.connect(user).crossTo(tokenId, chainId_B, defaultAdapterParams, { value: nativeFeeA1 });
    expect(await bayc.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycSource.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycTarget.ownerOf(tokenId)).to.equal(user.address);

    //1 cross to A
    let nativeFeeB1 = (await obaycTarget.estimateSendFee(chainId_A, user.address, tokenId, false, defaultAdapterParams))
      .nativeFee;
    await obaycTarget.connect(user).approve(obaycTarget.address, tokenId);
    await obaycTarget.connect(user).crossTo(tokenId, chainId_A, defaultAdapterParams, { value: nativeFeeB1 });
    expect(await bayc.ownerOf(tokenId)).to.equal(user.address);
    expect(await obaycSource.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycTarget.ownerOf(tokenId)).to.equal(obaycTarget.address);

    //2 cross to B
    let nativeFeeA2 = (await obaycSource.estimateSendFee(chainId_B, user.address, tokenId, false, defaultAdapterParams))
      .nativeFee;
    await bayc.connect(user).approve(obaycSource.address, tokenId);
    await obaycSource.connect(user).crossTo(tokenId, chainId_B, defaultAdapterParams, { value: nativeFeeA2 });
    expect(await bayc.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycSource.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycTarget.ownerOf(tokenId)).to.equal(user.address);

    //2 cross to A
    let nativeFeeB2 = (await obaycTarget.estimateSendFee(chainId_A, user.address, tokenId, false, defaultAdapterParams))
      .nativeFee;
    await obaycTarget.connect(user).approve(obaycTarget.address, tokenId);
    await obaycTarget.connect(user).crossTo(tokenId, chainId_A, defaultAdapterParams, { value: nativeFeeB2 });
    expect(await bayc.ownerOf(tokenId)).to.equal(user.address);
    expect(await obaycSource.ownerOf(tokenId)).to.equal(obaycSource.address);
    expect(await obaycTarget.ownerOf(tokenId)).to.equal(obaycTarget.address);
  });
  it('batchCrossTo() - your own token', async () => {
    const [deployer, user] = await ethers.getSigners();
    const { bayc, obaycSource, obaycTarget } = await loadFixture(deployFixture);
    const ids = [...Array(150).keys()];
    for (const tokenId of ids) {
      await bayc.connect(user).mint(user.address, tokenId, { value: ethers.utils.parseEther('0.1') });
    }
    await bayc.connect(user).setApprovalForAll(obaycSource.address, true);

    let nativeFeeA1 = (
      await obaycSource.estimateSendBatchFee(chainId_B, user.address, ids, false, defaultAdapterParams)
    ).nativeFee;
    console.log('nativeFeeA1', ethers.utils.formatUnits(nativeFeeA1, 'ether'));
    const rept = await (
      await obaycSource.connect(user).batchCrossTo(ids, chainId_B, defaultAdapterParams, { value: nativeFeeA1 })
    ).wait();
    for (const tokenId of ids) {
      expect(await bayc.ownerOf(tokenId)).to.equal(obaycSource.address);
      expect(await obaycSource.ownerOf(tokenId)).to.equal(obaycSource.address);
      expect(await obaycTarget.ownerOf(tokenId)).to.equal(user.address);
    }
  });
});
