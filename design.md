# Design: Web Pendaftaran Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan

Versi 2.2 (Terverifikasi & Diperbarui) | 28 Oktober 2026  
Dokumen pendamping: `prd.md` (aturan dan kebutuhan bisnis).

---

## 1. Arah Desain & Identitas Visual

* **Subjek:** Pendaftaran kolektif lomba mewarnai anak TKM & RA se-Kecamatan Wuluhan dalam rangka Semarak Haflah Al Milad 104 & Akhir As Sanah 1448 H / 2027 M PPTQ BUQ YASINAT.
* **Gaya Visual:** Perpaduan nuansa islami pondok pesantren (Hijau Tua & Emas) dengan keceriaan dunia anak (krayon & kertas gambar).
* **Indikator Langkah:** 4 krayon berwarna cerah yang responsif menunjukkan progres pendaftaran (1. Lembaga, 2. Peserta, 3. Kontak, 4. Periksa).
* **Prinsip Utama:**
  1. *Mobile First & Single Column:* Sangat nyaman dioperasikan dari layar ponsel Android (mulai 360px) hingga layar komputer.
  2. *Kontras & Keterbacaan Tinggi:* Teks tegas, target sentuh minimal 48px, dan pencegahan masalah warna teks putih di atas latar putih.
  3. *Validasi Presisi:* Pesan kesalahan interaktif langsung menyebut nomor baris dan petunjuk perbaikan.
  4. *Keamanan Berlapis:* Proteksi PIN 6 digit untuk panel admin dan sanitasi formula injection pada spreadsheet.

---

## 2. Token Desain (Design Tokens)

### Warna Tema Utama

| Nama Token | Kode Hex | Peran & Penggunaan |
|---|---|---|
| **Hijau Pondok** | `#005E39` | Warna primer resmi: tombol aksi utama, header brand, tab navigasi aktif, dan bingkai kop surat. |
| **Hijau Daun** | `#E7F2E9` | Latar belakang status 'Dibuka', sorotan hover, dan kartu ringkasan. |
| **Emas Kop** | `#EEB92B` | Aksen garis pembatas ganda dan hiasan bintang pada logo yayasan. |
| **Emas Tua** | `#8A6D10` | Tulisan baris kedua kop surat (*Yayasan Islam Nahdlatuth Thalabah*). |
| **Tinta Gelap** | `#1C2A21` / `#1F2937` | Teks utama, judul bagian, dan isian tabel agar terbaca tegas dan pekat. |
| **Kertas** | `#FAFCFA` / `#FFFFFF` | Latar belakang halaman dan formulir. |
| **Garis / Border** | `#CBD8CE` / `#E5E7EB` | Garis pembatas kartu, sel tabel, dan kolom input. |
| **Merah Koreksi** | `#B42318` | Notifikasi error validasi dan status 'Ditutup'. |

### Tipografi
* **Font Utama Sistem:** `Plus Jakarta Sans` (bobot 400, 500, 600, 700, 800) diterapkan secara seragam dan konsisten pada seluruh antarmuka publik (`Index.html`) dan panel admin (`AdminPage.html`). Font ini memberikan tampilan modern, profesional, lembut, dan memiliki tingkat keterbacaan (*legibility*) yang sangat tinggi baik di layar HP maupun layar desktop.

---

## 3. Alur Layar Publik (`Index.html`)

1. **Beranda & Countdown (Modern Revamp):**
   - Header hero bergradasi lembut dengan badge status pendaftaran, judul "Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan", 4 aksen krayon, dan deskripsi "Pasangan kreatif ibu dan anak".
   - Kartu hitung mundur waktu penutupan realtime WIB.
   - Tombol utama "Daftar Sekarang" beranimasi shimmer sweep dan info "Biaya Pendaftaran: 100% Gratis".
   - Grid 4 informasi lomba: Tanggal, Lokasi, Peserta ("Ibu dan anak perwakilan lembaga TKM & RA"), dan Biaya.
   - **Banner Rotator 5 Slide Resmi:** Karusel produk/merchandise panitia di bagian paling bawah beranda dengan auto-play (4,5 detik), navigasi panah & dots, gesture swipe sentuh di HP, dan tombol aksi "Pesan Sekarang" yang mengarah ke link pesanan yang diatur di panel admin.
2. **Formulir Langkah 1 (Data Lembaga):**
   - Pemilihan jenis lembaga (TKM / RA), input nama lembaga (otomatis kapital), dan pilihan 7 desa di Kecamatan Wuluhan.
3. **Formulir Langkah 2 (Daftar Peserta):**
   - Stepper penambah/pengurang jumlah peserta.
   - Panel lipat-buka *Tempel Banyak Nama Sekaligus* dari WhatsApp.
   - Kolom nama dengan label **"Nama Lengkap Peserta"** yang selalu di-reset bersih kosong pada setiap sesi pendaftaran baru.
4. **Formulir Langkah 3 (Kontak Koordinator):**
   - Kolom input **"Nama Koordinator"** dan nomor WhatsApp (otomatis membersihkan karakter non-angka).
5. **Formulir Langkah 4 (Periksa & Konfirmasi):**
   - Tinjauan seluruh data sebelum dikirim dengan tombol kembali dan tombol kirim pendaftaran (idempotensi via `request_id`).
6. **Halaman Sukses & Unduh:**
   - Animasi kode pendaftaran `MWR-xxx` dan tombol hijau **"Unduh Bukti Pendaftaran"**.
7. **Direktori Daftar Peserta Publik:**
   - Menampilkan daftar lembaga terdaftar dengan pencarian interaktif dan accordion nama peserta (privasi terjaga: nama koordinator dan nomor WA tidak ditampilkan).

---

## 4. Arsitektur Panel Admin (`AdminPage.html`)

### A. Mekanisme Keamanan PIN Admin
* **Modal Lock Screen (`#admin-lock-screen`):**
  - Mengunci seluruh tampilan admin di latar belakang dengan efek *backdrop-blur*.
  - Menampilkan logo Haflah 104, instruksi PIN, input password font mono besar, dan tombol *Buka Panel Admin*.
  - PIN default: **`123456`** (diverifikasi langsung ke server via `verifyAdminPin`).
  - Setelah berhasil, status disimpan di `sessionStorage` per tab browser.
* **Tombol Kunci di Sidebar:**
  - Terletak pada kartu akun admin di sudut bawah sidebar untuk mengunci kembali panel sewaktu-waktu.
* **Ganti PIN Mandiri:**
  - Kartu khusus di menu *Pengaturan Sistem* untuk memperbarui nomor PIN admin kapan saja.

### B. Styling Navigasi Sidebar Kontras Tinggi
* Tombol navigasi menu didefinisikan secara eksplisit menggunakan CSS class `.nav-btn` dan `.nav-btn.active`:
  - **Menu Tidak Aktif:** Berbentuk kartu terstruktur abu-abu muda (`#F9FAFB`), berbingkai (`#E5E7EB`), dengan teks abu-abu gelap (`#1F2937 !important`).
  - **Menu Aktif:** Berwarna hijau pondok solid (`#005E39 !important`) dengan teks putih tebal (`#FFFFFF !important`) dan bayangan lembut.
  - Menjamin tombol menu tidak akan pernah menjadi putih di atas latar putih.

### C. Fitur Pengelolaan Data
1. **Dasbor KPI:** 4 kartu metrik utama (Total Lembaga, Total Santri, Rasio TKM/RA, Status Sistem) dan grafik batang per desa.
2. **Data Pendaftaran & Tombol Reset ke 0:**
   - Tabel responsif dilengkapi fitur pencarian, filter desa, dan tombol aksi per baris (`PDF`, `Edit`, `Hapus`).
   - Tombol **Reset ke 0** dengan dialog konfirmasi ketik kata `"RESET"` untuk mengosongkan data ujicoba dan mengembalikan nomor ke `MWR-001`.
3. **Ekspor Data & Absensi:**
   - Tabel pratinjau data interaktif langsung di layar.
   - Tombol **Unduh Rekap Excel (.xlsx)** berbasis SheetJS dengan 2 lembar kerja (*Data Peserta Lengkap* dan *Rekap Lembaga*).
   - Tombol **Unduh Daftar Hadir Koordinator (PDF A4)** dan **Unduh Daftar Hadir Peserta (PDF A4)**.

---

## 5. Spesifikasi Kop Surat & Dokumen PDF (`Pdf.gs`)

Seluruh dokumen PDF menggunakan kertas **A4 Portrait** dengan margin standar percetakan dan tata letak **Kop 2 Logo Resmi**:

```
+-------------------------------------------------------------------------+
| [LOGO YASINAT]   PANITIA HAFLAH AL MILAD 104 & AKHIR AS SANAH  [LOGO HAFLAH] |
| (Segilima Hijau)         YAYASAN ISLAM NAHDLATUTH THALABAH      (Spiral Emas)|
|                   Sekretariat: PP. Nahdlatuth Thalabah Kesilir          |
|                  WhatsApp: +62 812-1768-7686 | Email: ...               |
+-------------------------------------------------------------------------+
===========================================================================
```

### 1. Bukti Pendaftaran A4 (`buildReceiptHtml`)
* **Judul Dokumen:** **`BUKTI PENDAFTARAN`** (16px Bold Center).
* **Subjudul:** *Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan*.
* **Ringkasan Lembaga:** Format 2 kolom tanpa garis tabel (Kode, Waktu Daftar, Jenis, Asal Desa, Nama Lembaga, Koordinator, Jumlah Peserta, Nomor WhatsApp diawali 08).
* **Tabel Nama Peserta:** Format 2 kolom berdampingan dengan header tabel rata tengah (*center*) dan ukuran font nama peserta 11px bold.
* **Kotak Informasi Waktu & Lokasi:** Dipertahankan pada ukuran aslinya (10px).

### 2. Daftar Hadir Koordinator Lembaga / Opsi A (`buildAttendanceSheetAHtml`)
* **Judul Dokumen:** `DAFTAR HADIR KOORDINATOR LEMBAGA` (15px Bold Center).
* **Tabel Presensi:**
  - Lebar Kolom: NO (24px), KODE (62px), JENIS (34px), NAMA LEMBAGA (auto), DESA (75px), JUMLAH (36px), KOORDINATOR (95px), NO. WA (80px), TTD (85px).
  - Seluruh header kolom berposisi rata tengah horizontal dan vertikal.
  - Kolom TTD: Lurus rata kiri berurutan (`1. .....................`, `2. .....................`), tidak zigzag.
  - Kolom NO. WA: Format nomor dipastikan selalu diawali angka `08`.
  - Kolom KODE: Menggunakan font standar yang sama dengan kolom lainnya.
  - Baris Total: `TOTAL KESELURUHAN` di tengah, jumlah santri, dan rekap format `[Jumlah] (TKM : ...  RA : ...)`.
  - Tanda tangan panitia pelaksana: Diperbesar menjadi 11px bold di sudut kanan bawah.

### 3. Daftar Hadir Peserta per Lembaga / Opsi B (`buildAttendanceSheetBHtml`)
* **Judul Dokumen:** `DAFTAR HADIR PESERTA LOMBA MEWARNAI` (15px Bold Center).
* **Struktur:** Tiap lembaga dibungkus dalam banner hijau toska (memuat Kode, Lembaga, Desa, Koordinator, Nomor WA, dan Jumlah Peserta), diikuti tabel nama-nama santri peserta dengan kolom TTD lurus rata kiri.

---

## 6. Struktur Basis Data (Google Spreadsheet)

1. **Sheet `Pendaftaran`:** `kode`, `waktu_daftar`, `jenis`, `lembaga`, `desa`, `jumlah`, `koordinator`, `wa`, `diinput_admin`, `diubah_pada`, `request_id`.
2. **Sheet `Peserta`:** `kode`, `no`, `nama_anak`.
3. **Sheet `Pengaturan`:** `kunci`, `nilai` (memuat judul, mode buka-tutup, jadwal, lokasi, kontak panitia, juknis, daftar desa, status peserta, teks kop surat baris 1-4, dan `admin_pin`).
4. **Sheet `Riwayat`:** `waktu`, `admin`, `aksi`, `kode`, `sebelum`, `sesudah`.

### Script Properties:
* `ADMIN_PIN`: PIN keamanan panel admin (default: `123456`).
* `ADMIN_EMAIL`: Email pemilik/admin Google Apps Script.
* `COUNTER`: Nomor urut terakhir pendaftaran (tidak berkurang saat data dihapus, di-reset ke 0 saat tombol Reset ditekan).
* `LOGO_FILE_ID` & `LOGO_YASINAT_FILE_ID` (Opsional): ID Google Drive bila logo ingin diganti secara dinamis di masa depan.
