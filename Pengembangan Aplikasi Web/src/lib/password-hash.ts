import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * TanahKita — Modul Keamanan Kata Sandi Lambat & Kebijakan NIST SP 800-63B-4
 * Menggunakan algoritma memory-hard scrypt (N=16384, r=8, p=1, keylen=32)
 * dengan salt acak 16-byte unik per akun dan perbandingan waktu konstan (timingSafeEqual).
 * Berpasangan dengan modul Kriptografi Python (`Argon2id` di `Kriptografi/src/password_security.py`).
 */

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;

const DAFTAR_SANDI_BOCOR = new Set([
  "password1234567",
  "123456789012345",
  "qwertyuiopasdfg",
  "admin1234567890",
  "tanahkita123456",
  "indonesia123456",
  "papuamimika1234",
  "iloveyou1234567",
]);

export interface HasilKebijakanSandi {
  valid: boolean;
  alasan?: string;
}

/**
 * Validasi kebijakan kata sandi sesuai NIST SP 800-63B-4 (Agustus 2025):
 * - Panjang minimal 15 karakter untuk autentikasi faktor tunggal (maksimal 64+ karakter)
 * - Mendukung seluruh karakter cetak ASCII dan spasi (passphrase)
 * - Pemeriksaan terhadap daftar kata sandi bocor (compromised password blocklist)
 */
export function validasiKebijakanSandiNist(kataSandi: string): HasilKebijakanSandi {
  if (!kataSandi || kataSandi.length < 15) {
    return {
      valid: false,
      alasan:
        "Kata sandi faktor tunggal wajib minimal 15 karakter sesuai standar NIST SP 800-63B-4.",
    };
  }
  if (kataSandi.length > 128) {
    return {
      valid: false,
      alasan: "Kata sandi maksimal 128 karakter.",
    };
  }
  if (DAFTAR_SANDI_BOCOR.has(kataSandi.toLowerCase().trim())) {
    return {
      valid: false,
      alasan:
        "Kata sandi ditemukan dalam daftar sandi bocor (compromised blocklist). Gunakan frasa sandi yang unik.",
    };
  }
  return { valid: true };
}

/**
 * Menghasilkan PHC string hash lambat berbasis scrypt dengan salt CSPRNG 16-byte unik.
 * Format: $scrypt$n=16384,r=8,p=1$<salt_hex>$<hash_hex>
 */
export function buatHashSandiLambat(kataSandi: string, saltHexOpsional?: string): string {
  const salt = saltHexOpsional
    ? Buffer.from(saltHexOpsional, "hex")
    : randomBytes(16);
  const derivedKey = scryptSync(kataSandi.normalize("NFC"), salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `$scrypt$n=${SCRYPT_N},r=${SCRYPT_R},p=${SCRYPT_P}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

/**
 * Memverifikasi kata sandi terhadap PHC string scrypt secara constant-time (timingSafeEqual).
 */
export function verifikasiHashSandiLambat(kataSandi: string, phcHash: string): boolean {
  try {
    const bagian = phcHash.split("$");
    // ["", "scrypt", "n=16384,r=8,p=1", "<salt_hex>", "<hash_hex>"]
    if (bagian.length !== 5 || bagian[1] !== "scrypt") {
      return false;
    }
    const salt = Buffer.from(bagian[3], "hex");
    const targetHash = Buffer.from(bagian[4], "hex");
    const kandidatHash = scryptSync(kataSandi.normalize("NFC"), salt, targetHash.length, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    });
    if (kandidatHash.length !== targetHash.length) {
      return false;
    }
    return timingSafeEqual(kandidatHash, targetHash);
  } catch {
    return false;
  }
}
