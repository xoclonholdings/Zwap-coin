from typing import Dict


TREASURY_WALLET = "0x102a5301c56cFCf4F02bEA3184Bdb44b731375E0"


async def get_treasury_status(db, w3, zwap_contract) -> Dict:
    """
    V1 Treasury Status (read-only)

    Returns:
    - Treasury wallet address
    - Native MATIC balance
    - ZWAP token balance
    - Web3 connection status

    No swap/issuance tracking in V1.
    """

    native_balance = 0.0
    zwap_balance = 0.0
    web3_connected = bool(w3 and w3.is_connected())

    if web3_connected:
        # Native MATIC
        try:
            native_wei = w3.eth.get_balance(TREASURY_WALLET)
            native_balance = float(w3.from_wei(native_wei, "ether"))
        except Exception:
            native_balance = 0.0

        # ZWAP token
        try:
            if zwap_contract is not None:
                raw = zwap_contract.functions.balanceOf(TREASURY_WALLET).call()
                zwap_balance = float(w3.from_wei(raw, "ether"))
        except Exception:
            zwap_balance = 0.0

    return {
        "treasury_wallet": TREASURY_WALLET,
        "matic_balance": native_balance,
        "zwap_balance": zwap_balance,
        "web3_connected": web3_connected,
        "status": "connected" if web3_connected else "offline",
    }