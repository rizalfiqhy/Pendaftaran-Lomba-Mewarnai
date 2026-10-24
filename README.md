# Panduan Deployment & Arsitektur: Web Pendaftaran Lomba Mewarnai Kreatif 1448 H

Aplikasi Web Mobile Pendaftaran Kolektif **Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan** (Semarak Haflah Al Milad & Akhir As Sanah 1448 H) berbasis **Frontend Google Apps Script (HTML Service)** dan **Backend Google Spreadsheet**.

Dokumen ini disusun berdasarkan spesifikasi resmi pada `prd.md` dan `design.md`.

---

## 1. Struktur Berkas Proyek (`/gas`)

| Nama Berkas | Tipe | Deskripsi & Peran |
|---|---|---|
| `Code.gs` | Server-side Script | Router utama `doGet()`, endpoint publik (`getPublicConfig`, `submitRegistration`, `getReceiptPdf`, `getPublicParticipants`), dan inisialisasi sheet `initSpreadsheet()`. |
| `Admin.gs` | Server-side Script | Logika Panel Admin, verifikasi hak akses `assertAdmin()`, dasbor analitik, edit pendaftaran ("edit apa pun"), hapus pendaftaran, tambah manual, ekspor data absensi, pengaturan buka-tutup, dan catatan riwayat perubahan. |
| `Util.gs` | Server-side Script | Keamanan (anti CSV/formula injection, HTML escape), normalisasi teks otomatis huruf kapital, validasi berjenjang (nama kosong, nama kembar, nomor WA), penomoran `MWR-xxx`, dan penguncian konkurensi (`LockService`). |
| `Pdf.gs` | Server-side Script | Generator berkas PDF Bukti Pendaftaran Resmi A4 dengan kop resmi Haflah (logo transparan, pita emas muda, garis ganda, penataan 1 atau 2 kolom nama peserta). |
| `LogoData.gs` | Server-side Script | Data gambar logo Haflah resolusi tinggi dalam format base64 bawaan, memastikan generator PDF langsung berfungsi tanpa ketergantungan jaringan eksternal. |
| `Index.html` | Client-side HTML/JS | Aplikasi Web Mobile Publik (Single Page Application): Beranda, Hitung Mundur Realtime WIB, Formulir 4 Langkah dengan indikator 4 Krayon, Tempel Banyak Nama, Halaman Sukses + Unduh PDF langsung, Direktori Daftar Peserta Publik (pencarian, filter, accordion), Halaman Info Juknis, dan Kondisi Ditutup. |
| `Admin.html` | Client-side HTML/JS | Panel Admin Lengkap & Responsif (HP & Laptop): Dasbor KPI 4 kartu, diagram sebaran desa, tabel/kartu pendaftaran, modal edit apa pun dengan konfirmasi peringatan, hapus pendaftaran aman, tambah manual, ekspor CSV/Cetak absensi meja, formulir pengaturan sistem, dan log audit. |
| `appsscript.json` | Manifest | Konfigurasi runtime Google Apps Script V8 dengan zona waktu `Asia/Jakarta`. |

---

## 2. Langkah-Langkah Deployment ke Google Spreadsheet & Apps Script

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Drive](https://drive.google.com).
2. Buat Spreadsheet baru, beri nama: `Database Lomba Mewarnai Haflah 1448 H`.

### Langkah 2: Buka Apps Script Editor
1. Pada Google Spreadsheet tersebut, klik menu **Ekstensi** > **Apps Script**.
2. Editor skrip akan terbuka di tab baru.

### Langkah 3: Salin Seluruh Berkas dari Folder `/gas`
Buat berkas pada editor Apps Script sesuai dengan nama dan jenis berkas di folder `/gas`:
1. **Berkas Skrip (.gs):**
   - Buat `Code.gs` -> Salin seluruh isi dari `gas/Code.gs`.
   - Buat `Admin.gs` -> Salin seluruh isi dari `gas/Admin.gs`.
   - Buat `Util.gs` -> Salin seluruh isi dari `gas/Util.gs`.
   - Buat `Pdf.gs` -> Salin seluruh isi dari `gas/Pdf.gs`.
   - Buat `LogoData.gs` -> Salin seluruh isi dari `gas/LogoData.gs`.
2. **Berkas HTML (.html):**
   - Buat `Index.html` -> Salin seluruh isi dari `gas/Index.html`.
   - Buat `Admin.html` -> Salin seluruh isi dari `gas/Admin.html`.
3. **Setel Manifest `appsscript.json`:**
   - Pada editor Apps Script, klik ikon roda gigi **Project Settings** (Pengaturan Proyek) di bilah kiri.
   - Centang opsi **Show "appsscript.json" manifest file in editor**.
   - Buka berkas `appsscript.json` di editor dan pastikan isinya sama dengan `gas/appsscript.json` (terutama `timeZone: "Asia/Jakarta"`).

### Langkah 4: Jalankan Inisialisasi Otomatis (`initSpreadsheet`)
1. Di bagian atas editor Apps Script, pilih fungsi **`initSpreadsheet`** dari dropdown pilihan fungsi.
2. Klik tombol **Run (Jalankan)**.
3. Google akan meminta persetujuan otorisasi pertama kali:
   - Klik **Review Permissions** (Tinjau Izin).
   - Pilih akun Google Anda.
   - Klik **Advanced** (Lanjutan) > Klik **Go to project (unsafe)**.
   - Klik **Allow** (Izinkan).
4. Skrip akan berjalan dan secara otomatis membuat 4 sheet di Google Spreadsheet Anda dengan header rapi dan warna khas pondok hijau:
   - Sheet `Pendaftaran` (11 kolom data lembaga & koordinator)
   - Sheet `Peserta` (3 kolom relasi nama anak per kode)
   - Sheet `Pengaturan` (Konfigurasi awal jadwal, juknis, desa, kontak WA, kop surat)
   - Sheet `Riwayat` (Log audit perubahan data)

### Langkah 5: Konfigurasi Script Properties (Pengaturan Skrip)
1. Pada menu bilah kiri editor Apps Script, klik **Project Settings** (ikon roda gigi).
2. Gulir ke bawah ke bagian **Script Properties** (Properti Skrip).
3. Pastikan properti berikut tersedia:
   - `ADMIN_EMAIL`: Masukkan alamat email Gmail admin (misal: `admin@haflah.id` atau Gmail pribadi panitia yang bertugas).
   - `COUNTER`: Otomatis terisi `0` oleh `initSpreadsheet()`.
   - `LOGO_FILE_ID` (Opsional): ID berkas logo di Google Drive jika ingin mengganti logo di kemudian hari. Jika dikosongkan, sistem otomatis memakai logo resmi bawaan pada `LogoData.gs`.

### Langkah 6: Publikasikan Web App (Deploy)
1. Di sudut kanan atas editor Apps Script, klik tombol **Deploy** > **New deployment** (Penerapan Baru).
2. Klik ikon gerigi di sebelah *Select type*, pilih **Web app**.
3. Isi konfigurasi deployment:
   - **Description**: `Web Pendaftaran Lomba Mewarnai v1.0`
   - **Execute as**: `Me (email pemilik skrip)`
   - **Who has access**: `Anyone (Siapa saja)`
4. Klik **Deploy**.
5. Salin tautan **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).

---

## 3. Akses Halaman Web

- **Halaman Pendaftaran Publik (Koordinator Sekolah / Peserta):**
  Akses langsung tautan Web App URL:
  ```
  https://script.google.com/macros/s/.../exec
  ```
  *Fitur: Beranda dengan countdown waktu WIB, pendaftaran 4 langkah dengan motif 4 krayon, tempel nama dari WhatsApp, unduh bukti PDF resmi seketika, dan cek nama di menu Daftar Peserta.*

- **Panel Admin Resmi:**
  Tambahkan parameter `?page=admin` di akhir URL:
  ```
  https://script.google.com/macros/s/.../exec?page=admin
  ```
  *Fitur: Dasbor statistik, edit dan hapus data apa pun, tambah pendaftaran manual, cetak ulang PDF, ekspor data absensi CSV/A4, ubah buka-tutup pendaftaran, dan cek riwayat audit.*
  *(Hak akses diproteksi di server; hanya akun yang cocok dengan `ADMIN_EMAIL` yang dapat melakukan tindakan admin).*

---

## 4. Matriks Pengujian & Kriteria Penerimaan (Berdasarkan PRD Bagian 12)

| No | Kriteria Uji | Hasil Verifikasi Sistem |
|---|---|---|
| 1 | Pendaftaran 1 s/d 100 peserta menghasilkan kode `MWR-001`, `MWR-002`, dst. | **Terpenuhi:** Counter inkremental otomatis dengan format `MWR-` + 3 digit. |
| 2 | Pengiriman serentak tidak menghasilkan kode ganda. | **Terpenuhi:** Penguncian konkurensi dengan `LockService.getScriptLock()` waktu tunggu 30 detik. |
| 3 | Tombol kirim tertekan berulang atau sinyal putus tidak menggandakan data. | **Terpenuhi:** Idempotensi via `request_id` unik pada setiap formulir. |
| 4 | Nama kosong atau nama kembar ditolak dengan menyebutkan nomor barisnya. | **Terpenuhi:** Validasi interaktif di HP dan validasi ketat di server dengan pesan presisi (contoh: "Nama anak nomor 7 belum diisi"). |
| 5 | Huruf kecil otomatis tersimpan sebagai huruf kapital. | **Terpenuhi:** Atribut `autocapitalize="characters"` di HP dan normalisasi `toUpperCaseClean()` di server sebelum disimpan ke Sheets. |
| 6 | Karakter tanda kutip, apostrof, atau formula injection diawali `=`, `+`, `-`, `@` aman. | **Terpenuhi:** Sanitasi `sanitizeFormulaInjection()` dengan penambahan petik tunggal dan proteksi `escapeHtml()`. |
| 7 | Penutupan otomatis mengikuti waktu server WIB, mengabaikan jam HP pengguna. | **Terpenuhi:** Evaluasi status selalu dilakukan di server dengan zona waktu `Asia/Jakarta`. |
| 8 | Mode Tutup Manual dan Buka Manual dapat menimpa tenggat otomatis. | **Terpenuhi:** 3 mode pendaftaran (Otomatis, Buka manual, Tutup manual) dapat diatur admin kapan saja. |
| 9 | Unduh PDF memuat kop resmi buatan sendiri dan penataan nama rapi. | **Terpenuhi:** Menggunakan tabel HTML standar konversi PDF Apps Script dengan tata letak 1 kolom (<= 30 anak) atau 2 kolom (> 30 anak). |
| 10 | Admin dapat mengedit apa pun (termasuk kode, jumlah anak, nama koordinator). | **Terpenuhi:** Disediakan tombol "Tetap Simpan" pada peringatan validasi admin dan seluruh riwayat tersimpan di sheet `Riwayat`. |
| 11 | Penghapusan pendaftaran tidak menggunakan ulang nomor kode yang dihapus. | **Terpenuhi:** Counter tidak pernah berkurang saat data dihapus; pendaftar baru tetap melanjutkan nomor urut berikutnya. |
| 12 | Privasi publik terlindungi pada halaman Daftar Peserta. | **Terpenuhi:** Fungsi `getPublicParticipants()` hanya mengirim nama anak, lembaga, jenis, desa, dan kode. Nomor WA dan nama koordinator tidak pernah dikirim ke umum. |
| 13 | Responsif pada berbagai ukuran layar HP (mulai 360px). | **Terpenuhi:** Menggunakan Tailwind CSS responsif dengan padding aman (`safe-area-inset`) dan target sentuh minimal 48px. |
| 14 | Saklar sembunyikan Daftar Peserta. | **Terpenuhi:** Admin dapat menyembunyikan menu dan server otomatis menolak permintaan data jika saklar dimatikan. |
