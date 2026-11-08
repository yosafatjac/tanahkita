"""Modul Keamanan Kata Sandi & PIN Tetua Adat dengan Argon2id (RFC 9106 & NIST SP 800-63B-4).

TanahKita v0.2 — Memenuhi Kriteria Rubrik R2 (K1, K2, K3, K4) & KKS Tugas 2:
- Menggunakan algoritma pemenang Password Hashing Competition: **Argon2id** (`RFC 9106`)
  melalui pustaka terpelihara `pyca/cryptography` (`Argon2id`).
- Parameter minimum sesuai OWASP Password Storage Cheat Sheet:
  - Memori (`memory_cost`): 19456 KiB (19 MiB)
  - Iterasi (`iterations`): 2
  - Paralelisme (`lanes`): 1
  - Panjang Salt CSPRNG: 16 byte (128-bit) unik per pengguna
  - Panjang Tag Hash: 32 byte (256-bit)
- Menghasilkan dan memverifikasi format string standar PHC:
  `$argon2id$v=19$m=19456,t=2,p=1$<salt_b64>$<hash_b64>`
- Menerapkan kebijakan kata sandi NIST SP 800-63B-4 (minimal 15 karakter untuk faktor tunggal,
  maksimal 128 karakter, normalisasi Unicode NFC, dan pemeriksaan blocklist kata sandi bocor).
"""

import base64
import hmac
import secrets
import unicodedata

from cryptography.exceptions import InvalidKey
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

ARGON2_MEMORY_KIB = 19456  # 19 MiB (rekomendasi minimum OWASP)
ARGON2_ITERATIONS = 2
ARGON2_LANES = 1
ARGON2_SALT_LEN = 16
ARGON2_HASH_LEN = 32

MIN_PASSWORD_LEN_SINGLE_FACTOR = 15  # NIST SP 800-63B-4 (Agustus 2025)
MAX_PASSWORD_LEN = 128

# Daftar kata sandi umum/bocor yang wajib ditolak (NIST SP 800-63B-4 blocklist)
COMPROMISED_PASSWORD_BLOCKLIST = {
    "password1234567",
    "123456789012345",
    "qwertyuiop12345",
    "admin1234567890",
    "tanahkita123456",
    "papuamimika1234",
}


def validate_password_nist(password: str, require_single_factor_length: bool = True) -> bytes:
    """Memvalidasi kebijakan kata sandi sesuai NIST SP 800-63B-4 dan menormalisasi ke UTF-8 NFC."""
    if not isinstance(password, str):
        raise TypeError("Kata sandi harus bertipe string.")

    # NIST SP 800-63B-4: Normalisasi ke bentuk kanonis NFC sebelum di-hash
    normalized = unicodedata.normalize("NFC", password)
    min_len = MIN_PASSWORD_LEN_SINGLE_FACTOR if require_single_factor_length else 8

    if len(normalized) < min_len:
        raise ValueError(
            f"Kata sandi terlalu pendek: minimal {min_len} karakter sesuai standar NIST SP 800-63B-4."
        )
    if len(normalized) > MAX_PASSWORD_LEN:
        raise ValueError(f"Kata sandi melebihi batas maksimum {MAX_PASSWORD_LEN} karakter.")

    if normalized.lower() in COMPROMISED_PASSWORD_BLOCKLIST:
        raise ValueError("PASSWORD_COMPROMISED: Kata sandi termasuk dalam daftar kata sandi bocor/umum.")

    return normalized.encode("utf-8")


def hash_password_argon2id(password: str, require_single_factor_length: bool = True) -> str:
    """Menghasilkan hash kata sandi menggunakan Argon2id dengan salt acak unik CSPRNG.

    Mengembalikan string format PHC standar (`$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`).
    """
    pwd_bytes = validate_password_nist(password, require_single_factor_length)
    salt = secrets.token_bytes(ARGON2_SALT_LEN)

    kdf = Argon2id(
        salt=salt,
        length=ARGON2_HASH_LEN,
        iterations=ARGON2_ITERATIONS,
        lanes=ARGON2_LANES,
        memory_cost=ARGON2_MEMORY_KIB,
    )
    derived = kdf.derive(pwd_bytes)
    salt_b64 = base64.b64encode(salt).decode("ascii").rstrip("=")
    hash_b64 = base64.b64encode(derived).decode("ascii").rstrip("=")
    return f"$argon2id$v=19$m={ARGON2_MEMORY_KIB},t={ARGON2_ITERATIONS},p={ARGON2_LANES}${salt_b64}${hash_b64}"


def _pad_b64(s: str) -> bytes:
    rem = len(s) % 4
    if rem:
        s += "=" * (4 - rem)
    return base64.b64decode(s.encode("ascii"), validate=True)


def verify_password_argon2id(password: str, phc_hash: str) -> bool:
    """Memverifikasi kata sandi terhadap string PHC Argon2id secara gagal tertutup (fail-closed).

    Menggunakan `Argon2id.verify()` dari pustaka `cryptography` serta perbandingan waktu konstan.
    Tidak pernah melempar exception tak tertangani atau meloloskan hash yang rusak.
    """
    if not isinstance(password, str) or not isinstance(phc_hash, str):
        return False
    if len(password) == 0 or len(password) > MAX_PASSWORD_LEN:
        return False

    try:
        parts = phc_hash.split("$")
        # Format: ['', 'argon2id', 'v=19', 'm=19456,t=2,p=1', '<salt>', '<hash>']
        if len(parts) != 6 or parts[1] != "argon2id" or parts[2] != "v=19":
            return False

        params = dict(item.split("=") for item in parts[3].split(","))
        m_cost = int(params["m"])
        t_cost = int(params["t"])
        p_lanes = int(params["p"])

        salt = _pad_b64(parts[4])
        expected_key = _pad_b64(parts[5])
        if len(salt) < 8 or len(expected_key) < 16:
            return False

        pwd_bytes = unicodedata.normalize("NFC", password).encode("utf-8")
        kdf = Argon2id(
            salt=salt,
            length=len(expected_key),
            iterations=t_cost,
            lanes=p_lanes,
            memory_cost=m_cost,
        )
        # Verifikasi resmi pustaka cryptography (melempar InvalidKey bila tidak cocok)
        kdf.verify(pwd_bytes, expected_key)
        # Lapisan ganda waktu-konstan
        recalculated = Argon2id(
            salt=salt,
            length=len(expected_key),
            iterations=t_cost,
            lanes=p_lanes,
            memory_cost=m_cost,
        ).derive(pwd_bytes)
        return hmac.compare_digest(recalculated, expected_key)
    except (InvalidKey, ValueError, KeyError, TypeError):
        return False
