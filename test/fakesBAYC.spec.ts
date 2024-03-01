import hre from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, upgrades, tracer } from 'hardhat';
const enabledRracer = true;
describe('fakesBAYC.spec', () => {
  async function deployFixture() {
    const BoredApeYachtClub = await ethers.getContractFactory('BoredApeYachtClub');
    const bayc = await upgrades.deployProxy(BoredApeYachtClub, [], {});
    await bayc.deployed();
    return { bayc };
  }
  it('mint an transfer', async () => {
    const [deployer, user] = await ethers.getSigners();
    const { bayc } = await loadFixture(deployFixture);
    const instance = bayc.connect(user);
    await expect(bayc.mint(user.address, 0, { value: ethers.utils.parseEther('0.09') })).to.be.revertedWith(
      'Must send 0.1 ETH',
    );
    await bayc.mint(user.address, 0, { value: ethers.utils.parseEther('0.1') });
    expect(await bayc.ownerOf(0)).to.equal(user.address);
    expect(await bayc.tokenURI(0)).to.equal('ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0');
    await instance.transferFrom(user.address, deployer.address, 0);
    expect(await bayc.ownerOf(0)).to.equal(deployer.address);
    await expect(bayc.mint(user.address, 0, { value: ethers.utils.parseEther('0.1') })).to.be.revertedWith(
      'token minted',
    );
    await deployer.sendTransaction({
      to: bayc.address,
      gasLimit: 1_000_000,
      value: ethers.utils.parseUnits('0.1', 'ether'),
      data: ethers.utils.toUtf8Bytes('{text}'),
    });
    console.log(ethers.utils.toUtf8String(await bayc.temp()));
  });
});
