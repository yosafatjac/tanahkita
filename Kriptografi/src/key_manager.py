"""Modul Manajemen Kunci Kriptografis & Penurunan Kunci HKDF (RFC 5869).

TanahKita v0.2 — Memenuhi Kriteria Rubrik R2 (K2 & K3):
1. Kunci induk (Master Key 256-bit / 32 byte) dibangkitkan dengan CSPRNG (`secrets.token_bytes(32)`).
2. Kunci disimpan DI LUAR repositori Git (`/Volumes/For Apple/.secrets/tanahkita_master.key` atau
   melalui variabel lingkungan `TANAHKITA_MASTER_KEY_FILE`) dengan hak akses terbatas `0600` (owner read/write).
3. Pemisahan kunci per tujuan (Key Separation) sesuai NIST SP 800-57 & RFC 5869 menggunakan HKDF-SHA256:
   - Sub-kunci AEAD AES-256-GCM (`info=b"tanahkita:v0.2:aead-arsip-aes256gcm"`)
   - Sub-kunci HMAC-SHA-256 Rantai Riwayat (`info=b"tanahkita:v0.2:hmac-rantai-sha256"`)
"""

from __future__ import annotations

import os
import stat
import secrets
from pathlib import Path
from typing import Tuple

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

MASTER_KEY_BYTES = 32  # 256-bit
SUBKEY_BYTES = 32      # 256-bit untuk AES-256-GCM dan HMAC-SHA-256

# Salt domain statis untuk ekstraksi HKDF (kunci induk sudah berentropi penuh 256-bit CSPRNG)
HKDF_DOMAIN_SALT = b"TanahKita-Mimika-Papua-HKDF-Salt-v0.2"
INFO_AEAD_ARCHIVE = b"tanahkita:v0.2:aead-arsip-aes256gcm"
INFO_HMAC_CHAIN = b"tanahkita:v0.2:hmac-rantai-sha256"

# Lokasi default di luar repositori (di SSD Eksternal /Volumes/For Apple/.secrets/)
DEFAULT_EXTERNAL_KEY_PATH = Path("/Volumes/For Apple/.secrets/tanahkita_master.key")


def validate_key_bytes(key: bytes, expected_len: int = SUBKEY_BYTES) -> bytes:
    """Memvalidasi tipe dan panjang kunci secara ketat (fail-closed)."""
    if not isinstance(key, bytes):
        raise TypeError("Kunci kriptografi wajib bertipe bytes, bukan str atau tipe lain.")
    if len(key) != expected_len:
        raise ValueError(f"Panjang kunci harus tepat {expected_len} byte ({expected_len * 8} bit), diterima {len(key)} byte.")
    return key


def generate_master_key() -> bytes:
    """Membangkitkan kunci induk 256-bit (32 byte) menggunakan CSPRNG sistem operasi."""
    return secrets.token_bytes(MASTER_KEY_BYTES)


def get_external_key_path() -> Path:
    """Menentukan lokasi berkas kunci di luar repositori Git."""
    env_path = os.environ.get("TANAHKITA_MASTER_KEY_FILE")
    if env_path:
        path = Path(env_path).expanduser().resolve()
    else:
        path = DEFAULT_EXTERNAL_KEY_PATH.resolve()

    # Pastikan berkas kunci TIDAK berada di dalam pohon direktori repositori tanahkita
    repo_root = Path(__file__).resolve().parents[2]
    try:
        path.relative_to(repo_root)
        raise PermissionError(
            f"PELANGGARAN KEAMANAN: Lokasi kunci ({path}) berada di dalam repositori ({repo_root}). "
            "Kunci wajib disimpan di luar repositori!"
        )
    except ValueError:
        # ValueError dari relative_to berarti path berada di luar repo_root (AMAN)
        pass

    return path


def ensure_external_master_key(key_path: Path | None = None) -> Tuple[bytes, Path]:
    """Memuat atau membuat kunci induk CSPRNG di luar repositori dengan izin akses 0600."""
    target_path = key_path.resolve() if key_path else get_external_key_path()

    # Verifikasi tidak berada di dalam repo
    repo_root = Path(__file__).resolve().parents[2]
    try:
        target_path.relative_to(repo_root)
        raise PermissionError("Kunci tidak boleh disimpan di dalam direktori repositori!")
    except ValueError:
        pass

    target_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(target_path.parent, stat.S_IRWXU)  # 0700 untuk folder .secrets
    except OSError:
        pass

    if not target_path.exists():
        raw_key = generate_master_key()
        target_path.write_text(raw_key.hex() + "\n", encoding="utf-8")
        os.chmod(target_path, stat.S_IRUSR | stat.S_IWUSR)  # 0600 (-rw-------)
        return raw_key, target_path

    # Pastikan izin berkas tetap ketat (0600)
    os.chmod(target_path, stat.S_IRUSR | stat.S_IWUSR)
    hex_content = target_path.read_text(encoding="utf-8").strip()
    try:
        raw_key = bytes.fromhex(hex_content)
    except ValueError as exc:
        raise ValueError("Isi berkas kunci eksternal rusak (bukan format heksadesimal valid).") from exc

    return validate_key_bytes(raw_key, MASTER_KEY_BYTES), target_path


def rotate_master_key(key_path: Path | None = None) -> Tuple[bytes, Path]:
    """Mengacak ulang (rotasi) kunci induk dengan CSPRNG baru dan menyimpannya dengan izin 0600."""
    target_path = key_path.resolve() if key_path else get_external_key_path()
    new_key = generate_master_key()
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(new_key.hex() + "\n", encoding="utf-8")
    os.chmod(target_path, stat.S_IRUSR | stat.S_IWUSR)
    return new_key, target_path


def derive_purpose_key(master_key: bytes, info: bytes, length: int = SUBKEY_BYTES) -> bytes:
    """Menurunkan sub-kunci kriptografis menggunakan HKDF-SHA256 (RFC 5869).

    Memisahkan kunci berdasarkan konteks tujuan (`info`) sehingga satu kunci induk
    tidak pernah dipakai langsung untuk dua algoritma berbeda (AES-GCM vs HMAC).
    """
    validate_key_bytes(master_key, MASTER_KEY_BYTES)
    if not isinstance(info, bytes) or len(info) == 0:
        raise ValueError("Parameter konteks 'info' HKDF harus berupa bytes tidak kosong.")

    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=length,
        salt=HKDF_DOMAIN_SALT,
        info=info,
    )
    return hkdf.derive(master_key)


def derive_aead_key(master_key: bytes) -> bytes:
    """Menurunkan kunci khusus 256-bit untuk enkripsi arsip AES-256-GCM."""
    return derive_purpose_key(master_key, INFO_AEAD_ARCHIVE, SUBKEY_BYTES)


def derive_hmac_key(master_key: bytes) -> bytes:
    """Menurunkan kunci khusus 256-bit untuk autentikasi rantai riwayat HMAC-SHA-256."""
    return derive_purpose_key(master_key, INFO_HMAC_CHAIN, SUBKEY_BYTES)
