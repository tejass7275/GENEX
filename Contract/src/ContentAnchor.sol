//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract ContentAnchor is Ownable, Pausable {
    address public operator;
    uint256 public id;

    event InitialOperator(address operator);

    constructor(address _operator) Ownable(msg.sender) {
        require(_operator != address(0), "operator cannot be a zero address");
        operator = _operator;
        emit InitialOperator(operator);
    }

    struct Anchor {
        bytes32 merkleRoot;
        uint256 contentCount;
        uint256 timestamp;
        string irysTxId;
    }

    event DataAddedSuccessfully(bytes32 indexed root, uint256 timestamp);
    event OperatorReplaced(
        address indexed oldOperator,
        address indexed newOperator
    );

    Anchor[] public anchors;

    modifier onlyOperator() {
        require(operator == msg.sender, "Not operator");
        _;
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function resumeContract() external onlyOwner {
        _unpause();
    }

    function replaceOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0));
        emit OperatorReplaced(operator, newOperator);
        operator = newOperator;
    }

    function publishAnchor(
        bytes32 _merkleRoot,
        uint256 _contentCount,
        string calldata _irysTxId
    ) external onlyOperator whenNotPaused {
        // Anchor anchor;
        // _anchor.merkleRoot = merkleRoot;
        // _anchor.contentCount = contentCount;
        // _anchor.irysTxId = irysTxId;
        // _anchor.timestamp = block.timestamp;
        // anchors.push(Anchor);

        anchors.push(
            Anchor({
                merkleRoot: _merkleRoot,
                contentCount: _contentCount,
                timestamp: block.timestamp,
                irysTxId: _irysTxId
            })
        );
        id++;
        emit DataAddedSuccessfully(_merkleRoot, block.timestamp);
    }

    function verifyContent(
        bytes32 contentHash,
        bytes8 phash,
        string calldata ownerDid,
        string calldata contentType,
        uint256 timestamp,
        bytes32[] calldata merkleProof,
        uint256 anchorAt
    ) external view returns (bool, uint256, uint256, string memory) {
        require(anchorAt < anchors.length, "anchor does not exist");
        Anchor storage _anchor = anchors[anchorAt];
        bytes32 leaf = keccak256(abi.encodePacked(contentHash, phash, ownerDid, contentType, timestamp));
        bool valid = MerkleProof.verify(merkleProof, _anchor.merkleRoot, leaf);
        require(valid, "Invalid proof: content not in this anchor");
        return (
            true,
            _anchor.contentCount,
            _anchor.timestamp,
            _anchor.irysTxId
        );
    }

    function totalAnchors() external view returns (uint256) {
        return anchors.length;
    }

    function getAnchor(
        uint256 index
    ) external view returns (bytes32, uint256, uint256, string memory) {
        require(index < anchors.length, "anchor does not exist");
        Anchor storage a = anchors[index];
        return (a.merkleRoot, a.contentCount, a.timestamp, a.irysTxId);
    }
}
