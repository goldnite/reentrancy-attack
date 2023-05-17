const { Network, Alchemy } = require('alchemy-sdk');
require('dotenv').config();

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

// Listen to all new pending transactions
alchemy.ws.on(
  {
    method: 'alchemy_pendingTransactions',
    // toAddress: process.env.REENTRANCE_ADDRESS,
  },
  (res) => console.log(res)
);
