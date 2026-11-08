"""Modul Kriptografi TanahKita — Sistem Verifikasi Integritas & Kerahasiaan Tanah Adat Papua.

Mencakup:
- Tugas 1 (v0.1): SHA-256 (`hasher.py`), Hash-Chain (`chain.py`), CSPRNG Tokens (`tokens.py`).
- Tugas 2 (v0.2): Manajemen Kunci CSPRNG & HKDF (`key_manager.py`), Validasi Allowlist (`validator.py`),
  Enkripsi Terautentikasi AES-256-GCM (`aead_archive.py`), Rantai Berautentikasi HMAC-SHA-256 (`hmac_chain.py`),
  dan Password Hashing Argon2id (`password_security.py`).
"""

from .hasher import hash_bytes, hash_file, verify_hash, create_document_fingerprint
from .chain import LandClaimRecord, LandRecordChain
from .tokens import generate_verification_token, generate_claim_nonce, generate_elder_otp
from .key_manager import (
    generate_master_key,
    ensure_external_master_key,
    rotate_master_key,
    derive_aead_key,
    derive_hmac_key,
    derive_purpose_key,
)
from .validator import (
    validate_and_normalize_claim_payload,
    canonicalize_json_bytes,
    build_claim_aad,
)
from .aead_archive import (
    encrypt_bytes_aead,
    decrypt_bytes_aead,
    encrypt_claim_archive,
    decrypt_claim_archive,
)
from .hmac_chain import (
    compute_record_hmac,
    AuthenticatedLandRecordChain,
)
from .password_security import (
    validate_password_nist,
    hash_password_argon2id,
    verify_password_argon2id,
)

__all__ = [
    "hash_bytes",
    "hash_file",
    "verify_hash",
    "create_document_fingerprint",
    "LandClaimRecord",
    "LandRecordChain",
    "generate_verification_token",
    "generate_claim_nonce",
    "generate_elder_otp",
    "generate_master_key",
    "ensure_external_master_key",
    "rotate_master_key",
    "derive_aead_key",
    "derive_hmac_key",
    "derive_purpose_key",
    "validate_and_normalize_claim_payload",
    "canonicalize_json_bytes",
    "build_claim_aad",
    "encrypt_bytes_aead",
    "decrypt_bytes_aead",
    "encrypt_claim_archive",
    "decrypt_claim_archive",
    "compute_record_hmac",
    "AuthenticatedLandRecordChain",
    "validate_password_nist",
    "hash_password_argon2id",
    "verify_password_argon2id",
]
