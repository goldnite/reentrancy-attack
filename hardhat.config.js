require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  defaultNetwork: 'localhost',
  networks: {
    sepolia: {
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    hardhat: {
      mining: {
        auto: false,
        interval: 5000,
      },
    },
    localhost: {
      url: 'http://localhost:8545',
    },
    sandbox: {
      url: 'http://localhost:8546',
    },
  },
  etherscan: {
    apiKey: {
      sepolia: 'YAXXGTZZQYQEVQBBE9STAD9TDVA3PPQD93',
    },
  },
};
