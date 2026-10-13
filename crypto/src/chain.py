"""Modul Hash-Chain (Rantai Riwayat Berintegritas) TanahKita.

Mencatat riwayat status tanah adat secara berantai (tamper-evident log).
Setiap entri mereferensikan hash dari entri sebelumnya.
Jika salah satu riwayat dimanipulasi (misalnya nama marga atau batas diubah diam-diam),
seluruh rantai setelahnya akan rusak dan langsung terdeteksi.
"""

import hashlib
import json
from dataclasses import dataclass, asdict
from typing import List, Tuple, Dict, Any


@dataclass
class LandClaimRecord:
    """Struktur data satu blok riwayat penguasaan tanah adat."""
    index: int
    timestamp: str
    claim_id: str
    marga: str
    lokasi: str
    action: str              # Contoh: "REGISTRASI", "VERIFIKASI_TETUA", "SENGKETA_DISELESAIKAN"
    evidence_hash: str       # Hash berkas bukti pendukung
    previous_hash: str
    block_hash: str = ""

    def calculate_hash(self) -> str:
        """Menghitung hash SHA-256 dari blok riwayat."""
        payload = {
            "index": self.index,
            "timestamp": self.timestamp,
            "claim_id": self.claim_id,
            "marga": self.marga,
            "lokasi": self.lokasi,
            "action": self.action,
            "evidence_hash": self.evidence_hash,
            "previous_hash": self.previous_hash,
        }
        # Serialisasi deterministik dengan sort_keys agar hash selalu konsisten
        raw_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        return hashlib.sha256(raw_bytes).hexdigest()


class LandRecordChain:
    """Pengelola rantai riwayat penguasaan tanah adat."""

    def __init__(self):
        self.chain: List[LandClaimRecord] = []
        self._create_genesis_record()

    def _create_genesis_record(self):
        """Membuat blok awal (Genesis Block) sistem TanahKita."""
        genesis = LandClaimRecord(
            index=0,
            timestamp="2026-10-01T00:00:00Z",
            claim_id="GENESIS",
            marga="LEMBAGA_MASYARAKAT_ADAT_TIMIKA",
            lokasi="KABUPATEN_MIMIKA_PAPUA",
            action="INISIALISASI_SISTEM_TANAHKITA",
            evidence_hash="0" * 64,
            previous_hash="0" * 64,
        )
        genesis.block_hash = genesis.calculate_hash()
        self.chain.append(genesis)

    @property
    def latest_record(self) -> LandClaimRecord:
        return self.chain[-1]

    def add_record(
        self,
        timestamp: str,
        claim_id: str,
        marga: str,
        lokasi: str,
        action: str,
        evidence_hash: str
    ) -> LandClaimRecord:
        """Menambahkan satu entri riwayat baru ke dalam rantai."""
        new_index = len(self.chain)
        prev_hash = self.latest_record.block_hash

        record = LandClaimRecord(
            index=new_index,
            timestamp=timestamp,
            claim_id=claim_id,
            marga=marga,
            lokasi=lokasi,
            action=action,
            evidence_hash=evidence_hash,
            previous_hash=prev_hash,
        )
        record.block_hash = record.calculate_hash()
        self.chain.append(record)
        return record

    def verify_integrity(self) -> Tuple[bool, str]:
        """Memverifikasi keutuhan seluruh rantai riwayat tanah.
        
        Keluaran:
        (True, "Rantai valid") jika seluruh hash dan rantai utuh.
        (False, detail_kerusakan) jika ada blok yang dimanipulasi atau rantai terputus.
        """
        for i in range(len(self.chain)):
            current = self.chain[i]

            # 1. Verifikasi apakah hash blok saat ini cocok dengan isinya
            calculated_hash = current.calculate_hash()
            if current.block_hash != calculated_hash:
                return (
                    False,
                    f"Integritas gagal di Blok #{current.index}: Konten telah dimanipulasi! "
                    f"Hash tercatat: {current.block_hash[:12]}..., Hash hitungan: {calculated_hash[:12]}..."
                )

            # 2. Verifikasi keterkaitan dengan blok sebelumnya (kecuali genesis)
            if i > 0:
                previous = self.chain[i - 1]
                if current.previous_hash != previous.block_hash:
                    return (
                        False,
                        f"Rantai terputus di Blok #{current.index}: Previous hash tidak cocok dengan Blok #{previous.index}!"
                    )

        return (True, "Seluruh riwayat tanah adat terverifikasi valid dan tidak mengalami manipulasi.")
