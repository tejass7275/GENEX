from app.services import web3_client


def anchor_root(root_hex: str) -> str:
    """Anchor the Merkle root on Polygon Amoy (gasless via Paymaster). Returns tx hash."""
    return web3_client.post("/anchor", {"root": "0x" + root_hex})["txHash"]


def is_root_anchored(root_hex: str) -> bool:
    return bool(web3_client.get("/anchor/verify", {"root": "0x" + root_hex}).get("anchored"))

