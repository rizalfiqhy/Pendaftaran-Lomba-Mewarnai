# Panduan Deployment & Arsitektur: Web Pendaftaran Lomba Mewarnai Kreatif 1448 H

Aplikasi Web Mobile Pendaftaran Kolektif **Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan** (Semarak Haflah Al Milad 104 & Akhir As Sanah 1448 H / 2027 M) berbasis **Frontend Google Apps Script (HTML Service)** dan **Backend Google Spreadsheet**.

Dokumen ini disusun dan diperbarui berdasarkan spesifikasi pada `prd.md` dan `design.md` (Versi 2.2 — 28 Oktober 2026).

---

## 1. Struktur Berkas Proyek

Semua berkas proyek berada langsung di dalam direktori kerja:

| Nama Berkas | Tipe | Deskripsi & Peran Utama |
|---|---|---|
| `Code.gs` | Server Script | Router utama `doGet()`, endpoint publik (`getPublicConfig`, `submitRegistration`, `getReceiptPdf`, `getPublicParticipants`), inisialisasi sheet `initSpreadsheet()`, dan penyiapan PIN Admin default (`123456`). |
| `AdminService.gs` | Server Script | Layanan Panel Admin Resmi: Verifikasi keamanan PIN Admin (`verifyAdminPin`, `updateAdminPin`, `assertAdmin`), dasbor statistik, CRUD pendaftaran ("edit apa pun"), hapus data, tambah manual, ekspor data, pengaturan sistem, dan log audit. |
| `Util.gs` | Server Script | Utilitas keamanan (anti CSV/formula injection, escape HTML), kapitalisasi otomatis huruf kapital, validasi berjenjang (nama kosong, nama kembar, nomor WA), penomoran inkremental `MWR-xxx`, dan penguncian konkurensi (`LockService`). |
| `Pdf.gs` | Server Script | Generator berkas PDF A4 Portrait resmi dengan Kop 2 Logo (Kiri: Yayasan Yasinat, Kanan: Haflah 104): Bukti Pendaftaran, Daftar Hadir Koordinator Lembaga (Opsi A), dan Daftar Hadir Peserta per Lembaga (Opsi B). |
| `LogoData.gs` | Server Script | Penyimpanan data gambar logo resmi format base64 bawaan: Logo Haflah 104 (`DEFAULT_LOGO_BASE64`) dan Logo Yayasan Yasinat (`DEFAULT_LOGO_YASINAT_BASE64`), memastikan PDF selalu dapat dibuat tanpa ketergantungan jaringan luar. |
| `Index.html` | Client HTML/JS | Web Mobile Publik (Single Page Application): Beranda hitung mundur realtime WIB, formulir pendaftaran 4 langkah dengan pembersihan nama otomatis, tempel nama dari WhatsApp, halaman sukses + unduh bukti pendaftaran, direktori peserta publik, dan halaman info juknis. |
| `AdminPage.html` | Client HTML/JS | Panel Admin Lengkap & Responsif: Dilindungi modal Lock Screen PIN Admin, navigasi kartu sidebar kontras tinggi, dasbor statistik KPI, tabel pendaftaran + tombol reset ke 0, modal edit apa pun, ekspor Excel (.xlsx SheetJS) & absensi A4, serta log audit. |
| `appsscript.json` | Manifest | Konfigurasi runtime Google Apps Script V8 dengan zona waktu resmi `Asia/Jakarta`. |
| `logo-haflah-256.png` | Asset Gambar | Logo resmi Haflah 104 Yasinat (resolusi 256x256). |
| `logo-yasinat-256.png` | Asset Gambar | Logo resmi Yayasan Islam Nahdlatuth Thalabah Yasinat (resolusi 256x256). |

---

## 2. Fitur Utama Sistem Terkini

### A. Keamanan & Akses Panel Admin
1. **Proteksi PIN Admin 6 Digit (Default: `123456`):**
   - Saat membuka URL `?page=admin`, halaman terkunci otomatis dengan modal Lock Screen modern berlatar belakang *backdrop-blur*.
   - Hanya pengguna yang memasukkan PIN yang benar yang dapat melihat dasbor dan data peserta.
   - Sesi PIN disimpan aman di `sessionStorage` per tab browser.
   - Tersedia tombol **Kunci Admin** di sudut bawah sidebar untuk mengunci kembali panel kapan saja.
   - Admin dapat mengganti nomor PIN sewaktu-waktu di menu **Pengaturan Sistem**.

### B. Antarmuka Modern & Banner Rotator (Versi 2.2)
1. **Tipografi Modern Bersama (Plus Jakarta Sans):**
   - Font Google Fonts *Plus Jakarta Sans* diterapkan penuh pada antarmuka publik (`Index.html`) dan panel admin (`AdminPage.html`).
2. **Efek Visual & Animasi Lembut:**
   - Shimmer sweep effect pada tombol aksi utama (*Call to Action*).
   - Animasi transisi halus saat perpindahan halaman/layar.
   - Efek hujan konfeti digital perayaan pada halaman sukses pendaftaran.
3. **Banner Rotator 5 Slide & Link Pemesanan Produk:**
   - Slider karusel otomatis (setiap 4,5 detik) di bagian bawah beranda publik untuk menampilkan produk/merchandise resmi panitia.
   - Dilengkapi navigasi sentuh (touch swipe mobile), tombol panah, dan indikator titik.
   - Tombol **"Pesan Sekarang"** dengan link website pemesanan atau kontak pemesanan yang dapat diatur dari Panel Admin.
   - Memiliki 5 template visual bawaan estetik jika admin belum memasukkan link gambar khusus.

### C. Formulir Pendaftaran Publik
1. **Langkah 1 (Lembaga):** Pilihan jenis (TKM/RA), nama lembaga, dan dropdown 7 desa di Kecamatan Wuluhan.
2. **Langkah 2 (Peserta):** Stepper jumlah peserta, fitur tempel banyak nama dari WhatsApp, dan baris isian dengan label bersih **"Nama Lengkap Peserta"**.
3. **Pembersihan Draf Otomatis:** Kolom nama peserta **selalu kosong bersih** saat membuka pendaftaran baru (mencegah pengisian otomatis nama peserta lama).
4. **Langkah 3 (Koordinator):** Label bersih **"Nama Koordinator"** dan nomor WhatsApp koordinator.
5. **Langkah 4 (Periksa & Konfirmasi):** Ringkasan isian, tombol kirim dengan pengaman idempotensi (`request_id`), dan tombol hijau **"Unduh Bukti Pendaftaran"**.

### D. Dokumen Resmi PDF A4 Portrait (Kop 2 Logo)
1. **Kop Surat Lembaga:**
   - **Sebelah Kiri:** Logo Resmi Yayasan Islam Nahdlatuth Thalabah (YASINAT) segilima hijau.
   - **Bagian Tengah:** Teks Kop resmi Panitia Haflah dan Yayasan.
   - **Sebelah Kanan:** Logo Resmi Haflah 104 Yasinat (spiral hijau-emas).
2. **Lembar Bukti Pendaftaran A4:**
   - Judul dokumen: **`BUKTI PENDAFTARAN`** (kata *RESMI* dihapus).
   - Teks header tabel nama peserta diposisikan rata tengah (*center*).
   - Ukuran font nama peserta dinaikkan menjadi 11px bold agar jelas terbaca saat dicetak.
   - Kotak informasi waktu dan lokasi pelaksanaan dipertahankan rapi pada ukuran aslinya.
3. **Daftar Hadir Koordinator Lembaga (Opsi A - A4 Portrait):**
   - Subjudul: *Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan*.
   - Seluruh teks header kolom tabel diposisikan rata tengah (*center*).
   - Kolom TTD: Lurus rata kiri (`1. .....................`, `2. .....................`), tidak zigzag, lebar pas 85px.
   - Kolom No. WA: Lebar 80px, format nomor selalu diawali `08`.
   - Kolom Jumlah: Header diubah menjadi **`JUMLAH`** (sebelumnya `SANTRI`), lebar 36px.
   - Kolom Kode: Menggunakan font standar yang sama dengan kolom lainnya (Arial/sans-serif).
   - Baris Total: Teks `TOTAL KESELURUHAN` di tengah, dengan rincian format: **`[Jumlah] (TKM : ...  RA : ...)`**.
   - Tanda tangan panitia pelaksana di sudut kanan bawah diperbesar menjadi 11px bold.
4. **Daftar Hadir Peserta per Lembaga (Opsi B - A4 Portrait):**
   - Dikelompokkan rapi per lembaga dengan banner hijau toska, daftar nama santri, dan kolom TTD lurus rata kiri.

### D. Panel Pengelolaan & Ekspor Data Admin
1. **Navigasi Sidebar Kontras Tinggi:** Tombol navigasi menu didesain menggunakan kartu terstruktur dengan teks gelap tegas (`#1F2937`) dan tombol aktif hijau pondok solid (`#005E39`), bebas dari kendala tulisan putih di atas latar putih.
2. **Tombol Reset ke 0:** Fitur untuk membersihkan database dan memulai kembali penomoran pendaftaran dari awal (`MWR-001`) dengan proteksi konfirmasi pengetikan kata `"RESET"`.
3. **Ekspor Microsoft Excel Asli (`.xlsx`):** Menggunakan SheetJS, menghasilkan berkas Excel berformat rapi dengan 2 sheet (*Data Peserta Lengkap* dan *Rekap Lembaga*), lebar kolom otomatis, dan nomor WhatsApp aman (angka `0` di awal tidak terhapus).
4. **Unduh PDF Langsung di Kolom Aksi:** Tombol `PDF` di samping tombol `Edit` pada setiap baris pendaftaran untuk mencetak ulang bukti pendaftaran seketika.

---

## 3. Langkah-Langkah Deployment ke Google Apps Script

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Drive](https://drive.google.com).
2. Buat Spreadsheet baru, beri nama: `Database Lomba Mewarnai Haflah 1448 H`.

### Langkah 2: Buka Apps Script Editor
1. Pada Google Spreadsheet tersebut, klik menu **Ekstensi** > **Apps Script**.
2. Editor skrip akan terbuka di tab baru.

### Langkah 3: Salin Berkas Proyek ke Editor Apps Script
Buat berkas pada editor Apps Script sesuai dengan nama berikut dan tempel isinya dari proyek lokal:
1. **Berkas Skrip (.gs):**
   - `Code.gs`
   - `AdminService.gs`
   - `Util.gs`
   - `Pdf.gs`
   - `LogoData.gs`
2. **Berkas HTML (.html):**
   - `Index.html`
   - `AdminPage.html`
3. **Setel Manifest `appsscript.json`:**
   - Klik ikon roda gigi **Project Settings** di bilah kiri.
   - Centang opsi **Show "appsscript.json" manifest file in editor**.
   - Buka berkas `appsscript.json` dan pastikan parameternya sama (zona waktu: `Asia/Jakarta`).

### Langkah 4: Jalankan Inisialisasi Otomatis (`initSpreadsheet`)
1. Di bagian atas editor Apps Script, pilih fungsi **`initSpreadsheet`** dari dropdown pilihan fungsi.
2. Klik tombol **Run (Jalankan)** dan berikan izin otorisasi Google yang diminta.
3. Skrip otomatis menyiapkan 4 sheet: `Pendaftaran`, `Peserta`, `Pengaturan` (dengan default PIN `123456`), dan `Riwayat`.

### Langkah 5: Publikasikan Web App (Deploy)
1. Klik tombol **Deploy** > **New deployment** (Penerapan Baru).
2. Pilih jenis **Web app**.
3. Konfigurasi:
   - **Execute as**: `Me (email pemilik skrip)`
   - **Who has access**: `Anyone (Siapa saja)`
4. Klik **Deploy** dan salin URL Web App yang dihasilkan.

---

## 4. Akses URL Halaman Web

* **Halaman Pendaftaran Publik:**
  ```
  https://script.google.com/macros/s/.../exec
  ```
* **Panel Admin Resmi:**
  ```
  https://script.google.com/macros/s/.../exec?page=admin
  ```
  *(Masukkan PIN default `123456` saat pertama kali membuka).*
