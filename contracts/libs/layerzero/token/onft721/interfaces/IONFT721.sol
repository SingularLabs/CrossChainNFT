// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

import "./IONFT721Core.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/**
 * @dev Interface of the ONFT standard
 */
interface IONFT721 is IONFT721Core, IERC721Upgradeable {

}
