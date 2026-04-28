ADJECTIVES = [
    "Nova",
    "Pixel",
    "Quantum",
    "Echo",
    "Neon",
    "Solar",
    "Cyber",
    "Hyper",
    "Shadow",
    "Turbo",
]

NOUNS = [
    "Runner",
    "Walker",
    "Strider",
    "Pilot",
    "Glider",
    "Breaker",
    "Phantom",
    "Rider",
    "Explorer",
    "Voyager",
]


def hash_string(value: str = "") -> int:
    hash_value = 0
    safe_value = str(value or "").lower().strip()

    for char in safe_value:
        hash_value = ((hash_value << 5) - hash_value) + ord(char)
        hash_value = hash_value & 0xFFFFFFFF

        if hash_value >= 0x80000000:
            hash_value -= 0x100000000

    return abs(hash_value)


def generate_username(email: str = "", wallet_address: Optional[str] = None) -> str:
    safe_email = normalize_email(email)
    safe_wallet = normalize_wallet(wallet_address) or ""

    seed_source = safe_email or safe_wallet

    if not seed_source:
        return ""

    if safe_wallet.startswith("0x") and len(safe_wallet) >= 10:
        try:
            seed = int(safe_wallet[2:10], 16)
        except Exception:
            seed = hash_string(seed_source)
    else:
        seed = hash_string(seed_source)

    safe_seed = abs(seed)
    adjective = ADJECTIVES[safe_seed % len(ADJECTIVES)]
    noun = NOUNS[(safe_seed // 7) % len(NOUNS)]
    number = safe_seed % 999

    return f"{adjective}{noun}{number}"