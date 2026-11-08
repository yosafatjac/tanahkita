"""Skenario Pengujian Otomatis Tugas 2 Kriptografi TanahKita (Tag: v0.2).

Memenuhi Rubrik R2 (100 Poin):
- K2 (30 poin): Integrasi AEAD (AES-256-GCM) dan HMAC-SHA-256 dengan komponen Tugas 1 (`hasher.py`, `chain.py`).
- K3 (15 poin): Kunci CSPRNG di luar repositori (`0600`), pemisahan kunci HKDF-SHA256 per tujuan,
  validasi masukan allowlist (`bool` ditolak pada numerik, kolom asing ditolak), dan gagal tertutup.
- K4 (25 poin): Minimal 4 skenario uji (disediakan 12 skenario lengkap):
  * Uji positif pulang-pergi terintegrasi Tugas 1 -> Tugas 2.
  * Uji negatif modifikasi 1-bit ciphertext (E1), tag (E2), nonce (E3), AAD konteks (E4), dan pemotongan paket (E5).
  * Uji negatif kunci salah dan kunci lintas-tujuan HKDF ditolak dengan `InvalidTag`.
  * Uji bahwa penolakan tidak menimbulkan efek samping pada state rantai/data.
  * Uji sambungan Tugas 1 <-> Tugas 2 (gagal bila keluaran Tugas 1 dirusak/diputus).
  * Uji deteksi Insider Threat (K1 Tugas 1 kini tertutup oleh HMAC-SHA-256).
  * Uji Password Hashing Argon2id + kebijakan NIST SP 800-63B-4.
  * Uji keterbatasan kunci simetris bersama (K2) dengan penanda `xfail`.
"""

import json
import os
import stat
import sys
import tempfile
import unittest
from pathlib import Path

import pytest
from cryptography.exceptions import InvalidTag

# Tambahkan Kriptografi/src ke sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from hasher import hash_bytes
from chain import LandRecordChain
from key_manager import (
    ensure_external_master_key,
    rotate_master_key,
    derive_aead_key,
    derive_hmac_key,
)
from validator import validate_and_normalize_claim_payload
from aead_archive import (
    encrypt_claim_archive,
    decrypt_claim_archive,
    NONCE_LENGTH,
)
from hmac_chain import AuthenticatedLandRecordChain, compute_record_hmac
from password_security import (
    hash_password_argon2id,
    verify_password_argon2id,
)


def flip_one_bit(data: bytes, byte_index: int) -> bytes:
    """Membalik 1 bit pada byte ke-`byte_index` (pola percobaan_minggu05.py)."""
    mutated = bytearray(data)
    mutated[byte_index] ^= 0x01
    return bytes(mutated)


class TestTanahKitaTugas2(unittest.TestCase):
    """Rangkaian 12 Skenario Uji Tugas 2 Kriptografi TanahKita (v0.2)."""

    def setUp(self):
        self.sample_claim = {
            "claim_id": "TK-2026-0001",
            "marga": "Marga Magal",
            "lokasi": "Distrik Tembagapura, Kabupaten Mimika",
            "luas_hektar": 145.5,
            "action": "PENDAFTARAN_KLAIM",
            "timestamp": "2026-11-08T10:00:00Z",
            "catatan_batas": "Utara: Kali Kabur; Selatan: Punggung Bukit Tsinga; Timur: Batu Keramat Amungme.",
        }
        self.sample_doc = (
            b"SURAT PERNYATAAN KESaksian ADAT MARGA MAGAL - LEMBAH NEMANGKAWI TIMIKA 2026"
        )
        # Pastikan kunci induk eksternal di /Volumes/For Apple/.secrets/tanahkita_master.key tersedia
        self.master_key, self.key_path = ensure_external_master_key()
        self.aead_key = derive_aead_key(self.master_key)
        self.hmac_key = derive_hmac_key(self.master_key)

    def test_01_external_key_csprng_and_hkdf_separation(self):
        """Skenario 1 (K3 Positif): Kunci CSPRNG disimpan di luar repo (izin 0600) & dipisah via HKDF."""
        repo_root = Path(__file__).resolve().parents[2]
        # Buktikan file kunci berada di luar repositori
        with self.assertRaises(ValueError):
            self.key_path.relative_to(repo_root)

        self.assertTrue(self.key_path.exists())
        mode = stat.S_IMODE(os.stat(self.key_path).st_mode)
        self.assertEqual(mode, 0o600, "Izin berkas kunci eksternal wajib 0600 (-rw-------)!")

        # Buktikan HKDF menurunkan sub-kunci 32-byte yang berbeda untuk AEAD dan HMAC
        self.assertEqual(len(self.aead_key), 32)
        self.assertEqual(len(self.hmac_key), 32)
        self.assertNotEqual(self.aead_key, self.hmac_key)
        self.assertNotEqual(self.aead_key, self.master_key)

        # Uji rotasi kunci pada berkas sementara di luar repo
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_key_file = Path(tmpdir) / "rotated_master.key"
            k1, _ = ensure_external_master_key(tmp_key_file)
            k2, _ = rotate_master_key(tmp_key_file)
            self.assertEqual(len(k1), 32)
            self.assertEqual(len(k2), 32)
            self.assertNotEqual(k1, k2)

    def test_02_integrated_aead_and_hmac_roundtrip_positive(self):
        """Skenario 2 (K2 & K4 Positif): Alur terintegrasi Tugas 1 -> AEAD AES-256-GCM -> Rantai HMAC."""
        packet = encrypt_claim_archive(
            self.aead_key,
            self.sample_claim,
            self.sample_doc,
        )
        # Paket harus lebih panjang dari nonce (12B) + tag (16B)
        self.assertGreater(len(packet), 28)

        # Dekripsi dan verifikasi ulang manifes sidik jari Tugas 1
        envelope = decrypt_claim_archive(
            self.aead_key,
            packet,
            expected_claim_id="TK-2026-0001",
            expected_marga="Marga Magal",
            expected_lokasi="Distrik Tembagapura, Kabupaten Mimika",
            raw_document_bytes=self.sample_doc,
        )
        self.assertEqual(envelope["claim"]["claim_id"], "TK-2026-0001")
        self.assertEqual(envelope["claim"]["luas_hektar"], 145.5)
        self.assertEqual(
            envelope["fingerprint"]["content_sha256"],
            hash_bytes(self.sample_doc),
        )

        # Masukkan ke dalam rantai riwayat berautentikasi HMAC-SHA-256
        auth_chain = AuthenticatedLandRecordChain(self.hmac_key)
        auth_chain.add_authenticated_record(
            hmac_key=self.hmac_key,
            timestamp=envelope["claim"]["timestamp"],
            claim_id=envelope["claim"]["claim_id"],
            marga=envelope["claim"]["marga"],
            lokasi=envelope["claim"]["lokasi"],
            action=envelope["claim"]["action"],
            evidence_hash=envelope["fingerprint"]["manifest_hash"],
        )
        valid, bad_idx, msg = auth_chain.verify_authenticated_chain(self.hmac_key)
        self.assertTrue(valid, msg)
        self.assertIsNone(bad_idx)

    def test_03_nonce_uniqueness_across_encryptions(self):
        """Skenario 3 (K2 & K4 Positif): Dua enkripsi data & AAD identik menghasilkan nonce & paket berbeda."""
        p1 = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)
        p2 = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)

        nonce1, nonce2 = p1[:NONCE_LENGTH], p2[:NONCE_LENGTH]
        self.assertNotEqual(nonce1, nonce2, "Nonce 96-bit tidak boleh berulang!")
        self.assertNotEqual(p1, p2)

    def test_04_negative_tamper_ciphertext_and_tag_rejected(self):
        """Skenario 4 (K4 Negatif - E1 & E2): Modifikasi 1-bit pada ciphertext atau tag GCM ditolak (InvalidTag)."""
        packet = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)

        # E1: Balik 1 bit di tengah ciphertext (byte ke-20)
        tampered_ct = flip_one_bit(packet, 20)
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.aead_key,
                tampered_ct,
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

        # E2: Balik 1 bit pada byte terakhir tag autentikasi GCM
        tampered_tag = flip_one_bit(packet, len(packet) - 1)
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.aead_key,
                tampered_tag,
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

    def test_05_negative_tamper_nonce_and_truncated_packet(self):
        """Skenario 5 (K4 Negatif - E3 & E5): Modifikasi 1-bit pada nonce atau paket dipotong ditolak."""
        packet = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)

        # E3: Balik 1 bit pada byte pertama nonce (byte ke-0)
        tampered_nonce = flip_one_bit(packet, 0)
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.aead_key,
                tampered_nonce,
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

        # E5: Paket terpotong kurang dari 28 byte
        with self.assertRaises(ValueError):
            decrypt_claim_archive(
                self.aead_key,
                packet[:20],
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

    def test_06_negative_aad_context_swap_rejected(self):
        """Skenario 6 (K4 Negatif - E4): Pertukaran konteks AAD ke klaim/marga lain ditolak (InvalidTag)."""
        packet = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)

        # Penyerang mencoba memakai paket arsip Marga Magal (TK-2026-0001) untuk klaim Marga Beanal (TK-2026-0002)
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.aead_key,
                packet,
                expected_claim_id="TK-2026-0002",
                expected_marga="Marga Beanal",
                expected_lokasi="Distrik Kuala Kencana, Kabupaten Mimika",
            )

    def test_07_negative_wrong_key_and_cross_purpose_key_rejected(self):
        """Skenario 7 (K3 & K4 Negatif): Kunci salah atau pemakaian kunci HMAC untuk AEAD ditolak tanpa efek samping."""
        packet = encrypt_claim_archive(self.aead_key, self.sample_claim, self.sample_doc)
        wrong_key = os.urandom(32)

        # 1. Kunci acak yang salah -> InvalidTag
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                wrong_key,
                packet,
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

        # 2. Kunci turunan HKDF milik HMAC dipakai membuka AEAD -> InvalidTag (bukti pemisahan kunci HKDF)
        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.hmac_key,
                packet,
                "TK-2026-0001",
                "Marga Magal",
                "Distrik Tembagapura, Kabupaten Mimika",
            )

    def test_08_negative_insider_threat_k1_closed_and_no_side_effects(self):
        """Skenario 8 (K2 & K4 Negatif): Insider mengubah data klaim & menghitung ulang SHA-256 tanpa kunci HMAC -> Ditolak."""
        auth_chain = AuthenticatedLandRecordChain(self.hmac_key)
        auth_chain.add_authenticated_record(
            hmac_key=self.hmac_key,
            timestamp="2026-11-08T10:00:00Z",
            claim_id="TK-2026-0001",
            marga="Marga Magal",
            lokasi="Distrik Tembagapura",
            action="PENDAFTARAN_KLAIM",
            evidence_hash=hash_bytes(self.sample_doc),
        )
        auth_chain.add_authenticated_record(
            hmac_key=self.hmac_key,
            timestamp="2026-11-08T12:00:00Z",
            claim_id="TK-2026-0001",
            marga="Marga Magal",
            lokasi="Distrik Tembagapura",
            action="VERIFIKASI_TETUA_ADAT",
            evidence_hash=hash_bytes(b"berita_acara_tetua.pdf"),
        )

        # Salin state sebelum serangan untuk membuktikan verifikasi gagal tidak merusak state
        tags_snapshot = list(auth_chain.tags)

        # Serangan K1 (Insider Threat): Admin nakal mengubah marga pada Blok #1 lalu menghitung ulang SHA-256 rantai dasar
        auth_chain.records[1].marga = "Spekulan_Tanpa_Hak"
        auth_chain.records[1].block_hash = auth_chain.records[1].calculate_hash()
        auth_chain.records[2].previous_hash = auth_chain.records[1].block_hash
        auth_chain.records[2].block_hash = auth_chain.records[2].calculate_hash()

        # Rantai SHA-256 biasa (Tugas 1) akan menganggap ini valid, TETAPI rantai HMAC Tugas 2 MENOLAKNYA di Blok #1!
        valid, failed_index, reason = auth_chain.verify_authenticated_chain(self.hmac_key)
        self.assertFalse(valid)
        self.assertEqual(failed_index, 1)
        self.assertIn("Autentikasi HMAC gagal di Blok #1", reason)
        self.assertEqual(auth_chain.tags, tags_snapshot, "Penolakan tidak boleh menimbulkan efek samping pada daftar tag!")

    def test_09_integration_break_between_tugas1_and_tugas2_detected(self):
        """Skenario 9 (K2 Negatif): Bila sambungan manifes Tugas 1 diputus/dirusak sebelum enkripsi, verifikasi gagal."""
        # Buat amplop manual dengan manifest_hash Tugas 1 yang tidak sinkron (sambungan diputus)
        normalized = validate_and_normalize_claim_payload(self.sample_claim)
        broken_envelope = {
            "schema_version": "0.2",
            "claim": normalized,
            "fingerprint": {
                "doc_id": normalized["claim_id"],
                "doc_type": "SURAT_PERNYATAAN_ULAYAT",
                "marga": normalized["marga"],
                "lokasi": normalized["lokasi"],
                "timestamp": normalized["timestamp"],
                "content_bytes_size": len(self.sample_doc),
                "content_sha256": hash_bytes(self.sample_doc),
                "manifest_hash": "f" * 64,  # Sambungan ke fungsi hash_bytes Tugas 1 diputus
            },
        }
        from validator import canonicalize_json_bytes, build_claim_aad
        from aead_archive import encrypt_bytes_aead

        aad = build_claim_aad(normalized["claim_id"], normalized["marga"], normalized["lokasi"])
        packet = encrypt_bytes_aead(self.aead_key, canonicalize_json_bytes(broken_envelope), aad)

        with self.assertRaises(InvalidTag):
            decrypt_claim_archive(
                self.aead_key,
                packet,
                normalized["claim_id"],
                normalized["marga"],
                normalized["lokasi"],
                raw_document_bytes=self.sample_doc,
            )

    def test_10_allowlist_and_strict_type_validation_negative(self):
        """Skenario 10 (K3 Negatif): Masukan dengan boolean pada kolom numerik atau kolom asing ditolak allowlist."""
        # Kasus 1: {"luas_hektar": True} wajib ditolak (bukan dinormalkan menjadi 1.0)
        bad_bool_claim = dict(self.sample_claim, luas_hektar=True)
        with self.assertRaises(TypeError):
            validate_and_normalize_claim_payload(bad_bool_claim)

        # Kasus 2: Kolom asing di luar allowlist (mis. "is_admin": True) wajib ditolak
        injected_claim = dict(self.sample_claim, is_admin=True)
        with self.assertRaises(ValueError):
            validate_and_normalize_claim_payload(injected_claim)

        # Kasus 3: Aksi di luar allowlist resmi wajib ditolak
        bad_action_claim = dict(self.sample_claim, action="HAPUS_SEMUA_DATABASE")
        with self.assertRaises(ValueError):
            validate_and_normalize_claim_payload(bad_action_claim)

    def test_11_argon2id_password_hashing_and_nist_policy(self):
        """Skenario 11 (K1, K2, K4): Password hashing Argon2id bersalt unik & kebijakan NIST SP 800-63B-4."""
        valid_pass = "LembahNemangkawiAdat2026!"
        h1 = hash_password_argon2id(valid_pass)
        h2 = hash_password_argon2id(valid_pass)

        # Salt acak unik menghasilkan PHC hash berbeda walaupun kata sandi sama
        self.assertNotEqual(h1, h2)
        self.assertTrue(h1.startswith("$argon2id$v=19$m=19456,t=2,p=1$"))

        # Verifikasi kata sandi benar -> True; kata sandi salah -> False (gagal tertutup)
        self.assertTrue(verify_password_argon2id(valid_pass, h1))
        self.assertFalse(verify_password_argon2id("SandiSalahTetapiPanjang2026!", h1))
        self.assertFalse(verify_password_argon2id(valid_pass, "$argon2id$rusak$tidak$valid"))

        # Kata sandi < 15 karakter (faktor tunggal) atau masuk daftar bocor wajib ditolak
        with self.assertRaises(ValueError):
            hash_password_argon2id("Pendek123")
        with self.assertRaises(ValueError):
            hash_password_argon2id("password1234567")

    @pytest.mark.xfail(
        reason="Keterbatasan K2 (Symmetric Shared Key): Pihak yang memegang kunci HMAC yang sama "
               "masih dapat membuat tag sah. Nirsangkal (non-repudiation) membutuhkan Tanda Tangan Digital "
               "Asimetris (Ed25519) pada Tugas 3.",
        strict=True,
    )
    def test_12_limitation_k2_shared_key_holder_forgery_xfail(self):
        """Skenario 12 (Keterbatasan K2 - xfail): Pemegang kunci simetris bersama memalsukan catatan."""
        # Simulasi server yang memegang self.hmac_key mengubah klaim lalu menghitung ulang tag HMAC dengan kunci tersebut
        auth_chain = AuthenticatedLandRecordChain(self.hmac_key)
        auth_chain.add_authenticated_record(
            hmac_key=self.hmac_key,
            timestamp="2026-11-08T10:00:00Z",
            claim_id="TK-2026-0001",
            marga="Marga Magal",
            lokasi="Distrik Tembagapura",
            action="PENDAFTARAN_KLAIM",
            evidence_hash="a" * 64,
        )
        # Pemegang kunci mengubah marga dan menandatangani ulang dengan self.hmac_key yang sama
        auth_chain.records[1].marga = "Diubah_Oleh_Pemegang_Kunci_Server"
        auth_chain.records[1].block_hash = auth_chain.records[1].calculate_hash()
        auth_chain.tags[1] = compute_record_hmac(self.hmac_key, auth_chain.tags[0], auth_chain.records[1])

        valid, _, _ = auth_chain.verify_authenticated_chain(self.hmac_key)
        # Kita mengharapkan sistem idealnya menolak pemalsuan oleh server (valid == False),
        # namun dengan kunci simetris bersama (MAC), ini masih lolos -> tercatat sebagai XFAIL (K2).
        self.assertFalse(valid, "Kunci simetris bersama belum memberikan sifat nirsangkal (non-repudiation).")


if __name__ == "__main__":
    unittest.main()
