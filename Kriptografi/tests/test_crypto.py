"""Skenario Pengujian Otomatis Kriptografi TanahKita.

Memenuhi Rubrik K4 (25 Poin):
- Minimal 4 skenario uji otomatis.
- Minimal 3 skenario berhasil.
- Minimal 1 uji negatif atau uji batas dengan hasil spesifik.
- Seluruhnya dapat dijalankan dengan satu perintah (`pytest` atau `python3 -m unittest`).
"""

import unittest
import sys
import os

# Tambahkan src ke sys.path agar impor berjalan mulus
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from hasher import hash_bytes, verify_hash, create_document_fingerprint
from tokens import generate_verification_token, generate_claim_nonce, generate_elder_otp
from chain import LandRecordChain, LandClaimRecord


class TestTanahKitaCrypto(unittest.TestCase):
    """Pengujian Unit Komponen Kriptografi TanahKita."""

    def test_1_sha256_deterministic_and_avalanche(self):
        """Uji Positif: SHA-256 bersifat deterministik dan memiliki efek avalanche."""
        doc1 = b"Surat Kesepakatan Batas Adat Marga Magal - Kali Kopi Timika"
        doc2 = b"Surat Kesepakatan Batas Adat Marga Magal - Kali Kopi Timika"
        doc_modified = b"Surat Kesepakatan Batas Adat Marga Magal - Kali Kopi Timikb"  # beda 1 karakter 'a' -> 'b'

        hash1 = hash_bytes(doc1)
        hash2 = hash_bytes(doc2)
        hash_mod = hash_bytes(doc_modified)

        # Deterministik: masukan sama menghasilkan hash sama
        self.assertEqual(hash1, hash2)
        self.assertEqual(len(hash1), 64)

        # Avalanche effect: beda 1 byte menghasilkan hash yang berubah drastis
        self.assertNotEqual(hash1, hash_mod)

    def test_2_document_tamper_detection_negative(self):
        """Uji Negatif: Manipulasi data 1 byte terdeteksi dan verifikasi mengembalikan False."""
        original_doc = b"Bukti Kepemilikan Ulayat Marga Beanal Luas 15 Hektar"
        expected_hash = hash_bytes(original_doc)

        # Verifikasi data asli harus sukses
        self.assertTrue(verify_hash(original_doc, expected_hash))

        # UJI NEGATIF: Data dipalsukan (15 Hektar diubah jadi 50 Hektar)
        tampered_doc = b"Bukti Kepemilikan Ulayat Marga Beanal Luas 50 Hektar"
        is_valid = verify_hash(tampered_doc, expected_hash)

        # Hasil yang diharapkan spesifik: False
        self.assertFalse(is_valid, "Sistem gagal mendeteksi pemalsuan dokumen klaim tanah!")

    def test_3_csprng_token_uniqueness_and_entropy(self):
        """Uji Positif & Batas: Token verifikasi tetua adat berentropi tinggi dan bebas kolisi."""
        tokens = set()
        num_samples = 200

        for _ in range(num_samples):
            token = generate_verification_token(32)  # 32 bytes = 64 hex chars
            self.assertEqual(len(token), 64)
            tokens.add(token)

        # Tidak boleh ada token ganda yang sama (CSPRNG menjamin keacakan)
        self.assertEqual(len(tokens), num_samples)

        # Uji batas: input num_bytes di bawah batas minimum (16) harus memicu ValueError
        with self.assertRaises(ValueError):
            generate_verification_token(8)

    def test_4_hash_chain_integrity_valid(self):
        """Uji Positif: Rantai riwayat klaim tanah adat terverifikasi utuh dari genesis hingga akhir."""
        chain = LandRecordChain()

        # Tambah entri 1: Pendaftaran awal
        chain.add_record(
            timestamp="2026-10-02T09:00:00Z",
            claim_id="CLM-001",
            marga="Matuan",
            lokasi="Distrik Kuala Kencana, Mimika",
            action="PENDAFTARAN_KLAIM",
            evidence_hash=hash_bytes(b"foto_patok_pohon_gaharu.jpg")
        )

        # Tambah entri 2: Verifikasi tetua adat
        chain.add_record(
            timestamp="2026-10-03T14:30:00Z",
            claim_id="CLM-001",
            marga="Matuan",
            lokasi="Distrik Kuala Kencana, Mimika",
            action="VERIFIKASI_TETUA_ADAT",
            evidence_hash=hash_bytes(b"tanda_tangan_lisan_rekaman_tetua.m4a")
        )

        # Verifikasi keutuhan rantai
        is_valid, msg = chain.verify_integrity()
        self.assertTrue(is_valid)
        self.assertEqual(len(chain.chain), 3)  # Genesis + 2 record

    def test_5_hash_chain_tamper_detection_negative(self):
        """Uji Negatif: Manipulasi data riwayat di tengah rantai menyebabkan verifikasi GAGAL."""
        chain = LandRecordChain()

        chain.add_record(
            timestamp="2026-10-02T10:00:00Z",
            claim_id="CLM-TIMIKA-01",
            marga="Magal",
            lokasi="Kwamki Narama",
            action="PENDAFTARAN",
            evidence_hash="a" * 64
        )
        chain.add_record(
            timestamp="2026-10-03T11:00:00Z",
            claim_id="CLM-TIMIKA-01",
            marga="Magal",
            lokasi="Kwamki Narama",
            action="VERIFIKASI_LEMBAGA",
            evidence_hash="b" * 64
        )

        # Pastikan rantai awalnya valid
        self.assertTrue(chain.verify_integrity()[0])

        # UJI NEGATIF: Admin nakal mengubah nama marga di Blok #1 secara diam-diam
        chain.chain[1].marga = "Pihak_Luar_Tanpa_Hak"

        # Verifikasi rantai harus GAGAL mendeteksi adanya manipulasi
        is_valid, reason = chain.verify_integrity()
        self.assertFalse(is_valid)
        self.assertIn("Integritas gagal di Blok #1", reason)


if __name__ == "__main__":
    unittest.main()
