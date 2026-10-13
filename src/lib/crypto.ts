/**
 * TanahKita - Utilitas Kriptografi Sisi Klien (Web Crypto API)
 *
 * Menggunakan Web Crypto API bawaan browser (SubtleCrypto) untuk menghitung
 * sidik jari kriptografis SHA-256 secara langsung di peramban tanpa dependensi eksternal.
 * Menjamin privasi dokumen adat karena data tidak perlu dikirim ke server untuk sekadar di-hash.
 */

/**
 * Menghitung hash SHA-256 dari ArrayBuffer (berkas biner).
 * Mengembalikan 64 karakter heksadesimal huruf kecil.
 */
export async function sha256Buffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Menghitung hash SHA-256 dari string UTF-8.
 */
export async function sha256Text(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return sha256Buffer(data.buffer as ArrayBuffer);
}

/**
 * Menghitung hash SHA-256 langsung dari objek File peramban.
 */
export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256Buffer(buffer);
}

/**
 * Membandingkan dua hash secara aman (format heksadesimal).
 */
export function compareHashes(hashA: string, hashB: string): boolean {
  if (!hashA || !hashB) return false;
  return hashA.trim().toLowerCase() === hashB.trim().toLowerCase();
}

/**
 * Format string hash panjang menjadi ringkas untuk tampilan UI (misal: "a3f5...9b12")
 */
export function formatShortHash(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}
