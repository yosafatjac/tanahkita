# Komponen Kriptografi Terintegrasi — TanahKita (`v0.1` $\rightarrow$ `v0.2`)

**Produk:** TanahKita (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua — Kabupaten Mimika)  
**Pengembang:** Yosafat Jacobus (NIM: `105224016`)  
**Mata Kuliah:** Kriptografi (`052357` — Kelas CS5-2026) — Tugas 1 (`v0.1`) & Tugas 2 (`v0.2`)  
**Dokumen Keputusan Desain:** Lihat **[`KEPUTUSAN.md`](./KEPUTUSAN.md)** untuk pemetaan lengkap `Kebutuhan → Mekanisme → Alasan`, perbandingan Hash vs MAC vs AEAD vs Password Hashing, dan analisis risiko penyalahgunaan parameter.

---

## 1. Deskripsi Produk dan Perkembangan Komponen (`v0.1` ke `v0.2`)

**TanahKita** dirancang untuk mencatat dan melindungi bukti penguasaan tanah ulayat bagi masyarakat adat di Papua (khususnya wilayah Timika/Kabupaten Mimika) yang belum bersertifikat BPN. Sistem ini **bukan pengganti sertifikat resmi BPN**, melainkan sarana dokumentasi pembuktian digital (*tamper-evident & authenticated evidence ledger*) yang mencegah pemalsuan dan perubahan sepihak atas batas adat lisan.

### Perkembangan dari Tugas 1 (`v0.1`) ke Tugas 2 (`v0.2`):
1. **Tugas 1 (`v0.1` — Fondasi Integritas & CSPRNG):**
   - Sidik jari berkas bukti fisik dengan `SHA-256` (`src/hasher.py`).
   - Rantai riwayat klaim tanah berantai `SHA-256` (`src/chain.py`).
   - Pembangkitan token verifikasi & OTP tetua adat dengan CSPRNG `secrets` (`src/tokens.py`).
2. **Tugas 2 (`v0.2` — Integrasi AEAD, HMAC, Pemisahan Kunci HKDF, Allowlist, & Argon2id):**
   - **Manajemen Kunci CSPRNG di Luar Repositori & Pemisahan Kunci `HKDF-SHA256` (`src/key_manager.py`):** Kunci induk 256-bit (32 byte) dibangkitkan dengan `secrets.token_bytes(32)`, disimpan di luar repositori Git (`/Volumes/For Apple/.secrets/tanahkita_master.key`, izin `0600`), dan diturunkan menggunakan `HKDF-SHA256` (RFC 5869) menjadi sub-kunci terpisah untuk AEAD (`info=b"tanahkita:v0.2:aead-arsip-aes256gcm"`) dan HMAC (`info=b"tanahkita:v0.2:hmac-rantai-sha256"`).
   - **Validasi Masukan Allowlist & Normalisasi Kanonis (`src/validator.py`):** Menolak kolom asing, menolak nilai `bool` pada kolom numerik (`isinstance(v, bool)`), dan menormalisasi string Unicode NFC sebelum diserialisasi ke JSON kanonis.
   - **Enkripsi Terautentikasi Arsip Klaim dengan `AES-256-GCM` (`src/aead_archive.py`):** Membungkus klaim tanah adat beserta manifes sidik jari Tugas 1 (`create_document_fingerprint`) menggunakan `AESGCM` (nonce acak 12 byte `os.urandom(12)`, tag 16 byte, dan AAD konteks `claim_id|marga|lokasi`) yang gagal tertutup (*fail-closed*).
   - **Rantai Riwayat Berautentikasi `HMAC-SHA-256` (`src/hmac_chain.py`):** Menghubungkan `LandRecordChain` Tugas 1 dengan tag `HMAC-SHA-256` dan `hmac.compare_digest` untuk menutup celah *Insider Threat* (`K1` / `RSK-01`: admin database mengubah batas lalu menghitung ulang SHA-256 tanpa kunci).
   - **Keamanan Kata Sandi `Argon2id` (`src/password_security.py`):** Menyimpan dan memverifikasi kata sandi/PIN dengan `Argon2id` (RFC 9106: $m=19456\text{ KiB}, t=2, p=1$, salt CSPRNG 16 byte) dan kebijakan **NIST SP 800-63B-4** (minimal 15 karakter untuk faktor tunggal + pemeriksaan daftar kata sandi bocor).

---

## 2. Struktur Direktori Modul Kriptografi (`v0.2`)

```text
Kriptografi/
├── KEPUTUSAN.md               <-- [BARU v0.2] Kebutuhan -> Mekanisme -> Alasan & Analisis Parameter
├── README.md                  <-- Dokumentasi teknis, parameter, dan hasil pengujian v0.1 & v0.2
├── src/
│   ├── __init__.py            <-- Ekspor terpadu komponen Tugas 1 & Tugas 2
│   ├── hasher.py              <-- [Tugas 1] SHA-256 bytes, berkas chunked, & manifes sidik jari
│   ├── chain.py               <-- [Tugas 1] Struktur blok LandClaimRecord & LandRecordChain
│   ├── tokens.py              <-- [Tugas 1] Pembangkit token CSPRNG & OTP bebas modulo-bias
│   ├── key_manager.py         <-- [Tugas 2] Master key CSPRNG luar repo (0600), rotasi, & HKDF-SHA256
│   ├── validator.py           <-- [Tugas 2] Validasi allowlist ketat, normalisasi NFC, JSON kanonis
│   ├── aead_archive.py        <-- [Tugas 2] Enkripsi arsip klaim AES-256-GCM + AAD terhubung Tugas 1
│   ├── hmac_chain.py          <-- [Tugas 2] Rantai klaim berautentikasi HMAC-SHA-256 + compare_digest
│   └── password_security.py   <-- [Tugas 2] Password hashing Argon2id (PHC) & kebijakan NIST 800-63B-4
└── tests/
    ├── test_crypto.py         <-- [Tugas 1] 5 skenario uji regresi komponen dasar (tetap lulus)
    └── test_tugas2.py         <-- [Tugas 2] 12 skenario uji otomatis AEAD, HMAC, HKDF, Allowlist, Argon2id
```

---

## 3. Penanganan Kunci di Luar Repositori & Cara Menjalankan (Kriteria K2 & K3)

### A. Lokasi dan Izin Berkas Kunci Induk
Kunci induk **tidak pernah disimpan di dalam kode sumber maupun di dalam folder repositori `tanahkita`**. Secara bawaan, modul `key_manager.py` menyimpan dan membaca kunci induk 256-bit dari lokasi eksternal di SSD:
```text
/Volumes/For Apple/.secrets/tanahkita_master.key   (izin POSIX: 0600 / -rw-------)
```
Atau dapat diarahkan ke lokasi eksternal lain melalui variabel lingkungan `TANAHKITA_MASTER_KEY_FILE`. Fungsi `get_external_key_path()` secara otomatis memeriksa `path.relative_to(repo_root)` dan melempar `PermissionError` apabila path kunci berada di dalam direktori repositori.

### B. Petunjuk Menjalankan Pengujian Otomatis (`pytest` & `unittest`)

Jalankan seluruh 17 skenario pengujian otomatis (5 skenario Tugas 1 + 12 skenario Tugas 2) dari root repositori `tanahkita`:

```bash
# Menggunakan pytest (direkomendasikan):
"/Volumes/For Apple/Tugas & Kuliah (Sept - Okt 2026)/4_Kriptografi_&_Cybersecurity/Phyton/kripto-105224016-pesanrahasia/.venv/bin/python" -m pytest Kriptografi/tests -v

# Atau menggunakan npm script dari root repositori:
npm run test:crypto
```

### C. Bukti Keluaran Eksekusi Terminal (`pytest -v`):

```text
============================= test session starts ==============================
platform darwin -- Python 3.9.6, pytest-8.4.2, pluggy-1.6.0
collected 17 items

Kriptografi/tests/test_crypto.py::TestTanahKitaCrypto::test_1_sha256_deterministic_and_avalanche PASSED [  5%]
Kriptografi/tests/test_crypto.py::TestTanahKitaCrypto::test_2_document_tamper_detection_negative PASSED [ 11%]
Kriptografi/tests/test_crypto.py::TestTanahKitaCrypto::test_3_csprng_token_uniqueness_and_entropy PASSED [ 17%]
Kriptografi/tests/test_crypto.py::TestTanahKitaCrypto::test_4_hash_chain_integrity_valid PASSED [ 23%]
Kriptografi/tests/test_crypto.py::TestTanahKitaCrypto::test_5_hash_chain_tamper_detection_negative PASSED [ 29%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_01_external_key_csprng_and_hkdf_separation PASSED [ 35%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_02_integrated_aead_and_hmac_roundtrip_positive PASSED [ 41%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_03_nonce_uniqueness_across_encryptions PASSED [ 47%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_04_negative_tamper_ciphertext_and_tag_rejected PASSED [ 52%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_05_negative_tamper_nonce_and_truncated_packet PASSED [ 58%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_06_negative_aad_context_swap_rejected PASSED [ 64%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_07_negative_wrong_key_and_cross_purpose_key_rejected PASSED [ 70%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_08_negative_insider_threat_k1_closed_and_no_side_effects PASSED [ 76%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_09_integration_break_between_tugas1_and_tugas2_detected PASSED [ 82%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_10_allowlist_and_strict_type_validation_negative PASSED [ 88%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_11_argon2id_password_hashing_and_nist_policy PASSED [ 94%]
Kriptografi/tests/test_tugas2.py::TestTanahKitaTugas2::test_12_limitation_k2_shared_key_holder_forgery_xfail XFAIL [100%]

======================== 16 passed, 1 xfailed in 0.20s =========================
```

---

## 4. Tabel Skenario Uji dan Respons Kondisi Tidak Sah (Kriteria K4)

| Kode Uji | Nama Fungsi Uji (`test_tugas2.py`) | Jenis Uji | Masukan & Kondisi yang Diuji | Respons / Galat yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| **T2-01** | `test_01_external_key_csprng_and_hkdf_separation` | Positif & Batas | Pembangkitan kunci induk di luar repo, pemeriksaan mode `0600`, penurunan sub-kunci HKDF AEAD vs HMAC, dan rotasi kunci | Berkas kunci di luar repo dengan mode `0o600`; `aead_key != hmac_key` (masing-masing 32 byte) | Lokasi luar repo terverifikasi (`0o600`), sub-kunci HKDF terpisah sempurna | **PASSED** |
| **T2-02** | `test_02_integrated_aead_and_hmac_roundtrip_positive` | Positif Terintegrasi | Klaim Marga Magal (`TK-2026-0001`) + dokumen surat adat melewati `validator` $\rightarrow$ `hasher` (T1) $\rightarrow$ `AES-256-GCM` $\rightarrow$ `HMAC-SHA-256` chain | Dekripsi mengembalikan klaim & manifes utuh; verifikasi rantai HMAC mengembalikan `(True, None)` | Data klaim, digest SHA-256 Tugas 1, dan tag rantai HMAC cocok 100% | **PASSED** |
| **T2-03** | `test_03_nonce_uniqueness_across_encryptions` | Positif Parameter | Enkripsi dua kali atas *plaintext* dan *AAD* klaim yang identik | Menghasilkan 2 nonce 12-byte berbeda dan 2 paket ciphertext berbeda | `nonce1 != nonce2` dan `p1 != p2` | **PASSED** |
| **T2-04** | `test_04_negative_tamper_ciphertext_and_tag_rejected` | **Negatif (`E1` & `E2`)** | Membalik 1 bit pada byte ke-20 ciphertext (`E1`) dan 1 bit pada byte terakhir tag GCM (`E2`) | Ditolak secara *fail-closed* dengan exception `cryptography.exceptions.InvalidTag` tanpa mengeluarkan plaintext | Keduanya langsung melempar `InvalidTag` | **PASSED** |
| **T2-05** | `test_05_negative_tamper_nonce_and_truncated_packet` | **Negatif (`E3` & `E5`)** | Membalik 1 bit pada byte pertama nonce (`E3`) dan memotong paket menjadi 20 byte (`< 28` byte minimum, `E5`) | Nonce berubah melempar `InvalidTag`; paket terpotong melempar `ValueError` sebelum dekripsi | `InvalidTag` pada `E3` dan `ValueError` pada `E5` | **PASSED** |
| **T2-06** | `test_06_negative_aad_context_swap_rejected` | **Negatif (`E4` — AAD)** | Mencoba membuka paket arsip Marga Magal (`TK-2026-0001`) menggunakan konteks AAD klaim Marga Beanal (`TK-2026-0002`) | Ditolak secara *fail-closed* dengan `InvalidTag` karena AAD tidak cocok | Melempar `InvalidTag` | **PASSED** |
| **T2-07** | `test_07_negative_wrong_key_and_cross_purpose_key_rejected` | **Negatif Kunci** | Membuka paket AEAD dengan kunci acak salah dan dengan sub-kunci `hmac_key` (uji pemisahan kunci HKDF) | Keduanya ditolak dengan `InvalidTag` | Keduanya melempar `InvalidTag` | **PASSED** |
| **T2-08** | `test_08_negative_insider_threat_k1_closed_and_no_side_effects` | **Negatif Rantai HMAC** | Admin nakal mengubah `marga` di Blok #1 lalu menghitung ulang seluruh SHA-256 tanpa kunci HMAC | Verifikasi mengembalikan `(False, 1, "Autentikasi HMAC gagal di Blok #1...")` dan daftar tag tidak berubah (tanpa efek samping) | Terdeteksi tepat di indeks `1`; state `tags` tetap utuh | **PASSED** |
| **T2-09** | `test_09_integration_break_between_tugas1_and_tugas2_detected` | **Negatif Sambungan T1–T2** | Mengenkripsi amplop yang `manifest_hash` Tugas 1-nya diputus/diubah sebelum masuk ke AEAD | Saat dibuka, pemeriksaan silang `verify_hash` Tugas 1 mendeteksi ketidakcocokan dan melempar `InvalidTag` | Melempar `InvalidTag` | **PASSED** |
| **T2-10** | `test_10_allowlist_and_strict_type_validation_negative` | **Negatif Allowlist** | Mengirim `{"luas_hektar": True}` (`bool`), kolom asing `{"is_admin": True}`, dan aksi di luar daftar resmi | `bool` ditolak dengan `TypeError`; kolom/aksi asing ditolak dengan `ValueError` | Seluruh masukan tidak sah ditolak sebelum menyentuh fungsi kriptografi | **PASSED** |
| **T2-11** | `test_11_argon2id_password_hashing_and_nist_policy` | Positif & Negatif Sandi | Hash & verifikasi sandi `Argon2id`, uji sandi salah, PHC rusak, sandi $< 15$ karakter, dan sandi di daftar bocor | Sandi sah `True`; sandi salah/rusak `False` (*fail-closed*); sandi pendek/bocor melempar `ValueError` | Sesuai harapan 100% | **PASSED** |
| **T2-12** | `test_12_limitation_k2_shared_key_holder_forgery_xfail` | **Batas Desain (`XFAIL`)** | Pemegang kunci simetris HMAC di server mengubah blok dan menandatangani ulang dengan kunci yang sama | Mendokumentasikan keterbatasan `K2` (kunci bersama belum memberi sifat nirsangkal; diselesaikan dengan Ed25519 di Tugas 3) | Tercatat sebagai `XFAIL (strict=True)` | **XFAIL** |
