const {
  time,
  loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');

describe('Reentrance', function () {
  async function deployContractsFixture() {
    const accounts = await ethers.getSigners();

    const Reentrance = await ethers.getContractFactory('Reentrance');
    const reentrance = await Reentrance.deploy();
    await reentrance.deployed();

    const Attack = await ethers.getContractFactory('Attack');
    const attack = await Attack.deploy(reentrance.address);
    await attack.deployed();

    return { accounts, reentrance, attack };
  }

  it('should be exploited by Reentrancy Attack', async function () {
    const { accounts, reentrance, attack } = await loadFixture(
      deployContractsFixture
    );
    const provider = ethers.provider;
    const [owner] = accounts;

    await (
      await reentrance.donate(owner.address, {
        value: ethers.utils.parseEther('10'),
      })
    ).wait();

    await (
      await reentrance.donate(attack.address, {
        value: ethers.utils.parseEther('1'),
      })
    ).wait();

    await (
      await owner.sendTransaction({
        to: attack.address,
      })
    ).wait();

    const balanceBefore = await provider.getBalance(owner.address);
    const txReceipt = await (await attack.withdraw()).wait();
    const balanceAfter = await provider.getBalance(owner.address);

    expect(await provider.getBalance(reentrance.address)).eq(0);
    expect(await provider.getBalance(attack.address)).eq(0);
    expect(
      balanceBefore.add(
        ethers.utils
          .parseEther('11')
          .sub(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice))
      )
    ).eq(balanceAfter);
  });
});
