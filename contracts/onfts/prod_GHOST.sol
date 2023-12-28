// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;

import "../libs/CustomONFT721Base.sol";

contract prod_GHOST is CustomONFT721Base {
    function initialize(address _collateral, address _lzEndpoint) public initializer {
        __CustomONFT721Base_init("SingularGHOST", "SGHOST", _collateral, 1, _lzEndpoint);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/Qmd6NRsBBfHyqDmdZ6TWSowQHCRr1LEEwTHMkDwdLk5tjo/";
    }
}
