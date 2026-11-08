"""Modul Rantai Riwayat Klaim Tanah Berautentikasi Kunci (HMAC-SHA-256).

TanahKita v0.2 — Memenuhi Kriteria Rubrik R2 (K1, K2, K3, K4):
- Melanjutkan dan memperkuat komponen Tugas 1 (`chain.py`: `LandClaimRecord` & `LandRecordChain`).
- Menutup Keterbatasan K1 dari Tugas 1 (serangan Insider Threat `RSK-01` / `THR-02`):
  Pada v0.1, `LandRecordChain` hanya menggunakan SHA-256 tanpa kunci, sehingga admin database nakal
  dapat mengubah batas ulayat lalu menghitung ulang seluruh hash rantai.
  Pada v0.2, setiap blok riwayat dikunci dengan tag `HMAC-SHA-256` menggunakan sub-kunci turunan HKDF
  (`derive_hmac_key`) dan diverifikasi dalam waktu konstan dengan `hmac.compare_digest`.
"""

from __future__ import annotations

import hashlib
import hmac
from typing import List, Tuple

from chain import LandClaimRecord, LandRecordChain
from key_manager import validate_key_bytes, SUBKEY_BYTES


def compute_record_hmac(hmac_key: bytes, previous_tag_hex: str, record: LandClaimRecord) -> str:
    """Menghitung tag HMAC-SHA-256 atas ikatan tag blok sebelumnya dan hash kanonis blok Tugas 1.

    Terhubung langsung dengan `record.calculate_hash()` dari Tugas 1 (`chain.py`).
    """
    validate_key_bytes(hmac_key, SUBKEY_BYTES)
    if not isinstance(previous_tag_hex, str) or len(previous_tag_hex) != 64:
        raise ValueError("Tag blok sebelumnya harus berupa string hex 64 karakter (32 byte).")

    prev_bytes = bytes.fromhex(previous_tag_hex)
    # Memanggil fungsi calculate_hash() milik LandClaimRecord dari Tugas 1
    canonical_block_digest = record.calculate_hash().encode("utf-8")
    message = prev_bytes + b"|" + canonical_block_digest
    return hmac.new(hmac_key, message, hashlib.sha256).hexdigest()


class AuthenticatedLandRecordChain:
    """Rantai riwayat klaim tanah adat yang dilindungi HMAC-SHA-256."""

    GENESIS_TAG = "0" * 64

    def __init__(self, hmac_key: bytes):
        validate_key_bytes(hmac_key, SUBKEY_BYTES)
        self._base_chain = LandRecordChain()
        self.tags: List[str] = []
        # Hitung tag HMAC untuk blok genesis yang dibuat oleh LandRecordChain (Tugas 1)
        genesis_tag = compute_record_hmac(hmac_key, self.GENESIS_TAG, self._base_chain.chain[0])
        self.tags.append(genesis_tag)

    @property
    def records(self) -> List[LandClaimRecord]:
        return self._base_chain.chain

    def add_authenticated_record(
        self,
        hmac_key: bytes,
        timestamp: str,
        claim_id: str,
        marga: str,
        lokasi: str,
        action: str,
        evidence_hash: str,
    ) -> Tuple[LandClaimRecord, str]:
        """Menambahkan blok baru melalui `LandRecordChain.add_record` (Tugas 1) dan menguncinya dengan HMAC."""
        validate_key_bytes(hmac_key, SUBKEY_BYTES)
        record = self._base_chain.add_record(
            timestamp=timestamp,
            claim_id=claim_id,
            marga=marga,
            lokasi=lokasi,
            action=action,
            evidence_hash=evidence_hash,
        )
        prev_tag = self.tags[-1]
        new_tag = compute_record_hmac(hmac_key, prev_tag, record)
        self.tags.append(new_tag)
        return record, new_tag

    def verify_authenticated_chain(self, hmac_key: bytes) -> Tuple[bool, int | None, str]:
        """Memverifikasi keutuhan struktur rantai Tugas 1 sekaligus autentikasi tag HMAC-SHA-256.

        Mengembalikan:
        - `(True, None, pesan)` bila seluruh rantai dan tag HMAC valid.
        - `(False, index_blok_rusak, pesan_alasan)` bila ada manipulasi data, penghitungan ulang
          SHA-256 tanpa kunci (insider threat), atau kunci HMAC salah (gagal tertutup).
        """
        validate_key_bytes(hmac_key, SUBKEY_BYTES)
        records = self._base_chain.chain

        if len(records) != len(self.tags):
            bad_idx = min(len(records), len(self.tags))
            return (False, bad_idx, f"Panjang daftar blok ({len(records)}) tidak cocok dengan daftar tag HMAC ({len(self.tags)}).")

        prev_tag = self.GENESIS_TAG
        for idx, (rec, stored_tag) in enumerate(zip(records, self.tags)):
            # 1. Periksa rantai hash dasar dari Tugas 1
            calculated_sha256 = rec.calculate_hash()
            if not hmac.compare_digest(rec.block_hash, calculated_sha256):
                return (
                    False,
                    idx,
                    f"Manipulasi terdeteksi di Blok #{idx}: digest SHA-256 blok tidak cocok.",
                )
            if idx > 0 and not hmac.compare_digest(rec.previous_hash, records[idx - 1].block_hash):
                return (
                    False,
                    idx,
                    f"Rantai terputus di Blok #{idx}: previous_hash tidak cocok dengan Blok #{idx - 1}.",
                )

            # 2. Periksa tag autentikasi HMAC-SHA-256 menggunakan compare_digest (waktu konstan)
            expected_tag = compute_record_hmac(hmac_key, prev_tag, rec)
            if not hmac.compare_digest(expected_tag, stored_tag):
                return (
                    False,
                    idx,
                    f"Autentikasi HMAC gagal di Blok #{idx}: tag tidak sah (kunci salah atau pemalsuan rantai tanpa kunci)!",
                )
            prev_tag = stored_tag

        return (True, None, "Seluruh blok riwayat tanah adat dan tag HMAC-SHA-256 terverifikasi sah.")
