// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract OrdAssetWrapBase is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC721HolderUpgradeable
{
    address public executor;

    function __OrdAssetWrapBase_init(string memory _name, string memory _symbol, address _executor) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ERC721_init(_name, _symbol);
        if (_executor == address(0)) executor = _msgSender();
        else executor = _executor;
    }

    modifier onlyExecutor() {
        require(_msgSender() == executor);
        _;
    }

    function setExecutor(address _executor) public onlyOwner {
        executor = _executor;
    }

    function crossFromOrd(address to, uint tokenId) public onlyExecutor whenNotPaused nonReentrant {
        if (!_exists(tokenId)) {
            _safeMint(to, tokenId);
        } else {
            require(ownerOf(tokenId) == address(this));
            safeTransferFrom(address(this), to, tokenId);
        }
    }

    function crossToOrd(address to, uint tokenId) public whenNotPaused nonReentrant {
        safeTransferFrom(to, address(this), tokenId);
    }
}
