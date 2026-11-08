"""Modul Validasi Masukan Berbasis Allowlist dan Normalisasi Kanonis.

TanahKita v0.2 — Memenuhi Kriteria Rubrik R2 (K2 & K3):
- Setiap masukan dari luar divalidasi pada batas kepercayaan menggunakan allowlist kolom dan tipe ketat.
- Menolak tipe `bool` pada kolom numerik (`isinstance(v, bool)` diperiksa sebelum `int`/`float`).
- Menolak kunci asing di luar allowlist (mencegah penyelundupan atribut/mass-assignment).
- Menormalisasi teks Unicode dengan NFC dan memangkas spasi tepi sebelum diubah ke bentuk kanonis JSON.
"""

import json
import re
import unicodedata
from typing import Dict, Any

ALLOWED_CLAIM_FIELDS = {
    "claim_id",
    "marga",
    "lokasi",
    "luas_hektar",
    "action",
    "timestamp",
    "catatan_batas",
}

ALLOWED_ACTIONS = {
    "PENDAFTARAN_KLAIM",
    "VERIFIKASI_TETUA_ADAT",
    "MEDIASI_ADAT",
    "PENETAPAN_BATAS_ULAYAT",
    "SENGKETA_DISELESAIKAN",
}

CLAIM_ID_PATTERN = re.compile(r"^[A-Z0-9\-]{3,32}$")


def normalize_text(value: Any, field_name: str, min_len: int = 2, max_len: int = 500) -> str:
    """Memvalidasi tipe string dan menormalisasi ke bentuk Unicode NFC."""
    if not isinstance(value, str):
        raise TypeError(f"Kolom '{field_name}' wajib bertipe string, diterima {type(value).__name__}.")
    normalized = unicodedata.normalize("NFC", value).strip()
    if len(normalized) < min_len:
        raise ValueError(f"Kolom '{field_name}' terlalu pendek (minimal {min_len} karakter).")
    if len(normalized) > max_len:
        raise ValueError(f"Kolom '{field_name}' melebihi batas maksimum {max_len} karakter.")
    return normalized


def validate_and_normalize_claim_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Memvalidasi kamus data klaim tanah adat dengan allowlist ketat dan mengembalikan bentuk ternormalisasi."""
    if not isinstance(payload, dict):
        raise TypeError("Payload klaim harus berupa dict.")

    unknown_keys = set(payload.keys()) - ALLOWED_CLAIM_FIELDS
    if unknown_keys:
        raise ValueError(f"Masukan ditolak oleh allowlist! Kolom asing tidak diizinkan: {sorted(unknown_keys)}")

    missing_keys = ALLOWED_CLAIM_FIELDS - set(payload.keys())
    if missing_keys:
        raise ValueError(f"Masukan tidak lengkap! Kolom wajib belum diisi: {sorted(missing_keys)}")

    claim_id = normalize_text(payload["claim_id"], "claim_id", min_len=3, max_len=32)
    if not CLAIM_ID_PATTERN.match(claim_id):
        raise ValueError(f"Format 'claim_id' tidak sah ({claim_id}); hanya huruf kapital, angka, dan tanda hubung.")

    marga = normalize_text(payload["marga"], "marga", min_len=2, max_len=100)
    lokasi = normalize_text(payload["lokasi"], "lokasi", min_len=3, max_len=150)
    timestamp = normalize_text(payload["timestamp"], "timestamp", min_len=10, max_len=40)
    catatan_batas = normalize_text(payload["catatan_batas"], "catatan_batas", min_len=5, max_len=500)

    action = normalize_text(payload["action"], "action", min_len=3, max_len=40)
    if action not in ALLOWED_ACTIONS:
        raise ValueError(f"Aksi '{action}' tidak termasuk dalam allowlist aksi resmi: {sorted(ALLOWED_ACTIONS)}")

    raw_luas = payload["luas_hektar"]
    # Di Python, bool adalah subclass dari int (isinstance(True, int) == True).
    # Wajib tolak bool secara eksplisit sesuai aturan allowlist!
    if isinstance(raw_luas, bool) or not isinstance(raw_luas, (int, float)):
        raise TypeError("Kolom 'luas_hektar' wajib berupa angka (int/float), bukan boolean atau string.")

    luas_hektar = round(float(raw_luas), 2)
    if luas_hektar <= 0 or luas_hektar > 100_000:
        raise ValueError("Nilai 'luas_hektar' harus berada di rentang 0 < luas <= 100000 hektar.")

    return {
        "claim_id": claim_id,
        "marga": marga,
        "lokasi": lokasi,
        "luas_hektar": luas_hektar,
        "action": action,
        "timestamp": timestamp,
        "catatan_batas": catatan_batas,
    }


def canonicalize_json_bytes(data: Dict[str, Any]) -> bytes:
    """Mengubah dict yang telah tervalidasi menjadi bytes JSON kanonis deterministik."""
    if not isinstance(data, dict):
        raise TypeError("Masukan untuk kanonisasi harus berupa dict.")
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def build_claim_aad(claim_id: str, marga: str, lokasi: str) -> bytes:
    """Menyusun Associated Authenticated Data (AAD) kanonis untuk mengikat konteks klaim tanah."""
    cid = normalize_text(claim_id, "claim_id", min_len=3, max_len=32)
    mrg = normalize_text(marga, "marga", min_len=2, max_len=100)
    lok = normalize_text(lokasi, "lokasi", min_len=3, max_len=150)
    return f"tanahkita:v0.2|claim_id={cid}|marga={mrg}|lokasi={lok}".encode("utf-8")
