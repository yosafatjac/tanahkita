# Panduan & Direktori Tangkapan Layar (Screenshots)

Direktori ini disiapkan untuk menyimpan bukti tangkapan layar (*screenshots*) antarmuka aplikasi **TanahKita** sesuai persyaratan pengumpulan Milestone 1 Pengembangan Aplikasi Web:

1. **`desktop.png`**: Tangkapan layar antarmuka pada resolusi desktop ($\ge 1024\text{ px}$, misal $1280 \times 800\text{ px}$).
2. **`tablet.png`**: Tangkapan layar antarmuka pada resolusi tablet ($768\text{ px}$, misal iPad Mini / iPad Air).
3. **`mobile.png`**: Tangkapan layar antarmuka pada resolusi ponsel ($\le 640\text{ px}$, misal iPhone / Android $375 \times 667\text{ px}$).
4. **`form-validation.png`**: Bukti implementasi pesan kesalahan merah validasi formulir sisi klien saat masukan kosong/tidak valid.
5. **`lighthouse-score.png`**: Tangkapan layar panel Lighthouse Chrome DevTools dengan skor Aksesibilitas $\ge 85$.

### Cara Mengambil Tangkapan Layar Responsif di Google Chrome:
1. Buka peramban di `http://localhost:3000`.
2. Klik kanan di mana saja, lalu pilih **Inspect (Periksa)**.
3. Klik ikon ponsel/tablet di pojok kiri atas jendela DevTools (*Toggle Device Toolbar*, atau tekan `Cmd + Shift + M`).
4. Pilih opsi perangkat:
   - Pilih **iPhone SE** / **Pixel 7** untuk ukuran ponsel $\le 640\text{ px}$.
   - Pilih **iPad Mini** / **iPad Air** untuk ukuran tablet $768\text{ px}$.
   - Pilih **Responsive (1280px)** untuk ukuran desktop.
5. Klik ikon titik tiga di DevTools kanan atas, lalu pilih **Capture full size screenshot**.
6. Simpan berkas gambar ke dalam folder ini (`docs/screenshots/`).
