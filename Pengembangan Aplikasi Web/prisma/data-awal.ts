export type DataAwalItem = {
  judul: string;
  kategori: "HutanAdat" | "ZonaSagu" | "PesisirUlayat" | "LembahKeramat" | "PerkebunanKomunal";
  distrik: string;
  luasHektar: number;
  deskripsi: string;
  tersedia: boolean;
  gambar?: string | null;
};

export const dataAwal: DataAwalItem[] = [
  {
    judul: "Kawasan Ulayat Lembah Nemangkawi",
    kategori: "LembahKeramat",
    distrik: "Kuala Kencana",
    luasHektar: 42.5,
    deskripsi: "Wilayah lembah keramat sakral warisan leluhur perlindungan sumber mata air dan ritual adat tahunan.",
    tersedia: true,
    gambar: null,
  },
  {
    judul: "Zona Konservasi Sagu Kali Kopi",
    kategori: "ZonaSagu",
    distrik: "Mimika Baru",
    luasHektar: 28.0,
    deskripsi: "Hamparan rumpun sagu alami penyangga ketahanan pangan adat marga, dimanfaatkan bersama bergilir.",
    tersedia: true,
    gambar: null,
  },
  {
    judul: "Pesisir Muara Ulayat Atuka",
    kategori: "PesisirUlayat",
    distrik: "Mimika Timur",
    luasHektar: 55.2,
    deskripsi: "Zona penangkapan kepiting bakau dan jalur perahu tradisional suku pesisir yang dilindungi hukum sasi adat.",
    tersedia: true,
    gambar: null,
  },
  {
    judul: "Hutan Keramat Pegunungan Iwaka",
    kategori: "HutanAdat",
    distrik: "Iwaka",
    luasHektar: 70.4,
    deskripsi: "Hutan lindung adat rimba lebat kaya flora fauna endemik untuk perlindungan patok batas dan obat tradisional.",
    tersedia: true,
    gambar: null,
  },
  {
    judul: "Perkebunan Komunal Lembah Agimuga",
    kategori: "PerkebunanKomunal",
    distrik: "Agimuga",
    luasHektar: 35.8,
    deskripsi: "Tanah garapan perkebunan bersama untuk komoditas kopi dan umbi-umbian marga dataran tinggi.",
    tersedia: true,
    gambar: null,
  },
  {
    judul: "Hutan Adat Kwamki Narama",
    kategori: "HutanAdat",
    distrik: "Kwamki Narama",
    luasHektar: 62.0,
    deskripsi: "Kawasan hutan adat penyangga perbatasan antar-marga dengan patok pohon gaharu dan batu bertulis leluhur.",
    tersedia: true,
    gambar: null,
  },
];
