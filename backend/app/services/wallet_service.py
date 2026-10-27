from app.services import web3_client


def create_wallet(google_sub: str) -> str:
    """Ask web3-service for the user's ERC-4337 smart-wallet address."""
    return web3_client.post("/wallet", {"userId": google_sub})["address"]

