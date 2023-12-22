// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BoredApeYachtClub is OwnableUpgradeable, ERC721Upgradeable {
    function initialize() public initializer {
        __Ownable_init();
        __ERC721_init("BoredApeYachtClub", "BAYC");
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    }

    function name() public pure override returns (string memory) {
        return "OverdueBAYC";
    }

    function mint(address to, uint tokenId) public payable {
        require(msg.value == 0.1 ether, "Must send 0.1 ETH");
        require(_exists(tokenId) == false, "token minted");
        _safeMint(to, tokenId);
    }

    receive() external payable {
        mint(_msgSender(), 1);
    }
}
