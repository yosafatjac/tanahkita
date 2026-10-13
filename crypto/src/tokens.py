"""Modul Pembangkit Nilai Acak Kriptografis (CSPRNG).

TanahKita — Pembangkitan Token Otorisasi Tetua Adat & Nonce Verifikasi.
Menggunakan modul `secrets` standar Python yang memanfaatkan CSPRNG sistem operasi (/dev/urandom).
Bukan pseudo-random generator biasa (seperti modul `random`) yang mudah diprediksi.
"""

import secrets
from typing import Dict


def generate_verification_token(num_bytes: int = 32) -> str:
    """Membangkitkan token verifikasi rahasia untuk otorisasi tetua adat.
    
    Masukan: num_bytes (bawaan: 32 bytes = 256 bits entropi).
    Keluaran: string heksadesimal sepanjang 64 karakter acak CSPRNG.
    """
    if num_bytes < 16:
        raise ValueError("Panjang token minimal 16 bytes untuk menjamin keamanan entropi.")
    return secrets.token_hex(num_bytes)


def generate_claim_nonce() -> str:
    """Membangkitkan nonce URL-safe unik untuk mencegah replay attack."""
    return secrets.token_urlsafe(24)


def generate_elder_otp(digits: int = 6) -> str:
    """Membangkitkan kode OTP numerik acak untuk konfirmasi verifikasi tetua adat.
    
    Menggunakan secrets.randbelow agar tidak bias dan terhindar dari modulo bias.
    """
    if digits < 4 or digits > 8:
        raise ValueError("Jumlah digit OTP harus di antara 4 hingga 8 digit.")
    
    lower_bound = 10 ** (digits - 1)
    upper_bound = 10 ** digits
    otp_value = lower_bound + secrets.randbelow(upper_bound - lower_bound)
    return str(otp_value)
