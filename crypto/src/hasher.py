"""Modul Pembangkit dan Verifikasi Sidik Jari Kriptografis (SHA-256).

TanahKita — Pengamanan Bukti Berkas Penguasaan Tanah Adat Papua.
Menggunakan pustaka standar Python `hashlib` dan `hmac` (constant-time comparison).
"""

import hashlib
import hmac
import json
from typing import Dict, Any


def hash_bytes(data: bytes) -> str:
    """Menghitung nilai hash SHA-256 dari data berformat bytes.

    Masukan: data dalam bentuk bytes.
    Keluaran: representasi string heksadesimal 64 karakter (256-bit digest).
    """
    if not isinstance(data, bytes):
        raise TypeError("Masukan harus berupa tipe bytes, bukan string atau tipe lain.")
    
    sha256 = hashlib.sha256()
    sha256.update(data)
    return sha256.hexdigest()


def hash_file(filepath: str, chunk_size: int = 65536) -> str:
    """Menghitung hash SHA-256 dari berkas fisik (foto patok/surat adat).
    
    Membaca berkas per blok (chunk) agar hemat memori saat menangani berkas besar.
    """
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(chunk_size):
            sha256.update(chunk)
    return sha256.hexdigest()


def verify_hash(data: bytes, expected_hash: str) -> bool:
    """Memverifikasi keaslian data terhadap nilai hash yang diharapkan.
    
    Menggunakan hmac.compare_digest untuk mencegah serangan timing (timing attacks).
    """
    if not isinstance(data, bytes):
        raise TypeError("Data harus berupa tipe bytes.")
    if not isinstance(expected_hash, str):
        raise TypeError("Expected hash harus berupa string heksadesimal.")

    calculated = hash_bytes(data)
    # Perbandingan waktu-konstan (constant-time comparison)
    return hmac.compare_digest(calculated.lower(), expected_hash.lower())


def create_document_fingerprint(
    doc_id: str,
    doc_type: str,
    raw_content: bytes,
    marga: str,
    lokasi: str,
    timestamp: str
) -> Dict[str, Any]:
    """Membuat manifes sidik jari dokumen klaim tanah adat.
    
    Menghasilkan metadata terstruktur dengan bukti hash konten asli.
    """
    content_hash = hash_bytes(raw_content)
    
    manifest = {
        "doc_id": doc_id,
        "doc_type": doc_type,
        "marga": marga,
        "lokasi": lokasi,
        "timestamp": timestamp,
        "content_bytes_size": len(raw_content),
        "content_sha256": content_hash,
    }
    
    # Hash dari manifes untuk membuktikan metadata juga tidak dimanipulasi
    manifest_serialized = json.dumps(manifest, sort_keys=True).encode("utf-8")
    manifest["manifest_hash"] = hash_bytes(manifest_serialized)
    
    return manifest
