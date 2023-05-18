// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Reentrance is Ownable, Pausable {
    using SafeMath for uint256;
    mapping(address => uint) public balances;

    bool _isEntered;

    event ReentrancyAttack(address attacker);

    function donate(address _to) public payable {
        balances[_to] = balances[_to].add(msg.value);
    }

    function balanceOf(address _who) public view returns (uint balance) {
        return balances[_who];
    }

    function withdraw(uint _amount) public whenNotPaused {
        if (_isEntered == true) {
            emit ReentrancyAttack(msg.sender);
        } else _isEntered = true;
        if (balances[msg.sender] >= _amount) {
            (bool success, ) = payable(msg.sender).call{value: _amount}("");
            if (success) {
                _amount;
            }
            unchecked {
                balances[msg.sender] -= _amount;
            }
        }
        _isEntered = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
