export interface KatalogItem {
  id: string;
  kodeArsip: string;
  nama: string;
  kategori: "Hutan Adat" | "Zona Sagu" | "Pesisir Ulayat" | "Lembah Keramat" | "Perkebunan Komunal";
  distrik: string;
  kampung: string;
  luasHektar: number;
  margaPengelola: string;
  statusVerifikasi: "Terverifikasi Adat" | "Dalam Verifikasi" | "Arsip Baru";
  deskripsi: string;
  titikKoordinat: string;
  patokBatas: {
    utara: string;
    selatan: string;
    timur: string;
    barat: string;
  };
  hashArsip: string;
  tanggalPencatatan: string;
  jumlahDokumen: number;
}
