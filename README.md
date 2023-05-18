# Reentrancy attack example

1) Write a smart contract in the solidity vulnerable to a Reentrancy or flash loan or any attack. The contract should also have Ownable and Pausable functionalities(check Openzeppelin contracts for the same)
2) Using Nodejs / python / Rust / Go, write a simple notification microservice that gives a notification on calling the function that is vulnerable to this Reentrancy or flash loan or any attack. You can emit an event during this function call, read this event and then send a mail to the owner of the contract when the transaction to call this function is triggered.
3) Monitor the mempool, and when the transaction is in the Mempool but is yet to be executed (or added in the next block), flag this transaction as a suspicious transaction. (to monitor the internal transactions of some mempool transaction, run that transaction in a simulated/forked EVM environment and then validate with our vulnerable contract
)
4) On flagging this as a suspicious transaction, write a second microservice that triggers a transaction 
that pauses the contract before this suspicious transaction occurs. This can be done by setting a gas value for this transaction that is higher gas than the previous transaction to front-run this transaction.

Try running some of the following tasks:

```shell
npm run node    # run a hardhat node
npm run deploy  # deploy Reentrance and Attack smart contract to hardhat node
npm run attack  # perform a reentrancy attack using Attack smart contract
npm run notify  # notify when reentrancy attack occurs and send an email
npm run sandbox # run a sandbox node to run pending transactions
npm run monitor # monitor suspicious transactions among pending transactions
```
