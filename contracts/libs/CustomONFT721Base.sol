// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./layerzero/token/onft721/ONFT721Base.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract CustomONFT721Base is PausableUpgradeable, ONFT721Base, ERC721HolderUpgradeable {
    address public collateral;
    uint256[49] private __gap;

    function __CustomONFT721Base_init(
        string memory _name,
        string memory _symbol,
        address _collateral,
        uint _minGasToTransfer,
        address _lzEndpoint
    ) public initializer {
        __Pausable_init();
        __ONFT721Base_init(_name, _symbol, _minGasToTransfer, _lzEndpoint);
        collateral = _collateral;
    }

    /*
    function rawOwnerOf(uint tokenId) public view returns (address) {
        if (_exists(tokenId)) {
            return ownerOf(tokenId);
        }
        return address(0);
    }
    */

    function batchCrossTo(
        uint[] calldata tokenIds,
        uint16 targetChain,
        bytes calldata adapterParams
    ) public payable virtual nonReentrant whenNotPaused {
        bytes memory addr = abi.encodePacked(_msgSender());
        sendBatchFrom(_msgSender(), targetChain, addr, tokenIds, payable(_msgSender()), address(0), adapterParams);
    }

    function crossTo(
        uint tokenId,
        uint16 targetChain,
        bytes calldata adapterParams
    ) public payable virtual nonReentrant whenNotPaused {
        bytes memory addr = abi.encodePacked(_msgSender());
        sendFrom(_msgSender(), targetChain, addr, tokenId, payable(_msgSender()), address(0), adapterParams);
    }

    function _debitFrom(address _from, uint16 _chain, bytes memory _payload, uint _tokenId) internal virtual override {
        if (collateral != address(0)) {
            IERC721 token = IERC721(collateral);
            token.safeTransferFrom(_msgSender(), address(this), _tokenId);
            /*
            if (!_exists(_tokenId)) {
                _safeMint(address(this), _tokenId);
            } else {
                require(ownerOf(_tokenId) == address(this));
            }*/
        } else super._debitFrom(_from, _chain, _payload, _tokenId);
    }

    function _creditTo(uint16 _chain, address _toAddress, uint _tokenId) internal virtual override {
        if (collateral != address(0)) {
            IERC721 token = IERC721(collateral);
            require(token.ownerOf(_tokenId) == address(this), "collateral err");
            //require(ownerOf(_tokenId) == address(this));
            token.safeTransferFrom(address(this), _toAddress, _tokenId);
        } else {
            super._creditTo(_chain, _toAddress, _tokenId);
        }
    }

    function Pause() public onlyOwner {
        _pause();
    }

    function Resume() public onlyOwner {
        _unpause();
    }
}
