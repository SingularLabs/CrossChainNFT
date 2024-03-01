import hre from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import * as types from '../typechain-types';
import { ethers, upgrades, tracer } from 'hardhat';
const chainId_A = 1;
const chainId_B = 2;
const enabledRracer = true;
describe('gcm.spec', () => {
  async function deployFixture() {
    const LZEndpointMock = await ethers.getContractFactory('LZEndpointMock');
    const lzEndpointMockA = await LZEndpointMock.deploy(chainId_A);
    const lzEndpointMockB = await LZEndpointMock.deploy(chainId_B);
    const officialNft = await ethers.getContractFactory('GoldenChipmunk');
    const nft = (await (
      await upgrades.deployProxy(
        officialNft,
        [(await ethers.provider.getNetwork()).chainId, lzEndpointMockA.address, ethers.constants.AddressZero],
        {},
      )
    ).deployed()) as types.GoldenChipmunk;
    return { nft };
  }
  it('mint', async () => {
    const [deployer, user] = await ethers.getSigners();
    const { nft } = await loadFixture(deployFixture);
    const instance = nft.connect(user);
    const toAddr = user.address;
    const tokenId = 2000;
    const executor = deployer;
    expect(executor.address).eq(await instance.executor());
    const price = ethers.utils.parseEther('0.064');
    const msg = ethers.utils.solidityPack(
      ['address', 'address', 'uint256', 'uint256'],
      [user.address, toAddr, tokenId, price],
    );
    const hash = ethers.utils.keccak256(msg);
    expect(hash).eq(await instance.getMintHash(user.address, toAddr, tokenId, price));
    const signature = await executor.signMessage(ethers.utils.arrayify(hash));
    console.log(signature);
    await instance.mint(toAddr, tokenId, price, signature, { value: price });

    expect(await instance.ownerOf(tokenId)).to.equal(toAddr);
  });
});
