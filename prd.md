# PRD: Web Pendaftaran Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan

Versi 0.3 (draf untuk disetujui) | 21 Oktober 2026
Dokumen pendamping: `design.md` (tampilan, alur layar, struktur data, arsitektur)

---

## 1. Ringkasan

Web mobile untuk pendaftaran kolektif **Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan**. Satu lembaga (TKM atau RA) mengirim satu formulir berisi nama-nama anak peserta, lalu mendapat kode pendaftaran dan bukti PDF. Data tersimpan di Google Spreadsheet. Seluruh pengelolaan (edit, hapus, ekspor, pengaturan) dilakukan satu admin lewat panel admin.

- Front end: Google Apps Script (HtmlService), diakses lewat HP.
- Back end: Google Spreadsheet.
- Biaya pendaftaran: gratis.

## 2. Tujuan dan batasan

**Tujuan**
1. Lembaga dapat mendaftarkan semua peserta sekaligus dari HP dalam hitungan menit, termasuk untuk 100 anak.
2. Panitia mendapat data rapi dan seragam (huruf kapital, kode berurutan) tanpa input ulang.
3. Admin dapat memperbaiki data apa pun tanpa membuka spreadsheet mentah.

**Di luar tujuan versi ini:** pembayaran, pengumuman pemenang, pendaftaran individu, aplikasi untuk laptop.

## 3. Pengguna

| Pengguna | Kebutuhan |
|---|---|
| **Koordinator lembaga** (guru atau pengurus TKM/RA) | Mendaftarkan peserta dari HP Android (layar kecil sampai besar), mendapat bukti |
| **Admin** (satu orang, akun Google) | Memantau, mengoreksi, mengekspor, mengatur buka-tutup dan isi halaman info |

Orang tua dan pengunjung umum tidak mendaftar, tetapi dapat membuka halaman **Daftar Peserta** (hanya baca) untuk memeriksa apakah nama anak sudah terdaftar.

## 4. Informasi lomba

| Item | Isi |
|---|---|
| Judul | Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan |
| Peserta | Pasangan ibu dan anak dari TKM dan RA. Yang dicatat hanya **nama lengkap anak** |
| Pelaksanaan | Sabtu, 23 Januari 2027, pukul 07.00 WIB sampai selesai |
| Lokasi | PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember |
| Pendaftaran | Dibuka langsung saat web dipublikasikan. Ditutup otomatis Sabtu, 16 Januari 2027 pukul 23.59 WIB (seminggu sebelum pelaksanaan) |
| Biaya | Gratis |
| Kontak panitia TKM | 0852-5971-9093 (Ibu Dita) |
| Kontak panitia RA | 0822-3255-1107 (Ibu Fitriyah) |
| Ketentuan teknis | Diisi sendiri oleh admin lewat panel (teks sementara sebelum diisi: "Ketentuan akan diumumkan oleh panitia") |
| Kop surat | Kop buatan sendiri: logo Haflah di kiri, lalu empat baris teks (nama panitia, nama yayasan, sekretariat, WhatsApp dan email). Teks lengkap dan tata letaknya ada di `design.md` bagian 6.1, contohnya di `kop.html`. Teks kop dapat diubah admin |

Semua isi tabel ini disimpan sebagai pengaturan yang dapat diubah admin, bukan ditulis tetap di kode.

## 5. Ruang lingkup

**Termasuk:**
- Halaman publik: Beranda, Daftar, Daftar Peserta, Info.
- Daftar Peserta: nama anak per lembaga, dengan pencarian dan filter (hanya baca).
- Formulir pendaftaran 4 langkah, kode pendaftaran, bukti PDF.
- Panel admin penuh (satu admin) dengan dasbor, edit apa pun, hapus, ekspor, pengaturan, riwayat.

**Tidak termasuk (sengaja):**
- Pengecekan lembaga ganda (aturan ini dibatalkan).
- Pengecekan nama anak ganda antar lembaga.
- Edit atau pembatalan oleh lembaga setelah terkirim (hanya admin).
- Fitur "cek atau unduh ulang bukti" oleh lembaga setelah halaman sukses ditutup.
- Menampilkan nama koordinator, nomor WhatsApp, dan waktu daftar kepada umum (hanya admin yang melihatnya).
- Notifikasi otomatis lewat WhatsApp atau email.
- Unggah berkas, pembayaran, kuota total.

## 6. Kebutuhan fungsional: sisi publik

| ID | Kebutuhan |
|---|---|
| P1 | Beranda menampilkan judul, status pendaftaran (Dibuka atau Ditutup, selalu dengan teks dan ikon), hitung mundur ke penutupan (WIB), tanggal, jam, lokasi, dan tombol Daftar Sekarang |
| P2 | Halaman Daftar berisi formulir 4 langkah (lihat bagian 7) |
| P3 | Halaman Info berisi lokasi, jam, ketentuan teknis, dan tombol WhatsApp ke panitia TKM dan panitia RA |
| P4 | Setelah berhasil kirim: halaman sukses berisi kode, ringkasan, dan tombol Unduh PDF |
| P5 | Jika pendaftaran ditutup: formulir diganti pesan "Pendaftaran telah ditutup" dan tombol hubungi panitia |
| P6 | Pengiriman ganda tidak sengaja (tombol tertekan dua kali, sinyal putus lalu kirim ulang) tidak boleh menghasilkan dua kode untuk satu pengiriman |
| P7 | Menu **Daftar Peserta** menampilkan semua lembaga yang sudah mendaftar. Tiap lembaga memuat kode, jenis (TKM atau RA), nama lembaga, desa, jumlah anak, dan daftar nama anak bernomor |
| P8 | **Pencarian** satu kolom yang mencocokkan nama lembaga, nama anak, dan kode. Tidak peka huruf besar-kecil, spasi berlebih diabaikan |
| P9 | **Filter** jenis lembaga (Semua, TKM, RA) dan desa (Semua desa atau salah satu dari 7 desa). Pencarian dan filter berlaku bersamaan |
| P10 | Halaman menampilkan jumlah hasil (lembaga dan anak) serta waktu pembaruan data. Urutan bawaan: nama lembaga A sampai Z |
| P11 | Daftar Peserta **tidak** menampilkan nomor WhatsApp, nama koordinator, waktu daftar, atau ID permintaan |
| P12 | Data Daftar Peserta mengikuti kondisi terkini dengan tundaan paling lama 2 menit |
| P13 | Admin dapat menyembunyikan seluruh halaman Daftar Peserta lewat pengaturan (bawaan: ditampilkan). Saat disembunyikan, menunya hilang dari navigasi |

## 7. Isian formulir dan validasi

Urutan isian dan langkah:

| Langkah | Isian | Aturan |
|---|---|---|
| 1. Lembaga | **Jenis lembaga**: pilihan TKM atau RA | Wajib, pilih salah satu |
| | **Nama lembaga** | Wajib. Otomatis huruf kapital. Panjang dan karakter bebas |
| | **Asal desa**: dropdown 7 desa Kec. Wuluhan | Wajib. Pilihan: Ampel, Dukuh Dempok, Glundengan, Kesilir, Lojejer, Tamansari, Tanjungrejo (daftar dapat diubah admin) |
| 2. Peserta | **Jumlah peserta** | Wajib, bilangan bulat 1 sampai 100 |
| | **Nama lengkap anak** (sebanyak jumlah peserta) | Semua wajib terisi. Otomatis huruf kapital. Panjang dan karakter bebas. Tidak boleh ada nama kembar dalam satu formulir |
| 3. Koordinator | **Nama koordinator** | Wajib. Otomatis huruf kapital |
| | **Nomor WhatsApp koordinator** | Wajib. Terima format 08..., +62..., 62..., spasi atau tanda hubung diabaikan. Harus 10 sampai 14 digit |
| 4. Periksa | Ringkasan semua isian | Tombol Kembali untuk memperbaiki, tombol Kirim pendaftaran |

Koordinator berada setelah daftar nama peserta, sesuai permintaan. Dipisah menjadi langkah sendiri supaya tidak harus menggulir daftar 100 nama untuk mencapainya.

**Pesan validasi** harus menyebut dengan jelas apa yang salah dan di mana, misalnya "Nama anak nomor 7 belum diisi" atau "Nama anak nomor 12 sama dengan nomor 3".

## 8. Aturan bisnis

| ID | Aturan |
|---|---|
| B1 | **Kode** berformat `MWR-` + 3 angka (`MWR-001`, `MWR-002`, ...), berurutan menurut urutan pendaftaran. Satu kode per lembaga, memuat semua anak dari formulir itu |
| B2 | Kode yang pernah dipakai **tidak dipakai ulang**. Bila admin menghapus pendaftaran, nomornya dibiarkan kosong |
| B3 | Bila admin mengubah jumlah peserta (menambah atau mengurangi), **kode tetap** |
| B4 | Semua isian teks (nama lembaga, nama anak, nama koordinator) otomatis **huruf kapital**: saat mengetik, saat menempel, dan sekali lagi di server sebelum disimpan |
| B5 | Nama kosong ditolak dan pengguna diberi tahu nomor barisnya |
| B6 | Nama kembar **dalam satu formulir** ditolak dan pengguna diberi tahu baris mana saja. Perbandingan dilakukan setelah dikapitalkan dan spasi berlebih dirapikan |
| B7 | Satu lembaga **boleh** mengirim lebih dari sekali (tidak ada pengecekan lembaga ganda). Admin yang merapikan bila ada kiriman dobel |
| B8 | Nama lembaga dan nama anak **tanpa batas panjang dan tanpa batasan karakter** (huruf, angka, tanda baca, apostrof bebas). Sistem hanya menolak yang melampaui batas teknis Google Sheets (50.000 karakter per sel), yang tidak akan tercapai pada pemakaian wajar |
| B9 | Status pendaftaran ditentukan **server**, bukan jam HP pengguna. Penutupan otomatis pada 16 Januari 2027 pukul 23.59 WIB |
| B10 | **Tombol buka-tutup manual menimpa tenggat otomatis.** Mode: Otomatis (ikut tenggat), Tutup manual, Buka manual |
| B11 | Pendaftaran dibuka langsung, tanpa tanggal mulai |
| B12 | Hanya admin yang dapat mengubah atau menghapus data setelah terkirim |
| B13 | Semua waktu memakai WIB (`Asia/Jakarta`) |
| B14 | Jika nomor kode sudah mencapai `MWR-999`, pendaftaran baru ditolak dengan pesan hubungi panitia (3 digit hanya cukup untuk 999 lembaga) |

## 9. Bukti pendaftaran (PDF)

- Dibuat saat diminta, dari data terkini, memakai **kop buatan sendiri** (logo di kiri, empat baris teks; lihat `design.md` bagian 6.1).
- Isi: judul "Bukti Pendaftaran", kode, waktu daftar (WIB), jenis dan nama lembaga, desa, jumlah peserta, daftar nama anak bernomor, nama dan WhatsApp koordinator, tanggal-jam-lokasi lomba, kontak panitia sesuai jenis lembaga, catatan "Perubahan data hanya melalui panitia".
- Tombol Unduh PDF ada di halaman sukses. Lembaga dapat mengunduh selama halaman itu masih terbuka. Setelah ditutup, bukti diminta ke admin (admin dapat mencetak ulang).
- Admin dapat membuat ulang PDF setelah koreksi.

## 10. Panel admin

Satu admin, masuk dengan akun Google yang didaftarkan. Alamat terpisah dari halaman publik. Pemeriksaan hak akses dilakukan di server, bukan hanya dengan menyembunyikan menu.

| Menu | Fungsi |
|---|---|
| **Dasbor** | Jumlah lembaga, jumlah anak, TKM dibanding RA, jumlah per desa, status dan hitung mundur penutupan, pendaftaran terbaru |
| **Pendaftaran** | Daftar semua pendaftaran (kode, jenis, lembaga, desa, jumlah, waktu). Cari (kode, lembaga, nama anak, koordinator), filter jenis dan desa. Tambah pendaftaran manual |
| **Detail dan edit** | **Edit apa pun**: kode, jenis, nama lembaga, desa, jumlah, semua nama anak (ubah, tambah, hapus baris), nama dan WhatsApp koordinator. Cetak ulang PDF. Hapus pendaftaran dengan konfirmasi |
| **Ekspor** | Daftar peserta (Excel/CSV dan PDF) untuk semua, per desa, atau per lembaga, dengan kolom kosong "Hadir" untuk absensi |
| **Pengaturan** | Mode buka-tutup, tanggal-jam penutupan, judul, tanggal pelaksanaan, jam, lokasi, kontak panitia TKM dan RA, ketentuan teknis (diisi bebas), daftar desa, saklar tampil atau sembunyi Daftar Peserta untuk umum, teks kop surat (empat baris) |
| **Riwayat** | Catatan setiap perubahan: waktu, aksi, kode, data sebelum dan sesudah |

Aturan khusus admin:
- Admin tidak dibatasi tenggat dan dapat menambah, mengubah, atau menghapus kapan saja.
- Validasi (nama kosong, nama kembar, jumlah di luar 1 sampai 100) tampil sebagai **peringatan** dan admin dapat memilih "Tetap simpan". Ini menjalankan prinsip "bisa edit apa pun dan isi apa pun".
- Perubahan kode oleh admin harus tetap unik dan berformat `MWR-` + 3 angka.
- Menghapus pendaftaran menyimpan salinan lengkap datanya di Riwayat sehingga bisa dipulihkan manual.
- Kapitalisasi otomatis tetap berlaku pada isian yang diketik admin.

## 11. Kebutuhan non-fungsional

- **Mobile dulu:** nyaman dari lebar 360 px sampai layar HP besar. Huruf isian minimal 16 px, target sentuh minimal 48 px.
- **Aman dari kiriman serentak:** penomoran kode memakai penguncian (`LockService`) agar tidak ada kode kembar.
- **Aman dari isi berbahaya:** karena karakter bebas, semua teks di-escape saat ditampilkan (halaman, PDF, panel) dan dicegah ditafsirkan sebagai rumus saat masuk ke Sheets (teks yang diawali `=`, `+`, `-`, `@`).
- **Privasi:** karena nama anak tampil di Daftar Peserta, hanya data yang diperlukan yang dikirim ke HP pengunjung (nama anak, lembaga, jenis, desa, kode). Nomor WhatsApp, nama koordinator, dan ID permintaan tidak pernah ikut terkirim ke halaman publik.
- **Validasi dua lapis:** di HP untuk kenyamanan, di server sebagai penentu.
- **Tahan sinyal lemah:** data yang sudah diketik tidak hilang bila pengiriman gagal, dan kirim ulang tidak menggandakan data.
- **Kecepatan:** halaman awal termuat cepat di jaringan seluler. Pengaturan di-cache, penulisan ke sheet dilakukan sekali per pengiriman.
- **Aksesibilitas:** kontras cukup, semua status memakai teks dan ikon (tidak hanya warna), pesan kesalahan terbaca pembaca layar.

## 12. Kriteria penerimaan (daftar uji)

1. Daftar 1 peserta dan 100 peserta berhasil, kode `MWR-001` lalu `MWR-002`.
2. Dua pengiriman serentak menghasilkan dua kode berbeda, tidak ada yang kembar.
3. Tombol Kirim ditekan berulang atau dikirim ulang setelah sinyal putus hanya menghasilkan satu pendaftaran.
4. Nama kosong dan nama kembar ditolak dengan pesan yang menyebut nomornya.
5. Mengetik atau menempel huruf kecil selalu tersimpan sebagai huruf kapital.
6. Nama berisi apostrof, tanda kutip, `<script>`, atau diawali `=` tersimpan dan tampil apa adanya, tanpa menjalankan apa pun.
7. Setelah 16 Januari 2027 23.59 WIB, form otomatis menampilkan "Pendaftaran telah ditutup". Mengubah jam HP tidak berpengaruh.
8. Mode Tutup manual menutup form sebelum tenggat. Mode Buka manual membuka kembali setelah tenggat.
9. PDF terunduh, memuat kop, dan daftar 100 nama tidak terpotong.
10. Admin dapat mengubah setiap isian, termasuk jumlah peserta (kode tetap), dan perubahan tercatat di Riwayat.
11. Admin menghapus `MWR-005`; pendaftar berikutnya mendapat `MWR-006`, bukan `MWR-005`.
12. Akun Google selain admin tidak dapat membuka atau memanggil fungsi admin.
13. Tampilan rapi di layar 360 px dan di HP layar besar, tanpa tergeser ke samping.
14. Daftar Peserta: mencari nama anak membuka lembaganya dan menyorot nama yang cocok; mencari nama lembaga dan kode juga berhasil.
15. Filter TKM, RA, dan desa menyaring dengan benar, dan bila digabung dengan pencarian hanya menampilkan yang memenuhi keduanya.
16. Data yang diterima halaman publik (diperiksa lewat alat pengembang peramban) tidak memuat nomor WhatsApp maupun nama koordinator.
17. Pendaftaran baru muncul di Daftar Peserta paling lambat 2 menit kemudian. Pendaftaran yang diedit atau dihapus admin ikut berubah.
18. Saat saklar Daftar Peserta dimatikan di Pengaturan, menu hilang dan pemanggilan data dari luar ditolak server.

## 13. Tahapan pembuatan

Kode diserahkan per tahap, Anda menguji sebelum lanjut.

1. **Spreadsheet dan formulir publik:** struktur sheet, Beranda, Daftar 4 langkah, kode, bukti PDF, Daftar Peserta, halaman Info dan Ditutup.
2. **Panel admin inti:** dasbor, daftar, detail dan edit, hapus, tambah manual, cetak ulang PDF.
3. **Ekspor, pengaturan, dan riwayat:** ekspor, pengaturan penuh, catatan perubahan.
4. **Uji menyeluruh** memakai daftar penerimaan di atas, lalu publikasi.

## 14. Asumsi yang perlu Anda konfirmasi

Hal-hal berikut belum Anda putuskan secara tegas. Saya menuliskannya sebagai asumsi.

1. Pengecekan nama kembar dan kosong hanya **dalam satu formulir**, bukan antar lembaga.
2. Nama koordinator dan nomor WhatsApp koordinator **wajib** diisi.
3. Lembaga hanya dapat mengunduh bukti saat halaman sukses masih terbuka. Tidak ada fitur cek bukti dengan kode.
4. Mode **Buka manual** tersedia (untuk memperpanjang pendaftaran setelah tenggat), selain Otomatis dan Tutup manual.
5. Admin boleh mengubah **kode** pendaftaran (harus unik).
6. Daftar 7 desa dapat diubah admin di Pengaturan.
7. Admin yang menyimpan data tidak valid hanya mendapat peringatan, bukan penolakan.
8. Fitur **tempel daftar nama** (satu nama per baris, dari WhatsApp) tersedia di langkah Peserta.
9. Daftar Peserta bersifat **publik** (terbuka untuk siapa saja yang membuka web), bukan khusus admin. Admin sudah punya daftar sendiri di menu Pendaftaran.
10. Nama anak tampil **lengkap**, tidak disingkat.
11. Pencarian juga mencocokkan **kode** pendaftaran, dan Daftar Peserta tampil sejak ada pendaftar pertama (bawaan), dengan saklar sembunyi di Pengaturan.

## 15. Data yang masih menunggu

- **Alamat Gmail admin** (satu orang).
- Ketentuan teknis lomba (diisi admin lewat panel setelah web jadi).
- Logo sudah ada: berkas JPEG yang dilampirkan diolah menjadi PNG transparan (`logo-haflah-512.png`). Logo diganti dengan menimpa berkas di Google Drive, tidak lewat panel.
- Teks kop ditulis persis seperti yang Anda berikan (nama panitia tanpa angka 104 dan tanpa tanda hubung, email `panitiahafahyasinat@gmail.com`). Bila ada yang perlu diperbaiki, admin dapat mengubahnya di Pengaturan tanpa mengubah kode.

## 16. Risiko

| Risiko | Penanganan |
|---|---|
| Lembaga mengirim dua kali sehingga ada dua kode | Tanpa pengecekan sesuai keputusan. Admin merapikan lewat panel. Dasbor memudahkan pencarian nama lembaga yang sama |
| Salah ketik setelah terkirim | Halaman Periksa sebelum kirim. Koreksi hanya lewat admin |
| Lembaga lupa menyimpan bukti | Admin mencetak ulang PDF. Nomor WhatsApp koordinator ada di data |
| Batas Apps Script (kecepatan, kuota harian) | Cukup untuk skala satu kecamatan. Pengaturan di-cache dan penulisan dibatasi |
| Kode 3 digit habis di 999 | Sangat kecil kemungkinannya. Aturan B14 menanganinya |
| Nama anak terlihat publik | Hanya nama anak, lembaga, jenis, desa, dan kode yang tampil. Admin dapat menyembunyikan halaman kapan saja lewat Pengaturan. Pertimbangkan kebijakan lembaga dan izin orang tua |
| Data peserta sangat banyak membuat pencarian lambat di HP | Data dimuat sekali dan disaring di HP. Bila total nama melampaui sekitar 5.000, pencarian dipindah ke server dengan paginasi |

---

## Catatan perubahan dokumen

| Versi | Perubahan |
|---|---|
| 0.1 | Draf awal |
| 0.2 | Menambah menu publik **Daftar Peserta** (nama anak per lembaga, pencarian, filter, saklar tampil di Pengaturan). Mengubah keputusan sebelumnya bahwa daftar peserta tidak tampil untuk umum |
| 0.3 | Kop dari gambar lampiran diganti kop buatan sendiri (logo kiri, empat baris teks) dalam versi lengkap dan ringkas. Palet warna disesuaikan dengan warna logo |
