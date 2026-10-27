"""Merkle tree with sorted-pair hashing, so a proof is just a list of sibling
hashes (no left/right flags). Leaves and inner nodes use different prefixes."""
import hashlib
from typing import Dict, List, Tuple


def _h(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()


def leaf_hash(sha256_hex: str) -> bytes:
    return _h(b"\x00" + bytes.fromhex(sha256_hex))


def _node(a: bytes, b: bytes) -> bytes:
    lo, hi = sorted((a, b))
    return _h(b"\x01" + lo + hi)


def build_tree(leaf_hexes: List[str]) -> Tuple[str, Dict[str, List[str]]]:
    """Returns (root_hex, {leaf_hex: [sibling_hex, ...]})."""
    if not leaf_hexes:
        raise ValueError("Cannot build a Merkle tree with no leaves")
    levels = [[leaf_hash(x) for x in leaf_hexes]]
    while len(levels[-1]) > 1:
        cur, nxt = levels[-1], []
        for i in range(0, len(cur), 2):
            nxt.append(_node(cur[i], cur[i + 1]) if i + 1 < len(cur) else cur[i])
        levels.append(nxt)

    proofs: Dict[str, List[str]] = {}
    for idx, leaf in enumerate(leaf_hexes):
        proof, i = [], idx
        for level in levels[:-1]:
            sibling = i ^ 1
            if sibling < len(level):
                proof.append(level[sibling].hex())
            i //= 2
        proofs[leaf] = proof
    return levels[-1][0].hex(), proofs


def verify_proof(leaf_hex: str, proof: List[str], root_hex: str) -> bool:
    h = leaf_hash(leaf_hex)
    for sibling in proof:
        h = _node(h, bytes.fromhex(sibling))
    return h.hex() == root_hex

