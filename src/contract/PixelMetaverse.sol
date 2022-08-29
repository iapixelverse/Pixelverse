//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PixelNFT is ERC721URIStorage {

    event Return(uint256);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("PixelNFT", "PixelsInMetaverse") {

    }

    function currentIndex() public view returns(uint256){
        return _tokenIds.current();
    }

    function _baseURI() internal view override  virtual returns (string memory) {
        return "ipfs://";
    }

    function mintToken(address owner, string memory metadataURI) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(owner, id);
        _setTokenURI(id, metadataURI);
        emit Return(id);
        return id;
    }
}
