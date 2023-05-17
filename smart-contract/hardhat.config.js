require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  networks: {
    sepolia: {
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
  },
  etherscan: {
    apiKey: {
      sepolia: 'YAXXGTZZQYQEVQBBE9STAD9TDVA3PPQD93',
    },
  },
};
