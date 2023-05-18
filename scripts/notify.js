const hre = require('hardhat');

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = ethers.provider;

  const reentrance = await ethers.getContractAt(
    'Reentrance',
    process.env.REENTRANCE_ADDRESS
  );

  const reentrancyAttack = reentrance.filters.ReentrancyAttack();
  reentrance.on(reentrancyAttack, async function (attacker, event) {
    console.log(
      `ReentrancyAttack from ${attacker} at ${new Date(
        (await event.getBlock()).timestamp * 1000
      ).toISOString()}`
    );
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
