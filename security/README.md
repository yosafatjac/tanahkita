# Direktori Artefak Keamanan Siber — TanahKita (`security/`)

**Mata Kuliah:** Keamanan Komputasi dan Siber (`052353` / `CS5-2026`)  
**Dosen Pengampu:** Muhammad Fakhrul Safitra, S.Kom., M.Kom.  
**Mahasiswa:** Yosafat Jacobus (`105224016`)  
**Tag Rilis:** `sec-0.1` (Tugas 1) & `sec-0.2` (Tugas 2)

---

## 1. Ruang Lingkup dan Etika Pengujian Keamanan (*Testing Scope & Rules of Engagement*)

Sesuai dengan **Kebijakan AI dan Etika Pengujian Keamanan** Universitas Pertamina, seluruh aktivitas pengujian keamanan, pemindaian kerentanan, dan *hardening* pada repositori **TanahKita** wajib mematuhi batas ruang lingkup (*scope*) berikut sebelum dan selama pengujian berlangsung:

| Parameter Scope | Ketentuan Operasional yang Diizinkan |
| :--- | :--- |
| **Target Pengujian (*In-Scope Targets*)** | 1. Aplikasi web lokal **TanahKita** (`http://127.0.0.1:3000` / `http://localhost:3000`).<br>2. Database lokal **PostgreSQL 18** (`127.0.0.1:5432`, database `tanahkita_db`).<br>3. Modul layanan kriptografi lokal di direktori `Kriptografi/`.<br>4. Lingkungan VM/kontainer lokal milik mahasiswa sendiri untuk pengujian konfigurasi Linux, SSH, Lynis, dan Trivy. |
| **Teknik yang Diizinkan (*Authorized Techniques*)** | - Pengujian autentikasi dan otorisasi berbasis peran (RBAC) serta kepemilikan atribut (ABAC) pada *Server Actions* dan *route* lokal.<br>- Pengujian pembatasan laju (*rate limiting*) login dengan maksimum 5 percobaan beruntun pada instance lokal.<br>- Audit konfigurasi sistem operasi dan SSH (`sshd -T`, `lynis audit system`).<br>- Pemindaian kerentanan image kontainer (`trivy image`) dan pembuatan SBOM (`CycloneDX v1.6`).<br>- Pengujian manipulasi *ciphertext*, *nonce*, *tag*, dan *AAD* pada unit test lokal (`pytest`). |
| **Waktu Pengujian (*Testing Window*)** | Selama periode perkuliahan Semester Ganjil 2026/2027 (Pekan 1 s.d. Pekan 16) pada mesin pengembangan lokal mahasiswa. |
| **Kebijakan Data (*Synthetic Data Only*)** | Seluruh pengujian **wajib 100% menggunakan data sintetis** (nama tetua adat fiktif, koordinat patok simulasi, NIK dummy `9999999999999999`, dan akun uji lokal). Dilarang keras memasukkan data pribadi nyata (PII) atau dokumen sengketa tanah asli ke dalam repositori. |
| **Target di Luar Scope (*Out-of-Scope / Strictly Prohibited*)** | - **DILARANG** memindai, menguji penetrasi, atau mengirim trafik otomatis ke server kampus (`*.universitaspertamina.ac.id`), infrastruktur pemerintah (`*.atrbpn.go.id`, `*.mimikakab.go.id`), atau layanan pihak ketiga mana pun.<br>- **DILARANG** melakukan serangan *Denial of Service* (DoS/DDoS) atau *brute-force* pada jaringan publik/kampus.<br>- **DILARANG** menyimpan kunci privat, kredensial `.env` produksi, atau *master key* di dalam repositori Git. |

---

## 2. Indeks Artefak Berdasarkan Milestone

### A. Tugas 1 — *Threat Modeling* dan Analisis Risiko (Tag `sec-0.1`)
1. [`asset-inventory.md`](./asset-inventory.md) — Inventarisasi 12 aset kritis TanahKita (data klaim, arsip PDF, kunci master, layanan Next.js, PostgreSQL, log audit, backup, akun admin) beserta penilaian CIA (*Confidentiality, Integrity, Availability*).
2. [`dfd.md`](./dfd.md) — *Data Flow Diagram* (DFD) Level 1 dengan penomoran elemen konsisten (`E1`–`E3`, `P1`–`P4`, `D1`–`D6`, `DF1`–`DF19`), 3 *Trust Boundary* (`TB1`–`TB3`), serta penanda kontrol kriptografi.
3. [`threat-model.md`](./threat-model.md) — Identifikasi 13 ancaman spesifik berbasis kerangka **STRIDE** (`THR-01` s.d. `THR-13`) yang ditautkan langsung ke elemen DFD dan aset.
4. [`risk-register.md`](./risk-register.md) — Register risiko prioritas (`RSK-01` s.d. `RSK-05`) dengan analisis *Likelihood* $\times$ *Impact*, pemetaan kontrol ke Tugas 2 (`sec-0.2`) & Tugas 3 (`sec-0.3`), serta status implementasi aktual.

### B. Tugas 2 — Kontrol Akses, *System Hardening*, Kontainer, & *Supply Chain* (Tag `sec-0.2`)
1. [`access-tests.md`](./access-tests.md) — Matriks hak akses 3 peran (`Masyarakat Umum`, `Pemohon Adat`, `Petugas BPN` + pembatasan `Admin Sistem`), bukti *slow password hashing* (`Argon2id` & `scryptSync` + `timingSafeEqual`), serta **16 skenario uji akses** (8 positif `POS-01`..`POS-08` & 8 negatif `NEG-01`..`NEG-08`).
2. [`hardening-notes.md`](./hardening-notes.md) — Dokumentasi *hardening* sistem operasi Linux, SSH (`sudo sshd -T`), kontainer multi-stage non-root, jaringan internal Compose, perbandingan metrik sebelum-sesudah, dan keterkaitan setiap kontrol dengan `RSK-01`..`RSK-05`.
3. [`config/00-hardening.conf`](./config/00-hardening.conf) — Konfigurasi *drop-in* OpenSSH Server (`/etc/ssh/sshd_config.d/00-hardening.conf`) yang menonaktifkan `PermitRootLogin` dan `PasswordAuthentication`.
4. [`lynis-before.txt`](./lynis-before.txt) & [`lynis-after.txt`](./lynis-after.txt) — Bukti audit keamanan host menggunakan **Lynis** sebelum *hardening* (*Hardening Index*: **61**) dan sesudah *hardening* (*Hardening Index*: **76** $\ge 70$).
5. [`image-scan-before.txt`](./image-scan-before.txt) & [`image-scan-after.txt`](./image-scan-after.txt) — Bukti pemindaian kerentanan image kontainer menggunakan **Trivy** sebelum *hardening* (`node:20` penuh: **5 CRITICAL, 24 HIGH**) dan sesudah *hardening* (`node:22-alpine3.21` multi-stage: **0 CRITICAL, 0 HIGH**).
6. [`sbom.cdx.json`](./sbom.cdx.json) — *Software Bill of Materials* (SBOM) berstandar **CycloneDX v1.6** yang mendokumentasikan 20 komponen produksi beserta versi dan *Package URL* (`purl`).
7. **Berkas Root Terkait `sec-0.2`:**
   - [`../Dockerfile`](../Dockerfile) — Multi-stage build, `node:22-alpine3.21` dengan *SHA-256 digest pinning*, `npm ci --ignore-scripts`, dan pengguna non-root `tanahkita` (`1001:1001`).
   - [`../.dockerignore`](../.dockerignore) — Eksklusi `.git`, `.env*`, `node_modules`, dan kunci rahasia dari *build context*.
   - [`../compose.yaml`](../compose.yaml) — Orkestrasi layanan dengan `read_only: true`, `tmpfs`, `cap_drop: [ALL]`, `no-new-privileges:true`, dan isolasi jaringan internal (`backend_net`).
   - [`../.github/dependabot.yml`](../.github/dependabot.yml) — Otomasi pembaruan dependensi `npm`, `pip`, dan `docker` dengan *cooldown* 7 hari untuk mitigasi serangan *supply chain*.
