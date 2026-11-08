# Dokumentasi *System Hardening*, Audit Lynis, Keamanan Kontainer, & *Supply Chain* — TanahKita

- **Nama Mahasiswa:** Yosafat Jacobus
- **NIM:** 105224016
- **Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 2 (Kontrol Akses dan *System Hardening*)
- **Tag Rilis:** `sec-0.2` (terintegrasi dengan `v0.2`)
- **Berkas Konfigurasi & Bukti Terkait:**
  - Drop-in SSH: [`security/config/00-hardening.conf`](config/00-hardening.conf)
  - Audit Lynis: [`security/lynis-before.txt`](lynis-before.txt) (Indeks: **61**) & [`security/lynis-after.txt`](lynis-after.txt) (Indeks: **76**)
  - Pemindaian Citra Kontainer (Trivy): [`security/image-scan-before.txt`](image-scan-before.txt) & [`security/image-scan-after.txt`](image-scan-after.txt)
  - Inventaris SBOM (CycloneDX v1.6): [`security/sbom.cdx.json`](sbom.cdx.json)
  - Spesifikasi Kontainer & *Supply Chain*: [`../Dockerfile`](../Dockerfile), [`../.dockerignore`](../.dockerignore), [`../compose.yaml`](../compose.yaml), [`../.github/dependabot.yml`](../.github/dependabot.yml)

---

## 1. Inventaris Awal Sistem Operasi (*Baseline OS Inventory*)

Sebelum melakukan *hardening*, dilakukan pengambilan profil dasar (*baseline*) pada lingkungan host Linux target penerapan layanan **TanahKita**:

```text
$ uname -a
Linux tanahkita-node01 6.8.0-55-generic #57-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux

$ lsb_release -a
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.2 LTS (Noble Numbat)
Release:        24.04
Codename:       noble

$ ssh -V
OpenSSH_9.6p1 Ubuntu-3ubuntu13.8, OpenSSL 3.0.13 30 Jan 2024
```

### Inventaris Soket Jaringan Sebelum *Hardening* (`ss -tlpn`)
Sebelum *hardening*, port PostgreSQL (`5432`) dan aplikasi Node.js (`3000`) masih terikat ke seluruh antarmuka (`0.0.0.0`), membuka permukaan serangan langsung dari luar terhadap basis data (memperparah risiko **`RSK-01`** dan **`RSK-05`**):

```text
$ sudo ss -tlpn
State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
LISTEN  0       4096    0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=842,fd=3))
LISTEN  0       511     0.0.0.0:3000         0.0.0.0:*          users:(("node",pid=1420,fd=19))
LISTEN  0       244     0.0.0.0:5432         0.0.0.0:*          users:(("postgres",pid=1105,fd=6))
```

---

## 2. Audit Akun Linux, Grup `sudo`, Bit `SUID`, & Izin Berkas Rahasia

Sesuai **Modul 04 & 05 KKS**, dilakukan audit menyeluruh terhadap akun sistem operasi, hak eskalasi `sudo`, berkas ber-bit `setuid` (`SUID`), serta izin berkas konfigurasi sensitif:

### A. Verifikasi Akun `UID 0` & Grup Administratif (`sudo`)
Memastikan hanya `root` yang memiliki `UID 0` dan hanya akun non-root `deploy` yang berada di grup `sudo`:

```text
$ awk -F: '($3 == 0) {print $1}' /etc/passwd
root

$ getent group sudo
sudo:x:27:deploy

$ sudo -l -U deploy
User deploy may run the following commands on tanahkita-node01:
    (ALL : ALL) ALL
```

### B. Pengetatan Izin Berkas Rahasia (`.env` & Kunci Master Kriptografi — `chmod 600`)
Untuk memitigasi **`RSK-01`** (`THR-02` / `THR-06`), berkas `.env` yang menyimpan `DATABASE_URL` serta berkas kunci master `/Volumes/For Apple/.secrets/tanahkita_master.key` dikunci dengan izin **`0600` (`-rw-------`)** sehingga hanya pemilik proses yang dapat membacanya:

```text
$ chmod 600 "Pengembangan Aplikasi Web/.env" "/Volumes/For Apple/.secrets/tanahkita_master.key"
$ ls -la "Pengembangan Aplikasi Web/.env" "/Volumes/For Apple/.secrets/tanahkita_master.key"
-rw------- 1 yosafat staff 214 Nov  8 17:10 Pengembangan Aplikasi Web/.env
-rw------- 1 yosafat staff  65 Nov  8 17:15 /Volumes/For Apple/.secrets/tanahkita_master.key
```
Selain itu, modul `Kriptografi/src/key_manager.py` secara terprogram memeriksa `stat.S_IMODE(os.stat(key_path).st_mode)` dan melempar `KeyPermissionError` apabila bit baca/tulis grup atau publik terbuka (`mode & 0o077 != 0`, diverifikasi otomatis pada `test_09_key_manager_rejects_world_readable_key_file`).

### C. Audit Berkas `SUID` (`find / -perm -4000`) & `umask`
```text
$ find /usr/bin -perm -4000 -type f 2>/dev/null
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/mount
/usr/bin/umount
/usr/bin/su
```
Tidak ditemukan binari `SUID` asing di luar utilitas standar sistem dasar, dan nilai default `UMASK` pada `/etc/login.defs` diperketat dari `022` menjadi **`027`**.

---

## 3. *Hardening* Layanan OpenSSH & Bukti Uji Negatif

Konfigurasi penguatan SSH ditempatkan menggunakan mekanisme *drop-in* pada `/etc/ssh/sshd_config.d/00-hardening.conf` (salinan tersimpan di repositori pada [`security/config/00-hardening.conf`](config/00-hardening.conf)):

- `PermitRootLogin no` — Menutup login langsung sebagai `root` via SSH; seluruh tindakan administratif wajib melalui akun `deploy` + `sudo` agar tercatat di `/var/log/auth.log` (Mitigasi **`RSK-01`**).
- `PasswordAuthentication no` & `KbdInteractiveAuthentication no` — Mematikan autentikasi kata sandi SSH sepenuhnya untuk mengeliminasi serangan *brute-force* jaringan (Mitigasi **`RSK-02`** & **`RSK-05`**).
- `PubkeyAuthentication yes` & `AllowUsers deploy` — Hanya mengizinkan kunci publik kriptografis Ed25519 untuk pengguna `deploy`.
- `MaxAuthTries 3`, `LoginGraceTime 30`, `X11Forwarding no`, `AllowTcpForwarding no`, `AllowAgentForwarding no`.

### Verifikasi Sintaks & Konfigurasi Efektif (`sshd -t` dan `sshd -T`)
```text
$ sudo sshd -t && echo "Konfigurasi SSH Valid (Exit Code 0)"
Konfigurasi SSH Valid (Exit Code 0)

$ sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'
permitrootlogin no
passwordauthentication no

$ sudo sshd -T | grep -E '^(passwordauthentication|permitrootlogin|kbdinteractiveauthentication|pubkeyauthentication|allowusers|maxauthtries|x11forwarding)'
permitrootlogin no
pubkeyauthentication yes
passwordauthentication no
kbdinteractiveauthentication no
maxauthtries 3
x11forwarding no
allowusers deploy
```

### Bukti Uji Negatif SSH (*Negative SSH Verification*)
1. **Percobaan Login sebagai `root` (Ditolak):**
   ```text
   $ ssh -o PreferredAuthentications=publickey root@127.0.0.1
   root@127.0.0.1: Permission denied (publickey).
   ```
2. **Percobaan Login dengan Mode Kata Sandi / Tanpa Kunci Privat (Ditolak):**
   ```text
   $ ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password deploy@127.0.0.1
   deploy@127.0.0.1: Permission denied (publickey).
   ```

---

## 4. Manajemen Tambalan (*Patch Management*) & Analisis *Backporting* `regreSSHion` (CVE-2024-6387)

Untuk menjamin ketersediaan dan menutup kerentanan eksekusi kode jarak jauh (*unauthenticated RCE* sebagai `root`), diaktifkan pembaruan keamanan otomatis (`unattended-upgrades`) dan diverifikasi status *backporting* paket `openssh-server`:

```text
$ apt-cache policy openssh-server
openssh-server:
  Installed: 1:9.6p1-3ubuntu13.8
  Candidate: 1:9.6p1-3ubuntu13.8
  Version table:
 *** 1:9.6p1-3ubuntu13.8 500
        500 http://archive.ubuntu.com/ubuntu noble-security/main amd64 Packages
```

### Mengapa `OpenSSH 9.6p1` pada Ubuntu 24.04 Aman dari CVE-2024-6387 (*regreSSHion*)?
Pemindai kerentanan naif yang hanya membaca nomor versi hulu (`9.6p1 < 9.8p1`) kerap menandai server sebagai rentan terhadap **CVE-2024-6387** (*race condition* pada sinyal `SIGALRM` di `sshd`). Namun, tim keamanan Debian/Ubuntu menerapkan kebijakan **Security Backporting**: alih-alih mengganti mayoritas kode ke OpenSSH 9.8p1 yang berisiko merusak kompatibilitas konfigurasi produksi, Ubuntu menambal langsung potongan kode penanganan `grace_alarm_handler` ke dalam paket **`1:9.6p1-3ubuntu13.3`** (dan versi setelahnya seperti `3ubuntu13.8`). Verifikasi melalui `ubuntu-security-status` dan *changelog* paket memastikan CVE-2024-6387 telah tertutup sempurna.

---

## 5. Analisis Audit Keamanan Lynis (Sebelum vs. Sesudah *Hardening*)

Audit sistem dijalankan menggunakan **Lynis v3.1.4**:
- **Skor Sebelum *Hardening* ([`security/lynis-before.txt`](lynis-before.txt)):** **Hardening Index = 61 / 100** (7 Peringatan / Temuan Prioritas)
- **Skor Sesudah *Hardening* ([`security/lynis-after.txt`](lynis-after.txt)):** **Hardening Index = 76 / 100** (Melampaui ambang batas kelulusan $\ge 70$, **0 Warning**)

### A. Tabel 6 Temuan Lynis yang Diperbaiki & Keterkaitan dengan Register Risiko

| No | ID Uji Lynis | Kondisi Sebelum (`lynis-before.txt`) | Tindakan Remediasi Teknis yang Diterapkan | Kondisi Sesudah (`lynis-after.txt`) | Mitigasi Risiko (`risk-register.md`) |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **1** | **`SSH-7408`** | `PermitRootLogin` masih `yes`, `PasswordAuthentication` masih `yes`, `MaxAuthTries` `6`, `X11Forwarding` `yes` | Menambahkan `/etc/ssh/sshd_config.d/00-hardening.conf` (`PermitRootLogin no`, `PasswordAuthentication no`, `AllowUsers deploy`, `MaxAuthTries 3`, `X11Forwarding no`) | Seluruh parameter SSH berstatus **[HARDENED]** | **`RSK-01`** (`THR-02`) & **`RSK-02`** (`THR-01`) |
| **2** | **`AUTH-9286`** | `UMASK` default di `/etc/login.defs` bernilai `022` dan masa minimum sandi belum diatur | Mengubah `UMASK` ke **`027`** pada `/etc/login.defs` dan menerapkan kebijakan kata sandi NIST SP 800-63B-4 ($\ge 15$ karakter + `Argon2id`/`scrypt`) | `UMASK 027` aktif **[OK]**; berkas baru tidak lagi *world-readable* secara default | **`RSK-02`** & **`RSK-03`** (`THR-06`, `THR-09`) |
| **3** | **`FILE-7524`** | Berkas `.env` memiliki izin `0644` (*world-readable*) dan kunci master berada di dalam direktori kerja | Mengunci `.env` ke `chmod 600` dan memindahkan kunci master 256-bit ke luar repo (`/Volumes/For Apple/.secrets/tanahkita_master.key` dengan `0600`) | Izin berkas rahasia terkunci ketat **[OK]** | **`RSK-01`** (`THR-02`) & **`RSK-05`** (`THR-05`) |
| **4** | **`KRNL-6000`** | Parameter `sysctl` jaringan dan kernel belum diperkeras (`kptr_restrict=0`, `dmesg_restrict=0`, `rp_filter=0`) | Menerapkan `/etc/sysctl.d/99-tanahkita-hardening.conf`: `kernel.kptr_restrict=2`, `kernel.dmesg_restrict=1`, `fs.suid_dumpable=0`, `net.ipv4.conf.all.rp_filter=1`, `net.ipv4.tcp_syncookies=1` | Parameter kernel & anti-spoofing jaringan aktif **[HARDENED]** | **`RSK-03`** (`THR-08`) & **`RSK-04`** (`THR-07`) |
| **5** | **`PKGS-7392`** | Terdapat 4 paket sistem dengan pembaruan keamanan tertunda & `unattended-upgrades` belum aktif | Menjalankan `apt update && apt upgrade -y` serta mengaktifkan `dpkg-reconfigure -plow unattended-upgrades` | **0 paket rentan** & pembaruan otomatis aktif **[OK]** | **`RSK-04`** (`THR-07`) |
| **6** | **`CONT-8104`** | Kontainer berjalan sebagai `root (UID 0)` dengan sistem berkas bisa ditulis (*writable*) dan port DB `5432` terbuka ke `0.0.0.0` | Menerapkan `Dockerfile` multi-stage (`USER 1001:1001`), `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges:true`, dan jaringan internal di `compose.yaml` | Kontainer terisolasi penuh tanpa hak root **[HARDENED]** | **`RSK-01`**, **`RSK-03`**, & **`RSK-05`** |

### B. Alasan Teknis untuk 3 Saran Lynis yang Sengaja Tidak Diterapkan (*Skipped Suggestions Rationale*)

Sesuai prinsip rekayasa keamanan berbasis risiko (Modul 05 KKS), tidak semua saran generik Lynis relevan atau aman diterapkan secara membabi buta:
1. **`FILE-6310` (Pemisahan Partisi Disk Fisik/LVM untuk `/home`, `/var`, dan `/tmp`):**
   - *Alasan Dilewati:* Mesin virtual cloud memiliki satu volume blok tunggal yang sudah terformat saat *provisioning*. Mempartisi ulang disk root secara langsung berisiko merusak sistem berkas (mengancam *Availability*). Sebagai kompensasi yang setara, direktori sementara pada kontainer telah dipisahkan menggunakan **`tmpfs` dengan opsi `rw,noexec,nosuid,size=64m`** di [`compose.yaml`](../compose.yaml).
2. **`KRNL-5820` (`kernel.modules_disabled=1` — Mematikan Pemuatan Modul Kernel Selamanya hingga Reboot):**
   - *Alasan Dilewati:* *Runtime* Docker dan jaringan *bridge* membutuhkan pemuatan modul kernel dinamis (`overlay`, `br_netfilter`, `nf_tables`) saat inisialisasi layanan. Mengunci `modules_disabled=1` terlalu dini dapat menyebabkan kegagalan fungsi jaringan kontainer.
3. **`USB-1000` (Menonaktifkan Driver Penyimpanan USB):**
   - *Alasan Dilewati:* Pada lingkungan server VPS cloud (*headless*) tidak terdapat port USB fisik yang dapat diakses publik, sedangkan pada lingkungan pengembangan lokal MacBook pinjaman, penyimpanan eksternal (`/Volumes/For Apple`) justru wajib digunakan sesuai aturan operasional perangkat.

---

## 6. *Hardening* Kontainer (`Dockerfile` & `compose.yaml`), Verifikasi Runtime, & Keamanan *Supply Chain*

### A. Verifikasi Runtime Kontainer (`id`, `CapEff`, `read-only` Rootfs, & `ss -tlpn`)

1. **Verifikasi Pengguna Non-Root (`UID 1001` / `GID 1001`):**
   ```text
   $ docker compose exec app id
   uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)
   ```
2. **Verifikasi Pencabutan Seluruh *Linux Capabilities* (`cap_drop: [ALL]`):**
   ```text
   $ docker compose exec app grep Cap /proc/1/status
   CapInh: 0000000000000000
   CapPrm: 0000000000000000
   CapEff: 0000000000000000
   CapBnd: 0000000000000000
   CapAmb: 0000000000000000
   ```
   *(Nilai `CapEff: 0000000000000000` membuktikan proses kontainer memiliki nol kemampuan kernel seperti `CAP_NET_RAW`, `CAP_SYS_ADMIN`, atau `CAP_CHOWN`).*
3. **Bukti Uji Negatif & Positif Sistem Berkas `read_only: true`:**
   ```text
   # Uji Negatif: Mencoba menulis berkas di root filesystem (DITOLAK)
   $ docker compose exec app touch /test
   touch: /test: Read-only file system
   (Exit Code: 1)

   # Uji Positif: Menulis ke direktori tmpfs /tmp yang diizinkan (BERHASIL)
   $ docker compose exec app touch /tmp/uji_tmpfs && echo "Berhasil menulis ke tmpfs /tmp"
   Berhasil menulis ke tmpfs /tmp
   ```
4. **Verifikasi Isolasi Port Jaringan Sesudah *Hardening* (`ss -tlpn`):**
   Port `5432` (PostgreSQL) dan `3000` (Next.js) tidak lagi dipublikasikan ke host `0.0.0.0`; keduanya berkomunikasi di dalam jaringan internal `tanahkita_internal` (`internal: true`), dan hanya *reverse proxy* yang mendengarkan secara lokal di `127.0.0.1:8443`:
   ```text
   $ sudo ss -tlpn
   State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
   LISTEN  0       4096    0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=2104,fd=3))
   LISTEN  0       4096    127.0.0.1:8443       0.0.0.0:*          users:(("docker-proxy",pid=2890,fd=4))
   ```

### B. Hasil Pemindaian Kerentanan Citra Kontainer (Trivy Sebelum vs. Sesudah)

Pemindaian dilakukan menggunakan **Trivy v0.69.3** (versi bersih pasca-insiden kompromi tag Trivy Maret 2026):

| Metrik Citra Kontainer | Sebelum *Hardening* ([`image-scan-before.txt`](image-scan-before.txt)) | Sesudah *Hardening* ([`image-scan-after.txt`](image-scan-after.txt)) |
| :--- | :--- | :--- |
| **Base Image** | `node:22` (Debian Bookworm penuh, tanpa digest) | `node:22-alpine3.21@sha256:92d5f72b...` (Multi-stage + `apk upgrade`) |
| **Ukuran Citra** | `1.12 GB` | `168 MB` (Turun **85%**) |
| **Kerentanan `CRITICAL`** | **4 CRITICAL** (termasuk `zlib`, `openssl`, `curl` di layer Debian) | **0 CRITICAL** |
| **Kerentanan `HIGH`** | **19 HIGH** | **0 HIGH** |
| **Eksekusi `postinstall`** | Aktif (rawan worm npm) | Dinonaktifkan via `npm ci --ignore-scripts` |

### C. Pertahanan *Supply Chain*: SBOM CycloneDX & Mitigasi *Shai-Hulud* / *Trivy GHSA-69fq-xp46-6x23*

Berdasarkan studi kasus nyata pada **Modul 06 KKS**:
1. **Mitigasi Worm npm *Shai-Hulud* (November 2025):**
   - `Dockerfile` menjalankan **`npm ci --ignore-scripts`** yang memastikan dependensi dipasang persis sesuai hash integritas `SHA-512` pada `package-lock.json` dan memblokir eksekusi skrip siklus hidup (`preinstall`/`postinstall`) berbahaya yang biasa dipakai worm untuk mencuri token `.env`.
   - [`.github/dependabot.yml`](../.github/dependabot.yml) menerapkan **`cooldown: default-days: 7`** agar rilis paket baru yang terinfeksi di registri publik tidak langsung ditarik ke repositori sebelum komunitas keamanan mencabutnya.
2. **Mitigasi Kompromi Tag CI/CD (*Trivy* `GHSA-69fq-xp46-6x23`, Maret 2026):**
   - Seluruh citra dasar di [`Dockerfile`](../Dockerfile) dan [`compose.yaml`](../compose.yaml) dikunci menggunakan **immutable SHA-256 digest** (`@sha256:...`), bukan sekadar tag bergerak (`:latest`), serta pemindaian dilakukan menggunakan binari **Trivy v0.69.3** yang terverifikasi.
3. **Inventaris SBOM ([`security/sbom.cdx.json`](sbom.cdx.json)):**
   - Dokumen *Software Bill of Materials* berformat standar **CycloneDX v1.6 JSON** mencatat secara transparan seluruh komponen aplikasi (`next`, `react`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `zod`, `cryptography`, `argon2-cffi`) beserta versi dan *Package URL* (`pkg:npm/...` & `pkg:pypi/...`) sehingga audit dampak CVE baru di masa depan dapat dilakukan dalam hitungan detik.
