pragma solidity ^0.8.0;

import "../libs/OrdAssetWrapBase.sol";

contract WFROG is OrdAssetWrapBase {
    function initialize(address _executor) public initializer {
        __OrdAssetWrapBase_init("WrapBitcoinFrog", "WFROG", _executor);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://bafybeifybw5ubyep4x4cdycqnbwubuhkuapimor4m4n726k4goajcbxfwm/";
    }
}
