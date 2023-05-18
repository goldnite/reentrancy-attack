const hre = require('hardhat');
const helpers = require('@nomicfoundation/hardhat-network-helpers');
const { config } = require('hardhat');
const { ethers, network } = hre;

async function main() {
  const [owner] = await ethers.getSigners();
  const { provider: sandbox } = network;
  const localhostProviderUrl = config.networks.localhost.url;
  const provider = new ethers.providers.WebSocketProvider(
    'ws://localhost:8545'
  );
  const admin = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: localhostProviderUrl,
        },
      },
    ],
  });

  // fork default hardhat node to sandbox
  // provider.on('block', async (blockNumber) => {
  //   try {
  //     console.log(`resetting sandbox with block #${blockNumber}`);
  //     await helpers.reset(localhostProviderUrl, blockNumber);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });

  provider.on('pending', async (pendingTxHash) => {
    try {
      const pendingTx = await provider.send('eth_getTransactionByHash', [
        pendingTxHash,
      ]);
      pendingTx.data = pendingTx.input;
      const oldGasPrice = pendingTx.gasPrice;
      delete pendingTx.input;
      delete pendingTx.gasPrice;
      delete pendingTx.maxFeePerGas;
      delete pendingTx.maxPriorityFeePerGas;
      await network.provider.send('hardhat_setNonce', [
        pendingTx.from,
        pendingTx.nonce,
      ]);
      const txHash = await sandbox.send('eth_sendTransaction', [pendingTx]);
      let txReceipt = null;
      do {
        txReceipt = await sandbox.send('eth_getTransactionReceipt', [txHash]);
      } while (txReceipt === null);
      const trace = await sandbox.send('debug_traceTransaction', [txHash], {
        disableMemory: true,
        disableStack: true,
        disableStorage: true,
      });
      const withdrawCount = trace.structLogs.filter((log) => {
        if (log.op == 'CALL') {
          return (
            log.stack[0] ==
              process.env.REENTRANCE_ADDRESS.slice(2)
                .toLowerCase()
                .padStart(64, '0') &&
            log.stack[1] ==
              process.env.WITHDRAW_SELECTOR.slice(2).padStart(64, '0')
          );
        }
      }).length;
      if (withdrawCount > 1) {
        console.log('Attack detected, pausing Reentrance Contract...');
        const signedTx = await admin.signTransaction({
          to: process.env.REENTRANCE_ADDRESS,
          data: process.env.PAUSE_SELECTOR,
          gasPrice: ethers.BigNumber.from(oldGasPrice).mul(2),
          gasLimit: '0xC350',
          nonce: await provider.getTransactionCount(admin.address),
        });
        await (await provider.sendTransaction(signedTx)).wait();
        console.log('Pause success.');
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
