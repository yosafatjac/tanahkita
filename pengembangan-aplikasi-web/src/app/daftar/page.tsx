"use client";

import React, { useState } from "react";
import Link from "next/link";
import HashViewer from "../../components/HashViewer";
import { sha256File, sha256Text } from "@/lib/crypto";

interface FormData {
  marga: string;
  kepalaMarga: string;
  distrik: string;
  kampung: string;
  luasHektar: string;
  peruntukan: string;
  titikKoordinat: string;
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  namaBerkas: string;
  pernyataanAdat: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function DaftarKlaimPage() {
  const [formData, setFormData] = useState<FormData>({
    marga: "",
    kepalaMarga: "",
    distrik: "",
    kampung: "",
    luasHektar: "",
    peruntukan: "",
    titikKoordinat: "",
    batasUtara: "",
    batasSelatan: "",
    batasTimur: "",
    batasBarat: "",
    namaBerkas: "",
    pernyataanAdat: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [fileHash, setFileHash] = useState<string>("");
  const [isHashingFile, setIsHashingFile] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<{
    noReg: string;
    generatedHash: string;
    timestamp: string;
  } | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.marga.trim()) {
      newErrors.marga = "Nama marga/suku wajib diisi.";
    } else if (formData.marga.trim().length < 3) {
      newErrors.marga = "Nama marga minimal 3 karakter.";
    }

    if (!formData.kepalaMarga.trim()) {
      newErrors.kepalaMarga = "Nama kepala marga/pemohon wajib diisi.";
    } else if (formData.kepalaMarga.trim().length < 3) {
      newErrors.kepalaMarga = "Nama kepala marga minimal 3 karakter.";
    }

    if (!formData.distrik) {
      newErrors.distrik = "Silakan pilih distrik lokasi tanah ulayat.";
    }

    if (!formData.kampung.trim()) {
      newErrors.kampung = "Nama kampung/desa wajib diisi.";
    }

    if (!formData.luasHektar) {
      newErrors.luasHektar = "Luas lahan wajib diisi.";
    } else {
      const luas = parseFloat(formData.luasHektar);
      if (isNaN(luas) || luas <= 0) {
        newErrors.luasHektar = "Luas lahan harus berupa angka positif lebih dari 0.";
      }
    }

    if (!formData.peruntukan.trim()) {
      newErrors.peruntukan = "Tujuan peruntukan lahan adat wajib diisi.";
    }

    if (!formData.titikKoordinat.trim()) {
      newErrors.titikKoordinat = "Titik koordinat atau deskripsi patok utama wajib diisi.";
    }

    if (!formData.batasUtara.trim()) {
      newErrors.batasUtara = "Deskripsi batas utara wajib diisi.";
    }
    if (!formData.batasSelatan.trim()) {
      newErrors.batasSelatan = "Deskripsi batas selatan wajib diisi.";
    }
    if (!formData.batasTimur.trim()) {
      newErrors.batasTimur = "Deskripsi batas timur wajib diisi.";
    }
    if (!formData.batasBarat.trim()) {
      newErrors.batasBarat = "Deskripsi batas barat wajib diisi.";
    }

    if (!formData.namaBerkas) {
      newErrors.namaBerkas = "Unggah minimal 1 dokumen bukti fisik (foto patok/surat adat).";
    }

    if (!formData.pernyataanAdat) {
      newErrors.pernyataanAdat = "Anda harus menyetujui pernyataan kebenaran data adat.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Bersihkan error saat pengguna mengetik ulang
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, namaBerkas: file.name }));
      setIsHashingFile(true);
      try {
        const hash = await sha256File(file);
        setFileHash(hash);
      } catch (err) {
        console.error("Gagal menghitung hash berkas:", err);
      } finally {
        setIsHashingFile(false);
      }
      if (errors.namaBerkas) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.namaBerkas;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const payloadString = JSON.stringify({
        ...formData,
        fileHash,
        waktuRegistrasi: new Date().toISOString(),
      });
      const recordHash = await sha256Text(payloadString);
      const randomId = Math.floor(100 + Math.random() * 900);

      setSubmittedData({
        noReg: `TK-MMK-2026-${randomId}`,
        generatedHash: fileHash || recordHash,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Navigasi Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-amber-800 underline">
              Beranda
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-800">Daftar Klaim Baru</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Formulir Pencatatan Klaim Tanah Adat
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Lengkapi data ulayat dan lampirkan bukti foto patok atau surat musyawarah adat.
          Seluruh data akan divalidasi dan dihitung sidik jari kriptografisnya.
        </p>
      </div>

      {/* Tampilan Notifikasi Berhasil */}
      {submittedData ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 text-emerald-800 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Pendaftaran Klaim Berhasil Dicatat!</h2>
              <p className="text-xs text-stone-500">
                Data telah tersimpan di sistem mock dan sidik jari berkas telah diterbitkan.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs mb-6">
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Nomor Registrasi:</span>
              <strong className="font-mono text-stone-900 text-sm">{submittedData.noReg}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Marga / Pemohon:</span>
              <strong className="text-stone-900">{formData.marga} ({formData.kepalaMarga})</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Wilayah:</span>
              <span className="text-stone-800">{formData.distrik}, Kampung {formData.kampung}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Luas Lahan:</span>
              <span className="text-amber-900 font-semibold">{formData.luasHektar} Hektar</span>
            </div>
            <div>
              <HashViewer hash={submittedData.generatedHash} label="Sidik Jari SHA-256 Berkas Bukti (Terkunci):" compact={false} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold"
            >
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedData(null);
                setFormData({
                  marga: "",
                  kepalaMarga: "",
                  distrik: "",
                  kampung: "",
                  luasHektar: "",
                  peruntukan: "",
                  titikKoordinat: "",
                  batasUtara: "",
                  batasSelatan: "",
                  batasTimur: "",
                  batasBarat: "",
                  namaBerkas: "",
                  pernyataanAdat: false,
                });
              }}
              className="px-4 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300"
            >
              + Catat Klaim Lainnya
            </button>
          </div>
        </div>
      ) : (
        /* Formulir Pendaftaran */
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Bagian 1: Identitas Marga */}
          <fieldset className="border-b border-stone-100 pb-6">
            <legend className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
              1. Identitas Pemohon & Marga Adat
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="marga" className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Marga / Keret Adat <span className="text-rose-600">*</span>
                </label>
                <input
                  id="marga"
                  name="marga"
                  type="text"
                  value={formData.marga}
                  onChange={handleInputChange}
                  placeholder="Contoh: Marga Magal, Marga Matuan"
                  aria-invalid={!!errors.marga}
                  aria-describedby={errors.marga ? "error-marga" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.marga
                      ? "border-rose-500 focus:ring-rose-400 bg-rose-50/20"
                      : "border-stone-300 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                />
                {errors.marga && (
                  <p id="error-marga" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.marga}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="kepalaMarga" className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Kepala Marga / Pemohon <span className="text-rose-600">*</span>
                </label>
                <input
                  id="kepalaMarga"
                  name="kepalaMarga"
                  type="text"
                  value={formData.kepalaMarga}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap pemohon"
                  aria-invalid={!!errors.kepalaMarga}
                  aria-describedby={errors.kepalaMarga ? "error-kepalaMarga" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.kepalaMarga
                      ? "border-rose-500 focus:ring-rose-400 bg-rose-50/20"
                      : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.kepalaMarga && (
                  <p id="error-kepalaMarga" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.kepalaMarga}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Bagian 2: Lokasi & Luas Tanah */}
          <fieldset className="border-b border-stone-100 pb-6">
            <legend className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
              2. Wilayah dan Spesifikasi Lahan
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="distrik" className="block text-xs font-semibold text-stone-700 mb-1">
                  Distrik (Kabupaten Mimika) <span className="text-rose-600">*</span>
                </label>
                <select
                  id="distrik"
                  name="distrik"
                  value={formData.distrik}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.distrik}
                  aria-describedby={errors.distrik ? "error-distrik" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.distrik ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                >
                  <option value="">-- Pilih Distrik --</option>
                  <option value="Kuala Kencana">Kuala Kencana</option>
                  <option value="Kwamki Narama">Kwamki Narama</option>
                  <option value="Tembagapura">Tembagapura</option>
                  <option value="Agimuga">Agimuga</option>
                  <option value="Mimika Baru">Mimika Baru</option>
                  <option value="Mimika Timur">Mimika Timur</option>
                </select>
                {errors.distrik && (
                  <p id="error-distrik" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.distrik}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="kampung" className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Kampung / Dusun <span className="text-rose-600">*</span>
                </label>
                <input
                  id="kampung"
                  name="kampung"
                  type="text"
                  value={formData.kampung}
                  onChange={handleInputChange}
                  placeholder="Contoh: Utikini, Harapan"
                  aria-invalid={!!errors.kampung}
                  aria-describedby={errors.kampung ? "error-kampung" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.kampung ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.kampung && (
                  <p id="error-kampung" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.kampung}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="luasHektar" className="block text-xs font-semibold text-stone-700 mb-1">
                  Luas Wilayah (Hektar) <span className="text-rose-600">*</span>
                </label>
                <input
                  id="luasHektar"
                  name="luasHektar"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.luasHektar}
                  onChange={handleInputChange}
                  placeholder="Misal: 15.5"
                  aria-invalid={!!errors.luasHektar}
                  aria-describedby={errors.luasHektar ? "error-luasHektar" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.luasHektar ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.luasHektar && (
                  <p id="error-luasHektar" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.luasHektar}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="peruntukan" className="block text-xs font-semibold text-stone-700 mb-1">
                  Peruntukan Lahan Adat <span className="text-rose-600">*</span>
                </label>
                <input
                  id="peruntukan"
                  name="peruntukan"
                  type="text"
                  value={formData.peruntukan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Hutan Ulayat, Kebun Sagu, Pemukiman"
                  aria-invalid={!!errors.peruntukan}
                  aria-describedby={errors.peruntukan ? "error-peruntukan" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.peruntukan ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.peruntukan && (
                  <p id="error-peruntukan" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.peruntukan}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="titikKoordinat" className="block text-xs font-semibold text-stone-700 mb-1">
                  Titik Patok / Koordinat GPS <span className="text-rose-600">*</span>
                </label>
                <input
                  id="titikKoordinat"
                  name="titikKoordinat"
                  type="text"
                  value={formData.titikKoordinat}
                  onChange={handleInputChange}
                  placeholder={'Contoh: 4°25\'12"S 136°52\'45"E atau Patok Batu Kali Kopi'}
                  aria-invalid={!!errors.titikKoordinat}
                  aria-describedby={errors.titikKoordinat ? "error-titikKoordinat" : undefined}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.titikKoordinat ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.titikKoordinat && (
                  <p id="error-titikKoordinat" role="alert" className="text-[11px] text-rose-600 mt-1">
                    {errors.titikKoordinat}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Bagian 3: Batas 4 Penjuru Mata Angin */}
          <fieldset className="border-b border-stone-100 pb-6">
            <legend className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
              3. Batas Wilayah Adat Empat Penjuru
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="batasUtara" className="block text-xs font-semibold text-stone-700 mb-1">
                  Batas Bagian Utara <span className="text-rose-600">*</span>
                </label>
                <input
                  id="batasUtara"
                  name="batasUtara"
                  type="text"
                  value={formData.batasUtara}
                  onChange={handleInputChange}
                  placeholder="Contoh: Sungai Iwaka / Tebing"
                  aria-invalid={!!errors.batasUtara}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.batasUtara ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.batasUtara && <p className="text-[11px] text-rose-600 mt-1">{errors.batasUtara}</p>}
              </div>

              <div>
                <label htmlFor="batasSelatan" className="block text-xs font-semibold text-stone-700 mb-1">
                  Batas Bagian Selatan <span className="text-rose-600">*</span>
                </label>
                <input
                  id="batasSelatan"
                  name="batasSelatan"
                  type="text"
                  value={formData.batasSelatan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jalan Rintisan Kampung"
                  aria-invalid={!!errors.batasSelatan}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.batasSelatan ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.batasSelatan && <p className="text-[11px] text-rose-600 mt-1">{errors.batasSelatan}</p>}
              </div>

              <div>
                <label htmlFor="batasTimur" className="block text-xs font-semibold text-stone-700 mb-1">
                  Batas Bagian Timur <span className="text-rose-600">*</span>
                </label>
                <input
                  id="batasTimur"
                  name="batasTimur"
                  type="text"
                  value={formData.batasTimur}
                  onChange={handleInputChange}
                  placeholder="Contoh: Batas Marga Omaleng"
                  aria-invalid={!!errors.batasTimur}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.batasTimur ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.batasTimur && <p className="text-[11px] text-rose-600 mt-1">{errors.batasTimur}</p>}
              </div>

              <div>
                <label htmlFor="batasBarat" className="block text-xs font-semibold text-stone-700 mb-1">
                  Batas Bagian Barat <span className="text-rose-600">*</span>
                </label>
                <input
                  id="batasBarat"
                  name="batasBarat"
                  type="text"
                  value={formData.batasBarat}
                  onChange={handleInputChange}
                  placeholder="Contoh: Kali Kopi Hulu"
                  aria-invalid={!!errors.batasBarat}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.batasBarat ? "border-rose-500 focus:ring-rose-400" : "border-stone-300 focus:ring-amber-500"
                  }`}
                />
                {errors.batasBarat && <p className="text-[11px] text-rose-600 mt-1">{errors.batasBarat}</p>}
              </div>
            </div>
          </fieldset>

          {/* Bagian 4: Unggah Berkas Bukti Fisik */}
          <fieldset className="border-b border-stone-100 pb-6">
            <legend className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
              4. Dokumen Bukti Fisik & Foto Patok
            </legend>

            <div>
              <label htmlFor="fileBukti" className="block text-xs font-semibold text-stone-700 mb-1">
                Pilih Berkas Bukti (PDF, JPG, PNG) <span className="text-rose-600">*</span>
              </label>
              <input
                id="fileBukti"
                name="fileBukti"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                aria-invalid={!!errors.namaBerkas}
                aria-describedby={errors.namaBerkas ? "error-berkas" : undefined}
                className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
              />
              {formData.namaBerkas && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-emerald-800 font-medium">
                    ✓ Berkas terpilih: <span className="font-mono">{formData.namaBerkas}</span>
                  </p>
                  {isHashingFile ? (
                    <p className="text-[11px] text-amber-800 animate-pulse">
                      ⏳ Menghitung sidik jari SHA-256 di browser...
                    </p>
                  ) : fileHash ? (
                    <div className="p-2 bg-stone-900 text-stone-200 rounded font-mono text-[11px] break-all border border-stone-800">
                      <span className="text-stone-400 block text-[10px]">Sidik Jari SHA-256 (Web Crypto):</span>
                      {fileHash}
                    </div>
                  ) : null}
                </div>
              )}
              {errors.namaBerkas && (
                <p id="error-berkas" role="alert" className="text-[11px] text-rose-600 mt-1">
                  {errors.namaBerkas}
                </p>
              )}
            </div>
          </fieldset>

          {/* Bagian 5: Pernyataan Adat & Submit */}
          <div>
            <div className="flex items-start gap-2 mb-4">
              <input
                id="pernyataanAdat"
                name="pernyataanAdat"
                type="checkbox"
                checked={formData.pernyataanAdat}
                onChange={handleInputChange}
                aria-invalid={!!errors.pernyataanAdat}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-800 focus:ring-amber-500"
              />
              <label htmlFor="pernyataanAdat" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
                Saya menyatakan bahwa data batas tanah yang didaftarkan adalah sah berdasarkan musyawarah adat
                keluarga ulayat, dan bersedia diverifikasi oleh tetua adat serta dicatat sidik jarinya secara permanen.
              </label>
            </div>
            {errors.pernyataanAdat && (
              <p role="alert" className="text-[11px] text-rose-600 mb-4">
                {errors.pernyataanAdat}
              </p>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Simpan & Kunci Bukti Kriptografi
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
