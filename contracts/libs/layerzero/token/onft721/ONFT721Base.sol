// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IONFT721.sol";
import "./ONFT721Core.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

abstract contract ONFT721Base is ONFT721Core, ERC721Upgradeable, IONFT721 {
    /*
    constructor(
        string memory _name,
        string memory _symbol,
        uint _minGasToTransfer,
        address _lzEndpoint
    ) ERC721Upgradeable(_name, _symbol) ONFT721Core(_minGasToTransfer, _lzEndpoint) {}
    */
    function __ONFT721Base_init(
        string memory _name,
        string memory _symbol,
        uint _minGasToTransfer,
        address _lzEndpoint
    ) internal initializer {
        __ERC721_init(_name, _symbol);
        __ONFT721Core_init(_minGasToTransfer, _lzEndpoint);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ONFT721Core, ERC721Upgradeable, IERC165Upgradeable) returns (bool) {
        return interfaceId == type(IONFT721).interfaceId || super.supportsInterface(interfaceId);
    }

    function _debitFrom(address _from, uint16, bytes memory, uint _tokenId) internal virtual override {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "ONFT721: send caller is not owner nor approved");
        require(ERC721Upgradeable.ownerOf(_tokenId) == _from, "ONFT721: send from incorrect owner");
        _transfer(_from, address(this), _tokenId);
    }

    function _creditTo(uint16, address _toAddress, uint _tokenId) internal virtual override {
        require(!_exists(_tokenId) || (_exists(_tokenId) && ERC721Upgradeable.ownerOf(_tokenId) == address(this)));
        if (!_exists(_tokenId)) {
            _safeMint(_toAddress, _tokenId);
        } else {
            _transfer(address(this), _toAddress, _tokenId);
        }
    }
}
