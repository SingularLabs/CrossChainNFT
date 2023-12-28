// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;

import "../libs/CustomONFT721Base.sol";

contract MockOBoredApeYachtClub is CustomONFT721Base {
    function initialize(address _collateral, address _lzEndpoint) public initializer {
        __CustomONFT721Base_init("MockOBoredApeYachtClub", "MockOBAYC", _collateral, 1, _lzEndpoint);
    }
}
