import "server-only";
import type { KatalogItem } from "@/types/katalog";

export type { KatalogItem };

export const MOCK_KATALOG: KatalogItem[] = [
  {
    id: "ktl-001",
    kodeArsip: "KAT-MMK-01",
    nama: "Kawasan Ulayat Lembah Nemangkawi",
    kategori: "Lembah Keramat",
    distrik: "Kuala Kencana",
    kampung: "Kampung Utikini Baru",
    luasHektar: 42.5,
    margaPengelola: "Marga Magal",
    statusVerifikasi: "Terverifikasi Adat",
    deskripsi:
      "Wilayah lembah keramat sakral warisan leluhur yang ditetapkan sebagai kawasan perlindungan sumber mata air dan ritual musyawarah adat tahunan.",
    titikKoordinat: "4°25'12.4\"S 136°52'45.8\"E",
    patokBatas: {
      utara: "Pohon Gaharu Raksasa & Aliran Sungai Iwaka",
      selatan: "Punggung Bukit Nemangkawi Ketinggian 1.200 mdpl",
      timur: "Batas Tanah Adat Marga Omaleng",
      barat: "Batas Hulu Kali Kopi",
    },
    hashArsip: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    tanggalPencatatan: "2026-10-02",
    jumlahDokumen: 3,
  },
  {
    id: "ktl-002",
    kodeArsip: "KAT-MMK-02",
    nama: "Zona Konservasi Sagu Kali Kopi",
    kategori: "Zona Sagu",
    distrik: "Mimika Baru",
    kampung: "Kampung Nayaro",
    luasHektar: 28.0,
    margaPengelola: "Marga Matuan",
    statusVerifikasi: "Dalam Verifikasi",
    deskripsi:
      "Hamparan rumpun sagu alami penyangga ketahanan pangan adat marga, dimanfaatkan bersama secara bergilir sesuai aturan kearifan lokal.",
    titikKoordinat: "4°33'45.1\"S 136°54'12.3\"E",
    patokBatas: {
      utara: "Tebing Batu Karang Kali Kopi Bawah",
      selatan: "Muara Pertemuan Rawa Nayaro",
      timur: "Pohon Kayu Besi Tua Bertanda Salib Adat",
      barat: "Batas Wilayah Marga Beanal",
    },
    hashArsip: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    tanggalPencatatan: "2026-10-05",
    jumlahDokumen: 2,
  },
  {
    id: "ktl-003",
    kodeArsip: "KAT-MMK-03",
    nama: "Pesisir Muara Ulayat Atuka",
    kategori: "Pesisir Ulayat",
    distrik: "Mimika Timur",
    kampung: "Kampung Atuka",
    luasHektar: 55.2,
    margaPengelola: "Marga Beanal",
    statusVerifikasi: "Terverifikasi Adat",
    deskripsi:
      "Zona penangkapan kepiting bakau dan jalur perahu tradisional suku pesisir yang dilindungi hukum adat larangan penangkapan berlebih (*sasi*).",
    titikKoordinat: "4°48'09.8\"S 136°47'33.1\"E",
    patokBatas: {
      utara: "Rawa Nipah Garis Pasang Tertinggi",
      selatan: "Garis Pantai Laut Arafura",
      timur: "Muara Sungai Minajerwi",
      barat: "Tanjung Bakau Tua",
    },
    hashArsip: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    tanggalPencatatan: "2026-10-08",
    jumlahDokumen: 4,
  },
  {
    id: "ktl-004",
    kodeArsip: "KAT-MMK-04",
    nama: "Hutan Keramat Pegunungan Iwaka",
    kategori: "Hutan Adat",
    distrik: "Iwaka",
    kampung: "Kampung Mulia Kencana",
    luasHektar: 70.4,
    margaPengelola: "Marga Omaleng",
    statusVerifikasi: "Terverifikasi Adat",
    deskripsi:
      "Hutan lindung adat rimba lebat kaya flora fauna endemik, hanya boleh dimasuki untuk pengambilan obat tradisional dan kayu pemali.",
    titikKoordinat: "4°21'05.3\"S 136°58'19.7\"E",
    patokBatas: {
      utara: "Puncak Bukit Iwaka",
      selatan: "Jalan Trans Timika-Nabire km 32",
      timur: "Sungai Wania Hulu",
      barat: "Batas Adat Marga Magal",
    },
    hashArsip: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    tanggalPencatatan: "2026-10-10",
    jumlahDokumen: 3,
  },
  {
    id: "ktl-005",
    kodeArsip: "KAT-MMK-05",
    nama: "Perkebunan Komunal Lembah Waa",
    kategori: "Perkebunan Komunal",
    distrik: "Tembagapura",
    kampung: "Kampung Banti",
    luasHektar: 19.8,
    margaPengelola: "Marga Kwalik",
    statusVerifikasi: "Arsip Baru",
    deskripsi:
      "Lahan bercocok tanam keladi dan ubi jalar dataran tinggi yang dikelola secara komunal oleh kelompok perempuan adat marga.",
    titikKoordinat: "4°16'30.2\"S 137°04'50.1\"E",
    patokBatas: {
      utara: "Lereng Terjal Batu Grasberg",
      selatan: "Aliran Kali Kabur",
      timur: "Jalan Setapak Menuju Kampung Kimbeli",
      barat: "Patok Kayu Tanduk Banti",
    },
    hashArsip: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    tanggalPencatatan: "2026-10-12",
    jumlahDokumen: 1,
  },
];

export function cariItem(id: string): KatalogItem | undefined {
  return MOCK_KATALOG.find((item) => item.id.toLowerCase() === id.toLowerCase());
}
