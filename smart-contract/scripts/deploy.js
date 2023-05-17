const hre = require('hardhat');

async function main() {
  const Reentrance = await ethers.getContractFactory('Reentrance');
  const reentrance = await Reentrance.deploy();
  await reentrance.deployed();

  console.log(`Reentrance deployed to ${reentrance.address}`);

  const Attack = await ethers.getContractFactory('Attack');
  const attack = await Attack.deploy(reentrance.address);
  await attack.deployed();

  console.log(`Attack deployed to ${attack.address}`);

  await hre.run('verify:verify', {
    address: reentrance.address,
  });
  await hre.run('verify:verify', {
    address: attack.address,
    constructorArguments: [reentrance.address],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
