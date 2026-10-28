# PRD: Web Pendaftaran Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan

Versi 2.1 (Terverifikasi & Diperbarui) | 28 Oktober 2026  
Dokumen pendamping: `design.md` (tampilan, alur layar, struktur data, arsitektur)

---

## 1. Ringkasan

Web mobile untuk pendaftaran kolektif **Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan** (Semarak Haflah Al Milad 104 & Akhir As Sanah 1448 H / 2027 M). Satu lembaga (TKM atau RA) mengirim satu formulir berisi nama-nama anak peserta, lalu mendapat kode pendaftaran dan bukti pendaftaran format PDF A4. Data tersimpan di Google Spreadsheet. Pengelolaan pendaftaran, presensi, ekspor, dan konfigurasi dilakukan oleh panitia melalui panel admin yang diamankan dengan sistem PIN.

- **Front end:** Google Apps Script (HTML Service), diakses responsif lewat HP dan laptop.
- **Back end:** Google Spreadsheet (4 sheet: `Pendaftaran`, `Peserta`, `Pengaturan`, `Riwayat`).
- **Biaya pendaftaran:** Gratis.

---

## 2. Tujuan dan Batasan

**Tujuan:**
1. Lembaga dapat mendaftarkan seluruh peserta sekaligus dari HP secara cepat dan nyaman, termasuk untuk 100 anak.
2. Panitia mendapatkan data rapi dan seragam (huruf kapital, penomoran `MWR-xxx` berurutan) tanpa input manual ulang.
3. Panitia dapat mengunduh berkas absensi resmi meja registrasi (Opsi A & Opsi B) dan bukti pendaftaran A4 siap cetak dengan Kop 2 Logo resmi.
4. Admin dapat mengoreksi data apa pun, mengekspor Excel asli (.xlsx), dan mereset penomoran dengan aman.
5. Panel admin terlindungi dari akses orang lain/email luar melalui verifikasi PIN 6 digit.

**Di luar tujuan:** Pembayaran daring, pengumuman pemenang, dan pendaftaran mandiri non-lembaga.

---

## 3. Pengguna

| Pengguna | Peran & Kebutuhan |
|---|---|
| **Koordinator Lembaga** (Guru / Pengurus TKM/RA) | Mendaftarkan peserta dari HP, menempel nama dari WhatsApp, dan mengunduh berkas bukti pendaftaran PDF seketika. |
| **Panitia Pelaksana / Admin** (Memiliki PIN Keamanan) | Mengelola data peserta, mengoreksi isian ("edit apa pun"), mencetak berkas presensi resmi A4, mengekspor Excel (.xlsx), dan mengatur buka-tutup pendaftaran. |
| **Masyarakat Umum / Wali Murid** | Membuka direktori Daftar Peserta Publik (hanya baca) untuk mengecek apakah anak/lembaganya sudah terdaftar. |

---

## 4. Informasi Lomba

| Item | Konfigurasi Resmi |
|---|---|
| **Judul Kegiatan** | Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan |
| **Peserta** | Pasangan ibu dan anak jenjang TKM & RA se-Kecamatan Wuluhan. Yang dicatat adalah **nama lengkap peserta**. |
| **Waktu Pelaksanaan** | Sabtu, 23 Januari 2027, Pukul 07.00 WIB sampai selesai |
| **Lokasi Lomba** | PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember |
| **Batas Pendaftaran** | Ditutup otomatis Sabtu, 16 Januari 2027 pukul 23.59 WIB (dapat ditimpa mode manual oleh admin). |
| **Biaya** | Gratis |
| **Layanan Kontak TKM** | 0852-5971-9093 (Ibu Dita) |
| **Layanan Kontak RA** | 0822-3255-1107 (Ibu Fitriyah) |
| **Kop Dokumen Resmi** | Memuat **2 Logo Resmi**: Sebelah Kiri Logo Yayasan YASINAT (segilima hijau), Sebelah Kanan Logo Haflah 104 (spiral hijau-emas), dan 4 baris teks identitas panitia. |

---

## 5. Kebutuhan Fungsional: Sisi Publik

| ID | Kebutuhan Fungsional Publik |
|---|---|
| **P1** | **Beranda Publik:** Menampilkan judul lomba, badge status (Dibuka / Ditutup), hitung mundur penutupan waktu WIB, jadwal, lokasi, dan tombol aksi pendaftaran. |
| **P2** | **Formulir 4 Langkah:** Langkah 1 (Lembaga & Desa), Langkah 2 (Jumlah & Nama Peserta), Langkah 3 (Kontak Koordinator), dan Langkah 4 (Periksa & Konfirmasi). |
| **P3** | **Tempel Banyak Nama Sekaligus:** Fitur membuka panel untuk menempel teks nama santri dari WhatsApp; nomor awalan (misal: "1. ", "2) ") otomatis dibersihkan. |
| **P4** | **Pembersihan Draf Otomatis:** Setiap kali membuka formulir pendaftaran baru, kolom isian nama peserta selalu di-reset bersih kosong (mencegah munculnya nama draf lama). |
| **P5** | **Pemberian Label Bersih:** Label pada langkah 2 adalah **"Nama Lengkap Peserta"** (tanpa badge 1-100 anak dan tanpa petunjuk berlebih); label pada langkah 3 adalah **"Nama Koordinator"**. |
| **P6** | **Halaman Sukses & Unduh:** Menampilkan kode unik `MWR-xxx`, ringkasan lembaga, dan tombol hijau **"Unduh Bukti Pendaftaran"**. |
| **P7** | **Direktori Daftar Peserta Publik:** Pencarian interaktif dan filter per desa/jenis, hanya menampilkan nama lembaga, jenis, desa, dan nama santri (nomor WhatsApp dan nama koordinator dirahasiakan). |
| **P8** | **Idempotensi Pengiriman:** Menggunakan `request_id` unik untuk mencegah data ganda bila tombol ditekan berulang atau koneksi terputus. |

---

## 6. Kebutuhan Fungsional: Panel Admin

| Menu | Fitur & Peran Pengelolaan |
|---|---|
| **Keamanan PIN Admin** | Panel admin dikunci otomatis dengan modal Lock Screen; pengunjung wajib memasukkan PIN 6 digit (Default: `123456`) untuk membuka data. Admin dapat mengganti PIN di menu Pengaturan dan mengunci panel kapan saja melalui tombol di sidebar. |
| **Dasbor Statistik** | Menampilkan 4 kartu KPI (Total Lembaga, Total Santri, Rasio TKM vs RA, Status Pendaftaran), grafik sebaran wilayah per desa, dan daftar pendaftaran terbaru. |
| **Data Pendaftaran** | Tabel pendaftaran dengan pencarian cepat, filter desa, dan tombol aksi per baris: tombol **Edit** (ubah data apa pun), tombol **PDF** (unduh langsung bukti pendaftaran), dan tombol **Hapus**. |
| **Tombol Reset ke 0** | Fitur pada bilah filter tabel untuk membersihkan data ujicoba pendaftaran dan mengembalikan nomor awal pendaftaran ke `MWR-001` dengan konfirmasi ketik kata `"RESET"`. |
| **Ekspor Data & Absensi** | Pratinjau data interaktif di layar, tombol **Unduh Rekap Excel (.xlsx)** berbasis SheetJS dengan 2 lembar kerja, tombol **Unduh Daftar Hadir Koordinator (PDF A4)**, dan tombol **Unduh Daftar Hadir Peserta (PDF A4)**. |
| **Pengaturan Sistem** | Konfigurasi mode buka-tutup pendaftaran, jadwal, lokasi, kontak panitia, ketentuan teknis juknis, teks kop surat, saklar direktori peserta, dan penggantian PIN Keamanan Admin. |
| **Riwayat Perubahan** | Audit log terperinci yang mencatat waktu kejadian, user admin, jenis tindakan, kode pendaftaran, serta rekaman data sebelum dan sesudah perubahan. |

---

## 7. Spesifikasi Dokumen Resmi PDF A4 Portrait

Seluruh dokumen PDF dicetak pada ukuran kertas **A4 Portrait** menggunakan **Kop Surat 2 Logo Resmi**:
1. **Bukti Pendaftaran (`buildReceiptHtml`):**
   - Kop: Logo Yayasan YASINAT di kiri, Logo Haflah 104 di kanan, teks kop di tengah.
   - Judul dokumen: **`BUKTI PENDAFTARAN`** (kata *RESMI* dihapus).
   - Ringkasan lembaga dalam format dua kolom bersih tanpa garis tabel.
   - Tabel nama peserta 2 kolom sejajar dengan teks header rata tengah (*center*).
   - Ukuran font nama peserta 11px bold agar jelas dibaca saat dicetak.
   - Kotak informasi waktu, lokasi, dan kontak panitia tetap proporsional (10px).
2. **Daftar Hadir Koordinator Lembaga (Opsi A - `buildAttendanceSheetAHtml`):**
   - Subjudul: *Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan*.
   - Kolom header tabel (`NO`, `KODE`, `JENIS`, `NAMA LEMBAGA`, `DESA`, `JUMLAH`, `KOORDINATOR`, `NO. WA`, `TTD`) seluruhnya rata tengah horizontal dan vertikal.
   - Kolom TTD: Lurus rata kiri berurutan (tidak dibuat zigzag), lebar pas 85px.
   - Kolom No. WA: Lebar 80px, format nomor selalu diawali `08`.
   - Kolom Jumlah: Header bertuliskan `JUMLAH`, lebar 36px.
   - Kolom Kode: Menggunakan font standar yang sama dengan kolom lainnya.
   - Baris Total Keseluruhan: Teks rata tengah dengan rincian: `TOTAL KESELURUHAN`, jumlah santri, dan format rekap `[Jumlah] (TKM : ...  RA : ...)`.
   - Tanda tangan panitia pelaksana di sudut kanan bawah diperbesar menjadi 11px bold.
3. **Daftar Hadir Peserta per Lembaga (Opsi B - `buildAttendanceSheetBHtml`):**
   - Dikelompokkan rapi per lembaga dengan banner hijau toska, daftar nama santri bernomor, header tabel rata tengah, dan kolom TTD lurus rata kiri.
