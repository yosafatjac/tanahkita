export type ClaimStatus = "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI_ADAT" | "DALAM_SENGKETA";

export interface BoundaryPoints {
  utara: string;
  selatan: string;
  timur: string;
  barat: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  evidenceHash: string;
  previousHash: string;
  currentHash: string;
}

export interface LandClaim {
  id: string;
  nomorRegistrasi: string;
  marga: string;
  kepalaMarga: string;
  distrik: string;
  kampung: string;
  luasHektar: number;
  peruntukan: string;
  status: ClaimStatus;
  titikKoordinat: string;
  batasWilayah: BoundaryPoints;
  tanggalPengajuan: string;
  dokumenBukti: {
    namaFile: string;
    tipeBerkas: string;
    sha256: string;
  }[];
  auditChain: AuditRecord[];
  catatanTetua?: string;
}
