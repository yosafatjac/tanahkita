export type Kategori =
  | "HutanAdat"
  | "ZonaSagu"
  | "PesisirUlayat"
  | "LembahKeramat"
  | "PerkebunanKomunal";

export interface Item {
  id: number;
  judul: string;
  kategori: Kategori;
  distrik: string;
  luasHektar: number;
  deskripsi: string;
  tersedia: boolean;
  gambar: string | null;
  dibuatPada?: Date;
  ulasan?: Ulasan[];
}

export interface Ulasan {
  id: number;
  nama: string;
  nilai: number;
  komentar: string;
  dibuatPada?: Date;
  itemId: number;
}
