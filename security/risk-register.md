# Register Risiko dan Rencana Kontrol (Risk Register) — TanahKita

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 1  
**Milestone Tag:** `sec-0.1`  

---

## 1. Metodologi Penilaian Risiko

Tingkat risiko dihitung berdasarkan matriks:
$$\text{Skor Risiko} = \text{Kemungkinan (Likelihood: 1--5)} \times \text{Dampak (Impact: 1--5)}$$

* **Kemungkinan (Likelihood):** 1 (Sangat Jarang), 2 (Jarang), 3 (Mungkin), 4 (Sering), 5 (Sangat Sering/Pasti Terjadi).
* **Dampak (Impact):** 1 (Tidak Signifikan), 2 (Kecil), 3 (Sedang), 4 (Besar), 5 (Bencana/Fatal).
* **Tingkat Risiko:** 
  * $\ge 15$: **Tinggi (High)**
  * $8 - 14$: **Sedang (Medium)**
  * $\le 7$: **Rendah (Low)**

---

## 2. Lima Risiko Prioritas Berdasarkan Kondisi Produk

| ID Risiko | Ancaman Terkait | Kemungkinan (L) | Alasan Kemungkinan Berdasarkan Kondisi Produk | Dampak (I) | Alasan Dampak Berdasarkan Kondisi Produk | Skor Risiko | Tingkat Risiko |
| :---: | :---: | :---: | :--- | :---: | :--- | :---: | :---: |
| **RSK-01** | `THR-02`: Manipulasi Batas oleh Admin Nakal (*Tampering*) | **4** | Tekanan ekonomi sengketa tanah tinggi; admin sistem memegang akses langsung ke server database tanpa pengawasan harian. | **5** | Mengubah batas ulayat merugikan hak tanah komunal masyarakat adat Papua dan memicu konflik fisik antarsuku di lapangan. | **20** | **Tinggi** |
| **RSK-02** | `THR-01`: Penyamaran sebagai Tetua Adat (*Spoofing*) | **3** | Literasi digital tetua adat di pedalaman bervariasi; perangkat ponsel pintar rawan dipinjamkan atau token verifikasi dibagikan via chat lisan. | **5** | Pengesahan tanah ulayat oleh pihak palsu menghancurkan legitimasi hukum seluruh sistem TanahKita. | **15** | **Tinggi** |
| **RSK-03** | `THR-08`: Eskalasi Hak Akses Pemohon ke Verifikator (*Privilege Escalation*) | **4** | Aplikasi web tahap awal rentan terhadap kelemahan otorisasi berbasis peran (BOLA/IDOR) pada endpoint API verifikasi klaim. | **4** | Pemohon dapat memvalidasi tanah miliknya sendiri tanpa melalui musyawarah adat yang sah. | **16** | **Tinggi** |
| **RSK-04** | `THR-07`: Serangan DoS Lewat Unggahan Berkas (*Denial of Service*) | **4** | Infrastruktur server mandiri mahasiswa memiliki bandwidth dan kuota disk terbatas; formulir menerima unggahan berkas gambar/PDF. | **3** | Layanan lumpuh saat masyarakat adat sedang membutuhkan akses dokumen pembuktian saat mediasi berlangsung. | **12** | **Sedang** |
| **RSK-05** | `THR-05`: Penyadapan Kredensial di Jaringan Publik (*Information Disclosure*) | **3** | Banyak warga mengakses internet lewat Wi-Fi publik desa atau jaringan seluler terbuka tanpa enkripsi transport lapis tambahan. | **4** | Akun pendaftar diretas dan digunakan untuk mendaftarkan klaim sengketa provokatif. | **12** | **Sedang** |

---

## 3. Rencana Kontrol Penurunan Risiko dan Pemetaan Tugas

Setiap risiko prioritas dilengkapi rencana kontrol teknis yang dirancang untuk menurunkan kemungkinan (*likelihood*) atau dampak (*impact*), serta dipetakan ke target pengerjaan **Tugas 2** atau **Tugas 3**:

```mermaid
flowchart LR
    RSK01["RSK-01: Manipulasi Batas (Skor 20)"] --> CTL01["Kontrol: Append-only DB, Head Hash di Luar Server, Log Audit"] --> TUGAS2["Dipetakan ke: Tugas 2 (System Hardening)"]
    RSK02["RSK-02: Spoofing Tetua Adat (Skor 15)"] --> CTL02["Kontrol: MFA/OTP Kripto via secrets module"] --> TUGAS2
    RSK03["RSK-03: Eskalasi Wewenang (Skor 16)"] --> CTL03["Kontrol: RBAC Ketat di Sisi Server API"] --> TUGAS2
    RSK04["RSK-04: DoS Unggahan Berkas (Skor 12)"] --> CTL04["Kontrol: Rate Limiting & Pembatas Ukuran Max 5MB"] --> TUGAS3["Dipetakan ke: Tugas 3 (Firewall & TLS)"]
    RSK05["RSK-05: Penyadapan Jaringan (Skor 12)"] --> CTL05["Kontrol: TLS 1.3 Strict & HSTS Header"] --> TUGAS3
```

### Rincian Rencana Kontrol:

1. **Kontrol untuk RSK-01 (Manipulasi Batas):**
   * *Kondisi saat ini (`v0.1`):* Hash-chain (`chain.py`) sudah mendeteksi perubahan pada sebagian blok. Namun admin yang punya akses tulis penuh ke `D2` masih bisa menghitung ulang **seluruh** rantai sehingga tetap tampak valid.
   * *Tindakan Kontrol:* (a) mencabut hak `UPDATE`/`DELETE` pada tabel riwayat sehingga hanya bisa *append*; (b) mencatat *head hash* terbaru secara berkala di luar server (misal dibagikan ke tetua adat/pendamping hukum) agar rantai hasil hitung ulang ketahuan; (c) memisahkan akun admin server dari akun pengelola data; (d) log audit append-only (`D4`) untuk setiap aksi admin.
   * *Hasil:* Kemungkinan turun dari 4 menjadi 2 karena manipulasi butuh kolusi beberapa pihak dan meninggalkan jejak.
   * *Target:* **Tugas 2 (Kontrol Akses dan System Hardening)**.

2. **Kontrol untuk RSK-02 (Spoofing Tetua Adat):**
   * *Tindakan Kontrol:* Pembangkitan token verifikasi menggunakan CSPRNG (`secrets.token_hex(32)`) dengan masa kedaluwarsa 15 menit dan verifikasi ganda OTP numerik langsung ke nomor verifikator terdaftar.
   * *Hasil:* Kemungkinan penyerang menebak token menjadi $1 : 2^{256}$ (praktis mustahil).
   * *Target:* **Tugas 2 (Autentikasi & Kontrol Akses)**.

3. **Kontrol untuk RSK-03 (Eskalasi Hak Akses):**
   * *Tindakan Kontrol:* Menerapkan *Role-Based Access Control* (RBAC) ketat di level API server. Setiap permintaan aksi verifikasi memvalidasi klaim sesi JWT dan status peran dari basis data, bukan dari parameter masukan pengguna.
   * *Hasil:* Kemungkinan eskalasi hak akses turun dari 4 menjadi 1.
   * *Target:* **Tugas 2 (Kontrol Akses)**.

4. **Kontrol untuk RSK-04 (Denial of Service Berkas):**
   * *Tindakan Kontrol:* Membatasi ukuran unggahan berkas maksimal 5 MB per berkas, validasi *magic bytes* berkas (hanya PDF/JPG/PNG), dan menerapkan *rate limiting* maksimal 5 unggahan per menit per IP.
   * *Hasil:* Kemungkinan kehabisan kapasitas disk turun dari 4 menjadi 1.
   * *Target:* **Tugas 3 (Firewall, WAF, dan Segmentasi)**.

5. **Kontrol untuk RSK-05 (Penyadapan Jaringan Publik):**
   * *Tindakan Kontrol:* Menerapkan protokol TLS 1.3 wajib, penolakan koneksi HTTP murni melalui pengalihan otomatis 301 ke HTTPS, serta penyematan *header* `Strict-Transport-Security` (HSTS).
   * *Hasil:* Peluang intersepsi jaringan turun dari 3 menjadi 1.
   * *Target:* **Tugas 3 (Keamanan Jaringan dan TLS)**.

---

## 4. Matriks Keterlacakan Realisasi Kontrol Tugas 2 (`sec-0.2` & `v0.2`)

Seluruh rencana kontrol yang dipetakan ke **Tugas 2** pada bagian di atas telah direalisasikan dan diverifikasi secara penuh pada rilis tag **`sec-0.2`** dan **`v0.2`**:

| ID Risiko | Ancaman (`threat-model.md`) | Skor Awal | Kontrol Teknis yang Diimplementasikan di Tugas 2 (`sec-0.2` / `v0.2`) | Berkas Bukti & Pengujian | Skor Residual |
| :---: | :---: | :---: | :--- | :--- | :---: |
| **`RSK-01`** | `THR-02`: Manipulasi Batas oleh Admin Nakal (*Tampering*) | **20 (Tinggi)** | 1) Peningkatan *hash-chain* menjadi **`HMAC-SHA-256`** (`AuthenticatedLandRecordChain`) dengan kunci rahasia terpisah di luar DB (`HKDF-SHA256`, `0600`).<br>2) Pencabutan login SSH `root` (`PermitRootLogin no`) dan isolasi jaringan internal PostgreSQL di `compose.yaml`.<br>3) Pembatasan aksi `hapusItem` khusus peran `Tetua Adat`. | [`Kriptografi/src/hmac_chain.py`](../Kriptografi/src/hmac_chain.py), [`security/access-tests.md`](access-tests.md) (`NEG-04`, `NEG-06`), [`security/hardening-notes.md`](hardening-notes.md) | **5 (Rendah)** |
| **`RSK-02`** | `THR-01`: Penyamaran sebagai Tetua Adat (*Spoofing*) | **15 (Tinggi)** | 1) Hash kata sandi lambat **`Argon2id`** ($m=19\text{ MiB}, t=2, p=1$) dan **`scrypt`** dengan salt CSPRNG 16-byte unik + kebijakan **NIST SP 800-63B-4** (min. 15 karakter + *compromised blocklist*).<br>2) Sesi cookie `HttpOnly`, `SameSite=Lax` (`src/lib/sesi.ts`) & SSH khusus kunci publik Ed25519 (`PasswordAuthentication no`). | [`Kriptografi/src/password_security.py`](../Kriptografi/src/password_security.py), [`Pengembangan Aplikasi Web/src/lib/password-hash.ts`](../Pengembangan%20Aplikasi%20Web/src/lib/password-hash.ts), [`security/access-tests.md`](access-tests.md) (`POS-01`, `NEG-01`, `NEG-05`) | **3 (Rendah)** |
| **`RSK-03`** | `THR-08`: Eskalasi Hak Akses Pemohon ke Verifikator (*Privilege Escalation*) | **16 (Tinggi)** | 1) Penegakan RBAC 3 Peran (`Tetua Adat`, `Verifikator Adat`, `Pemohon Adat`) & pemeriksaan kepemilikan ABAC pada `ubahItem`, `hapusItem`, `ubahUlasan`, dan `hapusUlasan` (mencegah BOLA/IDOR & BFLA).<br>2) Kontainer berjalan sebagai non-root (`UID 1001`), `cap_drop: [ALL]`, `no-new-privileges:true`. | [`Pengembangan Aplikasi Web/src/app/katalog/actions.ts`](../Pengembangan%20Aplikasi%20Web/src/app/katalog/actions.ts), [`Pengembangan Aplikasi Web/src/app/katalog/ulasan-actions.ts`](../Pengembangan%20Aplikasi%20Web/src/app/katalog/ulasan-actions.ts), [`security/access-tests.md`](access-tests.md) (`NEG-02`..`NEG-04`) | **4 (Rendah)** |
| **`RSK-04`** | `THR-07`: Serangan DoS (`Denial of Service`) | **12 (Sedang)** | 1) Pembatas laju (*rate limiter*) login maksimal 3 gagal per 10 detik (`429 Too Many Requests`).<br>2) Pembatasan resource kontainer (`cpus: 1.0`, `memory: 512M`, `pids: 128`, `tmpfs: 64m`) di `compose.yaml`. | [`Pengembangan Aplikasi Web/src/app/masuk/actions.ts`](../Pengembangan%20Aplikasi%20Web/src/app/masuk/actions.ts), [`compose.yaml`](../compose.yaml), [`security/access-tests.md`](access-tests.md) (`NEG-05`) | **4 (Rendah)** |
| **`RSK-05`** | `THR-05`: Penyadapan / Kebocoran Data Arsip (*Information Disclosure*) | **12 (Sedang)** | 1) Enkripsi terautentikasi **`AES-256-GCM` (AEAD)** dengan nonce CSPRNG 12-byte & pengikatan konteks `AAD` (`claim_id`, `distrik`, `kategori`).<br>2) Pengetatan izin `.env` dan kunci master ke `0600`. | [`Kriptografi/src/aead_archive.py`](../Kriptografi/src/aead_archive.py), [`Kriptografi/KEPUTUSAN.md`](../Kriptografi/KEPUTUSAN.md), [`security/access-tests.md`](access-tests.md) (`POS-07`, `NEG-07`, `NEG-08`) | **4 (Rendah)** |
