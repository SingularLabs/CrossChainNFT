// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;

import "../libs/CustomONFT721Base.sol";

contract prod_BAYC is CustomONFT721Base {
    function initialize(address _collateral, address _lzEndpoint) public initializer {
        __CustomONFT721Base_init("SingularBAYC", "SBAYC", _collateral, 1, _lzEndpoint);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    }
}
