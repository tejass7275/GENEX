"""Helpers for perceptual-hash values."""


def phash_to_signed_int(phash_hex: str) -> int:
    """16-char hex -> signed 64-bit int (fits a Postgres BIGINT)."""
    v = int(phash_hex, 16)
    return v - (1 << 64) if v >= (1 << 63) else v


def hamming_hex(a: str, b: str) -> int:
    return bin(int(a, 16) ^ int(b, 16)).count("1")

