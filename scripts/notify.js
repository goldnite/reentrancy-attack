const hre = require('hardhat');
const Nylas = require('nylas');
const { default: Draft } = require('nylas/lib/models/draft');

Nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET,
});

const nylas = Nylas.with(process.env.NYLAS_ACCESS_TOKEN);

const sendMail = async function (attacker, timestamp) {
  const draft = new Draft(nylas, {
    subject: 'Attack Detected',
    body: `There was an reentrancy attack at ${timestamp} from address ${attacker} to your Reentrance contract. Pause the contract shortly.`,
    to: [{ name: 'Admin', email: 'forzecakko@gufum.com' }],
  });
  const message = await draft.send();
  console.log(`Mail id ${message.id} was sent.`);
};

async function main() {
  const reentrance = await ethers.getContractAt(
    'Reentrance',
    process.env.REENTRANCE_ADDRESS
  );

  const reentrancyAttack = reentrance.filters.ReentrancyAttack();
  reentrance.on(reentrancyAttack, async function (attacker, event) {
    const timestamp = new Date(
      (await event.getBlock()).timestamp * 1000
    ).toISOString();
    console.log(`ReentrancyAttack from ${attacker} at ${timestamp}`);
    console.log('Sending an email ...');
    // await sendMail(attacker, timestamp);
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
