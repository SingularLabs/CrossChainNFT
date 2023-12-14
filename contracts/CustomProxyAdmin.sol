// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol";

contract CustomProxyAdmin is ProxyAdmin {
    constructor(address initialOwner) ProxyAdmin(initialOwner) {}
}
