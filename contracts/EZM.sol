//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/*
----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------
*/

/// @title EZM
/// @notice
/// @author @okwme
/// @dev

contract EZM is Ownable {
    bool public migrationCompleted = true; // initialize as true. Set to false before migrating somewhere new.
    bytes32 public stateroot;
    uint256 public lastBlock;

    constructor(bytes32 stateroot_) {
        stateroot = stateroot_;
    }

    modifier migrating() {
        require(!migrationCompleted, "migrating complete");
        _;
    }

    modifier ready() {
        require(migrationCompleted, "migrating");
        _;
    }

    function migrate() public onlyOwner {
        migrationCompleted = false;
        stateroot = 0x0; // this should brick the current contract so that it's in migrating
        // mode but can't be properly updated.
        lastBlock = block.number; // used to help create proofs
    }

    function storeMultiData(
        uint256[] calldata slots,
        bytes32[] calldata data
    ) public migrating {
        require(
            slots.length == data.length,
            "Slots and data lengths need to match"
        );
        for (uint256 i = 0; i < slots.length; i++) {
            uint256 slot = slots[i];
            bytes32 datum = data[i];
            assembly {
                sstore(slot, datum)
            }
        }
    }

    function storeData(uint256 slot, bytes32 data) public migrating {
        assembly {
            sstore(slot, data)
        }
    }

    function verify(
        bytes32 leaf,
        bytes32[] memory proof,
        bytes32 root
    ) public pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash < proofElement) {
                // Hash current hash with proof element
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                // Hash proof element with current hash
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }

        // Check if the computed hash matches the root
        return computedHash == root;
    }
}
