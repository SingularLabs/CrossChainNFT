// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./JsmnSolLib.sol";

import "hardhat/console.sol";

contract BoredApeYachtClub is OwnableUpgradeable, ERC721Upgradeable {
    bytes public temp;

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
        temp = _msgData();
        mint(_msgSender(), 1);
        //console.log("----- receive:", msg.data);
    }

    //https://github.com/BlockInfinity/jsmnSol/tree/master
    fallback(bytes calldata data) external payable returns (bytes memory) {
        temp = data;
        string
            memory json = '{  "p": "obs-20-fair",  "tick": "ordi",  "argv": {    "op": "transfer",    "amt": "100"  }}';

        uint returnValue;
        JsmnSolLib.Token[] memory tokens;
        uint actualNum;

        (returnValue, tokens, actualNum) = JsmnSolLib.parse(json, 20);

        JsmnSolLib.Token memory p = tokens[2];
        string memory jsonElement = JsmnSolLib.getBytes(json, p.start, p.end);
        JsmnSolLib.Token memory tick = tokens[4];
        string memory jsonElement0 = JsmnSolLib.getBytes(json, tick.start, tick.end);
        JsmnSolLib.Token memory op = tokens[8];
        string memory jsonElement1 = JsmnSolLib.getBytes(json, op.start, op.end);
        JsmnSolLib.Token memory amt = tokens[10];
        string memory jsonElement2 = JsmnSolLib.getBytes(json, amt.start, amt.end);
        console.log("Changing owner from %s ", returnValue);
        console.log("Changing owner from %s ", actualNum);
        console.log("Changing o from %s ", jsonElement);
        console.log("Changing tick from %s ", jsonElement0);
        console.log("Changing op from %s ", jsonElement1);
        console.log("Changing amt from %s ", jsonElement2);
    }
}
