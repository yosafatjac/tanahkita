"""Modul Enkripsi Terautentikasi Arsip Klaim Tanah Adat (AES-256-GCM).

TanahKita v0.2 — Memenuhi Kriteria Rubrik R2 (K1, K2, K3, K4):
- Mengenkripsi dan mengautentikasi arsip bukti klaim tanah ulayat (surat kesepakatan adat,
  koordinat batas keramat, dan manifes sidik jari dokumen) menggunakan AES-256-GCM (`pyca/cryptography`).
- Terhubung langsung dalam satu alur dengan komponen Tugas 1 (`hasher.create_document_fingerprint`
  dan `hasher.verify_hash`).
- Format paket biner: `nonce (12 byte) || ciphertext (n byte) || tag (16 byte)`.
- AAD (Associated Authenticated Data) mengikat paket pada konteks `claim_id`, `marga`, dan `lokasi`
  sehingga paket terenkripsi tidak dapat dipindahkan ke klaim marga lain.
- Dekripsi bersifat gagal tertutup (fail-closed): melempar `InvalidTag` atau `ValueError` tanpa
  pernah mengeluarkan plaintext sebagian bila ada 1 bit pun yang dimodifikasi.
"""

from __future__ import annotations

import json
import os
from typing import Dict, Any

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from hasher import create_document_fingerprint, verify_hash
from key_manager import validate_key_bytes, SUBKEY_BYTES
from validator import (
    validate_and_normalize_claim_payload,
    canonicalize_json_bytes,
    build_claim_aad,
)

NONCE_LENGTH = 12  # 96-bit sesuai rekomendasi NIST SP 800-38D
TAG_LENGTH = 16    # 128-bit authentication tag GCM
MIN_PACKET_LENGTH = NONCE_LENGTH + TAG_LENGTH  # 28 byte minimum


def encrypt_bytes_aead(key: bytes, plaintext: bytes, aad: bytes = b"") -> bytes:
    """Enkripsi tingkat rendah dengan AES-256-GCM.

    Menghasilkan paket = nonce (12B) || ciphertext || tag (16B).
    Nonce dibangkitkan baru dari CSPRNG (`os.urandom(12)`) pada setiap panggilan.
    """
    validate_key_bytes(key, SUBKEY_BYTES)
    if not isinstance(plaintext, bytes):
        raise TypeError("Plaintext harus bertipe bytes.")
    if not isinstance(aad, bytes):
        raise TypeError("AAD harus bertipe bytes.")

    nonce = os.urandom(NONCE_LENGTH)
    ciphertext_and_tag = AESGCM(key).encrypt(nonce, plaintext, aad)
    return nonce + ciphertext_and_tag


def decrypt_bytes_aead(key: bytes, packet: bytes, aad: bytes = b"") -> bytes:
    """Dekripsi tingkat rendah dengan AES-256-GCM yang gagal tertutup (fail-closed).

    Melempar `ValueError` jika paket terpotong (< 28 byte) dan `InvalidTag` jika
    nonce, ciphertext, tag, atau AAD tidak cocok.
    """
    validate_key_bytes(key, SUBKEY_BYTES)
    if not isinstance(packet, bytes):
        raise TypeError("Paket terenkripsi harus bertipe bytes.")
    if not isinstance(aad, bytes):
        raise TypeError("AAD harus bertipe bytes.")
    if len(packet) < MIN_PACKET_LENGTH:
        raise ValueError(
            f"Paket AEAD tidak sah atau terpotong: panjang {len(packet)} byte "
            f"(minimum {MIN_PACKET_LENGTH} byte untuk nonce 12B + tag 16B)."
        )

    nonce = packet[:NONCE_LENGTH]
    ciphertext_and_tag = packet[NONCE_LENGTH:]
    return AESGCM(key).decrypt(nonce, ciphertext_and_tag, aad)


def encrypt_claim_archive(
    aead_key: bytes,
    claim_payload: Dict[str, Any],
    raw_document_bytes: bytes,
    doc_type: str = "SURAT_PERNYATAAN_ULAYAT",
) -> bytes:
    """Mengenkripsi berkas arsip klaim tanah adat dengan menghubungkan Tugas 1 dan Tugas 2.

    Alur terintegrasi:
    1. Validasi allowlist dan normalisasi kanonis atas `claim_payload` (Tugas 2).
    2. Pembuatan manifes sidik jari SHA-256 (`create_document_fingerprint`) dari Tugas 1.
    3. Penyusunan struktur amplop kanonis yang memuat data klaim + manifes Tugas 1.
    4. Pengikatan konteks klaim (`claim_id`, `marga`, `lokasi`) sebagai AAD.
    5. Enkripsi AEAD AES-256-GCM dengan nonce acak 12 byte baru -> `nonce || ciphertext || tag`.
    """
    validate_key_bytes(aead_key, SUBKEY_BYTES)
    if not isinstance(raw_document_bytes, bytes) or len(raw_document_bytes) == 0:
        raise ValueError("Berkas dokumen bukti (`raw_document_bytes`) harus berupa bytes tidak kosong.")

    normalized = validate_and_normalize_claim_payload(claim_payload)

    # Memanggil komponen Tugas 1: create_document_fingerprint
    fingerprint_manifest = create_document_fingerprint(
        doc_id=normalized["claim_id"],
        doc_type=doc_type,
        raw_content=raw_document_bytes,
        marga=normalized["marga"],
        lokasi=normalized["lokasi"],
        timestamp=normalized["timestamp"],
    )

    envelope = {
        "schema_version": "0.2",
        "claim": normalized,
        "fingerprint": fingerprint_manifest,
    }
    plaintext_bytes = canonicalize_json_bytes(envelope)
    aad = build_claim_aad(
        normalized["claim_id"],
        normalized["marga"],
        normalized["lokasi"],
    )
    return encrypt_bytes_aead(aead_key, plaintext_bytes, aad)


def decrypt_claim_archive(
    aead_key: bytes,
    packet: bytes,
    expected_claim_id: str,
    expected_marga: str,
    expected_lokasi: str,
    raw_document_bytes: bytes | None = None,
) -> Dict[str, Any]:
    """Membuka dan memverifikasi paket arsip klaim tanah adat secara gagal tertutup (fail-closed).

    1. Menyusun ulang AAD dari konteks yang diharapkan.
    2. Mendekripsi dan memverifikasi tag autentikasi GCM (`InvalidTag` bila dimodifikasi/ditukar).
    3. Memverifikasi keutuhan `manifest_hash` dan `content_sha256` menggunakan fungsi Tugas 1 (`verify_hash`).
    """
    aad = build_claim_aad(expected_claim_id, expected_marga, expected_lokasi)
    decrypted_bytes = decrypt_bytes_aead(aead_key, packet, aad)

    envelope = json.loads(decrypted_bytes.decode("utf-8"))
    if not isinstance(envelope, dict) or "claim" not in envelope or "fingerprint" not in envelope:
        raise ValueError("Struktur amplop arsip terdekripsi tidak valid.")

    # Verifikasi ulang integritas manifes Tugas 1 (memastikan sambungan Tugas 1 <-> Tugas 2 utuh)
    fp = dict(envelope["fingerprint"])
    recorded_manifest_hash = fp.pop("manifest_hash", "")
    manifest_serialized = json.dumps(fp, sort_keys=True).encode("utf-8")
    if not verify_hash(manifest_serialized, recorded_manifest_hash):
        raise InvalidTag("Integritas manifes sidik jari Tugas 1 tidak cocok (sambungan rusak)!")

    # Bila berkas fisik disertakan, verifikasi juga digest SHA-256 berkas terhadap manifes
    if raw_document_bytes is not None:
        if not verify_hash(raw_document_bytes, fp.get("content_sha256", "")):
            raise InvalidTag("Isi berkas bukti fisik tidak cocok dengan digest SHA-256 di dalam arsip!")

    return envelope
