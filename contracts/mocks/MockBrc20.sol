// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBrc20 is ERC20 {
    event Mint(address indexed to, uint amount, uint total, uint blockNumber);
    uint public maxSupply;
    uint public limitPer;
    uint8 private _decimal;

    constructor(string memory name, string memory symbol, uint max, uint lim, uint8 dec) ERC20(name, symbol) {
        limitPer = lim;
        maxSupply = max;
        _decimal = dec == 0 ? 18 : dec;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimal;
    }

    function mint(address to, uint amount) public returns (uint) {
        require(amount <= limitPer || limitPer == 0, "mint limitPer");
        uint supplied = totalSupply();
        require(maxSupply > supplied, "max supplied");
        if (supplied + amount > maxSupply) amount = maxSupply - supplied;
        _mint(to, amount);
        emit Mint(to, amount, balanceOf(to), block.number);
        return amount;
    }
}
