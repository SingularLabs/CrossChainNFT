// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../libs/layerzero/token/onft721/ONFT721Base.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract GoldenChipmunk is PausableUpgradeable, ONFT721Base, ERC721HolderUpgradeable {
    using SignatureChecker for address;
    event CrossToOrd(address indexed from, string indexed to, uint256 indexed tokenId);
    uint assetChainId;
    address public executor;

    //executor:0xd441D3185A95b8476c36C32E63605cc3b43Dc3Ef
    function initialize(uint _assetChainId, address _lzEndpoint, address _executor) public initializer {
        __Pausable_init();
        __ONFT721Base_init("GoldenChipmunk", "GCM", 1, _lzEndpoint);
        if (_executor == address(0)) executor = _msgSender();
        else executor = _executor;
        assetChainId = _assetChainId;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://bafybeieczsni3noxdebwny7tc2virpnx66vkw4suigqmgr7vi5yf46ke2q/";
    }

    function isEthAsset(uint tokenId) public pure returns (bool) {
        return tokenId <= 3999 && tokenId >= 2000;
    }

    //--- OrdAssetWrapBase

    modifier onlyExecutor() {
        require(_msgSender() == executor);
        _;
    }

    function setExecutor(address _executor) public onlyOwner {
        executor = _executor;
    }

    function crossFromOrd(address to, uint tokenId) public onlyExecutor whenNotPaused nonReentrant {
        require(!isEthAsset(tokenId), "id err");
        if (!_exists(tokenId)) {
            _safeMint(to, tokenId);
        } else {
            require(ownerOf(tokenId) == address(this), "not pledged");
            _safeTransfer(address(this), to, tokenId, "");
        }
    }

    function crossToOrd(string calldata to, uint[] calldata tokenIds) public payable whenNotPaused nonReentrant {
        require(msg.value >= tokenIds.length * 0.002 ether, "need cross gas");
        for (uint i = 0; i < tokenIds.length; i++) {
            require(!isEthAsset(tokenIds[i]), "id err");
            safeTransferFrom(_msgSender(), address(this), tokenIds[i]);
            emit CrossToOrd(_msgSender(), to, tokenIds[i]);
        }
    }

    function withdrawFee(address to, uint amount) public onlyExecutor {
        payable(to).transfer(amount);
    }

    //--- mint
    /*
    sign:_msgSender()、to、tokenId
    */
    function getMintHash(address sender, address to, uint tokenId, uint price) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(sender, to, tokenId, price));
    }

    function mint(
        address to,
        uint tokenId,
        uint price,
        bytes calldata signature
    ) public payable virtual nonReentrant whenNotPaused {
        require(assetChainId == block.chainid, "chain err");
        require(isEthAsset(tokenId), "id err");
        require(msg.value >= price && msg.value >= 0.064 ether, "value err");
        bytes32 hash = getMintHash(_msgSender(), to, tokenId, price);
        require(
            executor.isValidSignatureNow(
                keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
                signature
            ),
            "signature err"
        );
        _safeMint(to, tokenId);
    }

    //--- CustomONFT721Base
    function crossTo(
        uint tokenId,
        uint16 targetChain,
        bytes calldata adapterParams
    ) public payable virtual nonReentrant whenNotPaused {
        require(isEthAsset(tokenId), "id err");
        bytes memory addr = abi.encodePacked(_msgSender());
        sendFrom(_msgSender(), targetChain, addr, tokenId, payable(_msgSender()), address(0), adapterParams);
    }

    function Pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function Resume() public onlyOwner whenPaused {
        _unpause();
    }
}
