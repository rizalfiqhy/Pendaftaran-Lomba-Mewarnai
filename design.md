# Design: Web Pendaftaran Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan

Versi 0.3 (draf) | 21 Oktober 2026
Dokumen pendamping: `prd.md` (aturan dan kebutuhan). Bila ada perbedaan, `prd.md` menang.

---

## 1. Arah desain

**Subjek:** pendaftaran lomba mewarnai anak TKM dan RA, diisi koordinator lembaga dari HP.
**Tugas utama halaman:** membuat koordinator selesai mendaftar tanpa bingung, termasuk saat harus mengetik 100 nama.
**Sumber visual:** logo Haflah (hijau tua dan emas), serta dunia krayon dan kertas gambar.

**Satu hal yang dibuat menonjol:** indikator langkah berbentuk **empat krayon**. Setiap krayon berwarna cerah saat langkahnya selesai, berkontur untuk langkah yang sedang diisi, dan abu-abu untuk yang belum. Semua elemen lain dibuat tenang dan lugas supaya formulir panjang tetap nyaman.

Prinsip:
1. **Satu lajur.** Semua konten satu kolom, dirancang pada lebar 360 px.
2. **Jelas sebelum cantik.** Huruf besar, tombol besar, satu tugas per layar.
3. **Kesalahan menyebut baris dan cara memperbaiki.**
4. **Status selalu teks dan ikon,** tidak hanya warna.
5. **Gerak hanya yang menjawab tindakan pengguna,** kecuali satu momen: kode muncul di halaman sukses.

## 2. Token desain

### Warna

| Nama | Hex | Peran |
|---|---|---|
| Hijau Pondok | `#005E39` | Warna utama: tombol utama, judul, tautan. Diambil dari hijau logo |
| Hijau Daun | `#E7F2E9` | Latar bagian terpilih, ringkasan, status Dibuka |
| Emas Kop | `#EEB92B` | Garis dan hiasan (dari emas logo). **Bukan untuk teks kecil** |
| Emas Tua | `#6F5600` | Teks emas yang perlu terbaca (kontras cukup di atas putih) |
| Emas Muda | `#F6D26B` | Teks di atas pita Hijau Pondok (pita nama yayasan pada kop) |
| Tinta | `#1C2A21` | Teks utama |
| Kertas | `#FAFCFA` | Latar halaman (putih kehijauan, bukan krem) |
| Garis | `#CBD8CE` | Batas input dan pemisah |
| Merah Koreksi | `#B42318` | Kesalahan dan status Ditutup |
| Kuning Peringatan | `#F6E7B4` | Latar peringatan (dipasangkan dengan teks Tinta) |

Warna krayon (hanya hiasan indikator langkah; arti selalu ada pada label teks): hijau `#2E8B4F`, kuning `#E2B33C`, toska `#2A9DA6`, jingga `#E8832A`.

Kontras Hijau Pondok pada Kertas dan Tinta pada Kertas wajib diukur saat tahap pembuatan (target minimal 4,5:1 untuk teks).

### Tipografi

| Peran | Huruf | Catatan |
|---|---|---|
| Judul dan angka besar (kode, hitung mundur) | **Baloo 2**, bobot 700 | Bulat dan ramah anak. Fallback: `system-ui` |
| Isi, formulir, tabel | **Atkinson Hyperlegible**, bobot 400 dan 700 | Dirancang agar mudah dibedakan antarhuruf, cocok untuk membaca di HP. Fallback: `system-ui` |

Dimuat dari Google Fonts. Bila gagal dimuat (sinyal lemah), tampilan tetap utuh memakai huruf sistem.

| Tingkat | Ukuran / jarak baris |
|---|---|
| Judul halaman (h1) | 26 px / 1,15 |
| Judul bagian (h2) | 20 px / 1,2 |
| Isi dan isian formulir | 16 px / 1,55 (tidak boleh lebih kecil, mencegah zoom otomatis di iPhone) |
| Keterangan | 14 px / 1,45 (batas terkecil) |
| Kode di halaman sukses | 40 px, Baloo 2 |

Panjang baris isi kurang dari 80 karakter. Teks menggunakan huruf kapital biasa (kalimat), tidak ada label huruf besar semua dan tidak ada tanda panah pada tombol.

### Ruang dan bentuk
- Jarak: 4, 8, 12, 16, 24, 32 px.
- Lebar konten maksimum 480 px dan di tengah pada layar lebar. Tepi kiri-kanan 16 px, hormati `safe-area-inset`.
- Sudut berbeda menurut peran: kolom isian 10 px, tombol 14 px, kartu kode 20 px, lencana status penuh bulat.
- Satu jenis bayangan lembut hanya untuk bilah navigasi bawah dan dialog. Selain itu pemisah memakai garis, bukan kartu-kartu bertumpuk.

## 3. Navigasi publik

Bilah navigasi bawah (tinggi 56 px), empat tombol dengan ikon dan teks (masing-masing sekitar 90 px pada layar 360 px):

| Tombol | Layar |
|---|---|
| Beranda | Ringkasan dan tombol daftar |
| Daftar | Formulir (tombol ini diganti "Ditutup" saat pendaftaran tutup) |
| Peserta | Daftar peserta per lembaga, dengan pencarian dan filter (tombol hilang bila disembunyikan admin) |
| Info | Ketentuan, jadwal, lokasi, kontak |

## 4. Layar publik

### 4.1 Beranda

```
+--------------------------------+
| [logo] PANITIA HAFLAH AL MILAD |
| & AKHIR AS SANAH 1448 H        |
| [ YAYASAN ISLAM NAHDLATUTH ... ]|
+--------------------------------+
| Lomba Mewarnai Kreatif         |
| TKM & RA Se-Kecamatan Wuluhan  |
|                                |
| (centang) Pendaftaran dibuka   |
| Ditutup Sabtu, 16 Jan 2027     |
| pukul 23.59 WIB                |
| [ 5 hari  03 jam  12 menit ]   |
|                                |
| [      Daftar sekarang       ] |
|                                |
| Sabtu, 23 Januari 2027         |
| 07.00 WIB sampai selesai       |
| PPTQ BUQ Yasinat, Kesilir,     |
| Wuluhan, Jember                |
| Gratis. Peserta ibu dan anak.  |
+--------------------------------+
|  Beranda     Daftar     Info   |
+--------------------------------+
```

- Beranda memakai **kop ringkas** (logo di kiri, nama panitia, dan pita nama yayasan; lihat bagian 6.1). Kop lengkap empat baris dipakai di PDF dan di bagian bawah halaman Info.
- Lencana status: Dibuka (hijau daun, ikon centang) atau Ditutup (merah, ikon silang), selalu dengan teks.
- Hitung mundur memakai waktu server (selisih jam dikoreksi) dan berhenti di nol dengan teks "Pendaftaran telah ditutup".
- Saat ditutup: tombol utama diganti "Hubungi panitia" dan hitung mundur disembunyikan.

### 4.2 Formulir Daftar (4 langkah)

Indikator langkah: empat krayon berjajar dengan label teks di bawahnya: 1 Lembaga, 2 Peserta, 3 Koordinator, 4 Periksa. Langkah selesai berwarna penuh, langkah aktif berkontur dengan label tebal, sisanya abu-abu. Label nomor dipakai karena urutannya memang berurutan.

Tombol: **Lanjut** (utama, penuh lebar) dan **Kembali** (sekunder). Tombol menempel di bawah layar (sticky) agar terjangkau jempol pada daftar yang panjang.

**Langkah 1: Lembaga**
- Jenis lembaga: dua pilihan besar berdampingan, **TKM** dan **RA** (kontrol segmen, tinggi 56 px).
- Nama lembaga: kolom teks.
- Asal desa: pilihan (select) berisi 7 desa.

**Langkah 2: Peserta**

```
+--------------------------------+
| Jumlah peserta                 |
| [ - ]     [  24  ]     [ + ]   |
| Boleh 1 sampai 100 anak        |
|                                |
| > Tempel banyak nama sekaligus |
|                                |
| Nama lengkap anak              |
| 1  [ AISYAH NUR FADILAH      ] |
| 2  [ MUHAMMAD RAFA           ] |
| 3  [                         ] |
|    Nama anak nomor 3 belum     |
|    diisi                       |
| ...                            |
+--------------------------------+
```

- Jumlah: tombol minus-plus berukuran besar dan angka yang dapat diketik. Di bawah rentang 1 sampai 100 muncul pesan, nilai tidak dipaksa diam-diam.
- Menambah jumlah menambah baris kosong di bawah. Mengurangi jumlah, bila baris yang akan hilang sudah berisi, memunculkan dialog: "Baris nomor 8 sampai 12 sudah berisi nama dan akan dihapus. Lanjutkan?"
- Setiap baris: nomor di kiri, kolom di kanan, `autocapitalize="characters"`, `autocomplete="off"`, tombol Enter di keyboard berpindah ke baris berikutnya.
- **Tempel banyak nama sekaligus** (lipat-buka): kolom teks besar. Tiap baris menjadi satu nama, nomor awal seperti "1." atau "2)" dibuang, baris kosong diabaikan. Tampil pratinjau "Ditemukan 23 nama" dan tombol **Pakai nama ini**. Isian menggantikan seluruh baris dan jumlah mengikuti. Bila lebih dari 100, ditolak dengan pesan jelas.
- Nama kosong dan nama kembar diberi tanda **pada barisnya**: garis merah, ikon, dan teks di bawah baris ("Nama sama dengan nomor 3"). Kedua baris yang kembar sama-sama ditandai. Saat Lanjut ditekan dan ada kesalahan, layar menggulir ke kesalahan pertama.

**Langkah 3: Koordinator**
- Nama koordinator (kapital otomatis).
- Nomor WhatsApp (`inputmode="tel"`). Keterangan: "Dipakai panitia bila perlu menghubungi lembaga. Tidak ditampilkan untuk umum."

**Langkah 4: Periksa dan kirim**
- Ringkasan: jenis dan nama lembaga, desa, jumlah, daftar nama bernomor (dapat digulir), koordinator, nomor WhatsApp. Tiap bagian punya tautan **Ubah** yang kembali ke langkahnya.
- Peringatan tegas di atas tombol: "Setelah terkirim, data hanya bisa diubah oleh panitia."
- Tombol **Kirim pendaftaran**. Saat ditekan: tombol nonaktif dan teks menjadi "Mengirim...".

**Keadaan khusus formulir**
- Draf tersimpan selama halaman terbuka dan, bila peramban mengizinkan, di penyimpanan lokal (dibungkus try/catch karena dapat diblokir di dalam Apps Script). Peringatan sebelum menutup halaman bila ada isian.
- Gagal kirim (sinyal putus): data tetap, pesan "Pendaftaran belum terkirim. Data Anda masih tersimpan di halaman ini. Periksa sinyal lalu tekan Kirim lagi." Kirim ulang memakai ID permintaan yang sama sehingga tidak menggandakan data.
- Server sibuk: "Server sedang sibuk. Tunggu beberapa detik lalu tekan Kirim lagi."
- Ditutup saat pengguna sedang mengisi: "Pendaftaran sudah ditutup dan data tidak dapat dikirim. Hubungi panitia."

### 4.3 Halaman sukses

- Ikon centang dan teks "Pendaftaran berhasil".
- Kode besar (`MWR-001`) di kotak berbingkai putus-putus seperti nomor dada peserta. **Satu-satunya gerak spontan di aplikasi:** kode muncul dengan sedikit membesar lalu diam; dimatikan bila pengguna memilih "kurangi gerak".
- Ringkasan: lembaga, desa, jumlah anak, waktu daftar.
- Tombol utama **Unduh bukti PDF**; tombol kedua **Daftarkan lembaga lain** (membersihkan formulir).
- Catatan: "Simpan bukti ini. Data hanya bisa diubah oleh panitia. Jangan tutup halaman ini sebelum mengunduh."
- Unduhan: server mengembalikan PDF dalam bentuk base64 dan halaman membuat tautan unduh; bila perangkat menolak unduhan langsung, PDF dibuka di tab baru.

### 4.4 Daftar Peserta

```
+--------------------------------+
| Daftar peserta                 |
| [ Cari lembaga, nama, kode  x ]|
| [ Semua | TKM | RA ]           |
| [ Semua desa              v ]  |
| 57 lembaga, 842 anak           |
| Diperbarui 14.32 WIB  [Muat    |
|                        ulang]  |
|--------------------------------|
| RA AL-IKHLAS           MWR-003 |
| RA, Kesilir      24 anak    v  |
|--------------------------------|
| TKM NURUL HUDA         MWR-001 |
| TKM, Lojejer     18 anak    ^  |
|   1  AISYAH NUR FADILAH        |
|   2  MUHAMMAD RAFA             |
|   ...                          |
|--------------------------------|
| [ Tampilkan 20 lembaga lagi ]  |
+--------------------------------+
```

**Baris lembaga (dapat dibuka-tutup).** Nama lembaga tebal, kode di kanan, di bawahnya jenis (teks TKM atau RA), desa, dan jumlah anak. Seluruh baris adalah target sentuh (tinggi minimal 56 px). Saat dibuka, nama anak tampil bernomor dan boleh membungkus ke baris berikutnya (tidak dipotong). Lebih dari satu lembaga boleh terbuka bersamaan. Nama anak baru digambar saat baris dibuka agar halaman tetap ringan.

**Pencarian.** Satu kolom, label tampak "Cari lembaga, nama anak, atau kode". Mencocokkan nama lembaga, nama anak, dan kode; tidak peka huruf besar-kecil; spasi berlebih diabaikan. Mulai bekerja dari 2 karakter dan menunggu 250 ms setelah pengguna berhenti mengetik. Tombol hapus (x) di dalam kolom.
- Bila yang cocok adalah **nama anak**: lembaganya terbuka otomatis, nama yang cocok disorot (latar kuning peringatan dan teks tebal), nama lain tetap tampil. Ringkasan hasil menambahkan "3 nama cocok".
- Bila yang cocok adalah nama lembaga atau kode: baris lembaga disorot pada bagian yang cocok.

**Filter.** Kontrol segmen **Semua / TKM / RA** dan pilihan **Semua desa** (7 desa). Filter dan pencarian berlaku bersamaan. Tombol **Hapus filter** muncul bila ada pencarian atau filter aktif. Ringkasan hasil selalu mengikuti hasil saat ini, misalnya "12 lembaga, 203 anak".

**Urutan dan halaman.** Nama lembaga A sampai Z. Tampil 20 lembaga pertama, lalu tombol "Tampilkan 20 lembaga lagi".

**Yang tidak tampil:** nomor WhatsApp, nama koordinator, waktu daftar.

**Keadaan khusus**
- Belum ada pendaftar: "Belum ada pendaftar." dan tombol Daftar sekarang (bila masih dibuka).
- Tidak ada yang cocok: "Tidak ada yang cocok. Ubah kata kunci atau hapus filter." dengan tombol Hapus filter.
- Memuat: kerangka baris abu-abu (skeleton), bukan layar kosong.
- Gagal memuat: "Daftar belum bisa dimuat. Periksa sinyal lalu tekan Muat ulang."
- Disembunyikan admin: menu tidak tampil. Bila halaman dibuka langsung: "Daftar peserta belum ditampilkan oleh panitia."
- Tetap tersedia setelah pendaftaran ditutup.

**Data.** Satu panggilan `getPublicParticipants()` mengambil seluruh data ringkas (kode, jenis, lembaga, desa, nama anak). Pencarian dan filter dijalankan di HP. Server menyimpan hasilnya di cache selama 2 menit dan menghapusnya saat admin menyimpan perubahan. Label "Diperbarui pukul ..." memakai waktu data dibuat, dan tombol **Muat ulang** mengambil ulang.

### 4.5 Info

Bagian berurutan: Jadwal dan lokasi (tanggal, jam, tempat), Ketentuan teknis (teks dari admin; paragraf dipisah baris kosong, daftar dengan awalan `- `), Kontak panitia dengan dua tombol WhatsApp: **Panitia TKM: Ibu Dita** dan **Panitia RA: Ibu Fitriyah**. Tombol memakai tautan `wa.me` dengan pesan awal "Assalamu'alaikum, saya ingin bertanya tentang Lomba Mewarnai." Di paling bawah halaman ditampilkan kop lengkap sebagai identitas sekretariat.

### 4.6 Ditutup

Halaman Daftar diganti ikon silang, "Pendaftaran telah ditutup", tanggal penutupan, dan dua tombol WhatsApp panitia. Halaman Peserta tetap dapat dibuka.

## 5. Panel admin

Alamat terpisah dari publik. Bila akun Google bukan admin: layar "Akses ditolak" dengan nama akun yang sedang dipakai.

**Tata letak:** HP memakai bilah atas (judul layar) dan navigasi bawah lima ikon. Layar 768 px ke atas memakai menu samping tetap dan tabel lebih lebar.

| Menu | Layar |
|---|---|
| Dasbor | Empat angka (lembaga, anak, TKM, RA), daftar per desa dengan batang dan angka, status buka-tutup, hitung mundur, lima pendaftaran terbaru |
| Pendaftaran | Kolom cari, filter jenis dan desa, daftar baris (kode, lembaga, desa, jumlah, waktu). Tombol **Tambah pendaftaran** |
| Ekspor | Pilih cakupan (semua, per desa, per lembaga) dan format (PDF atau Excel) |
| Pengaturan | Formulir pengaturan (bagian 5.3) |
| Riwayat | Daftar perubahan, tiap baris dapat dibuka untuk melihat sebelum dan sesudah |

### 5.1 Detail dan edit pendaftaran

Satu halaman, dibagi menjadi bagian: **Kode**, **Lembaga**, **Peserta**, **Koordinator**. Semua isian dapat diubah.

- Kode: kolom teks dengan keterangan "Harus unik, format MWR-nomor 3 angka".
- Peserta: tiap baris dapat diubah, ditambah, dan dihapus. Nomor urut dihitung otomatis. Tersedia tempel banyak nama seperti formulir publik.
- Validasi memakai **peringatan** (latar kuning, teks jelas) dan tombol **Tetap simpan**, bukan penolakan.
- Bilah bawah menempel: **Simpan perubahan** dan **Cetak ulang PDF**. Setelah tersimpan muncul "Tersimpan" dan perubahan masuk Riwayat.
- Zona berbahaya di paling bawah: **Hapus pendaftaran**. Dialog konfirmasi meminta admin mengetik kodenya. Setelah dihapus, muncul pesan "MWR-005 dihapus. Nomor ini tidak dipakai lagi."
- Ubah jumlah peserta tidak mengubah kode.

### 5.2 Tambah pendaftaran manual
Formulir sama dengan detail, kode terisi otomatis (nomor berikutnya) dan dapat diubah. Ditandai "Diinput admin" pada baris daftar.

### 5.3 Pengaturan
- **Pendaftaran:** pilihan tiga mode (Otomatis, Tutup manual, Buka manual) dengan keterangan akibatnya; kolom tanggal-jam penutupan (WIB). Teks status langsung berubah: "Saat ini: dibuka (Otomatis, ditutup 16 Jan 2027 23.59 WIB)".
- **Lomba:** judul, tanggal pelaksanaan, jam, lokasi.
- **Kontak:** nama dan nomor WhatsApp panitia TKM dan panitia RA.
- **Ketentuan teknis:** kolom teks besar, dengan pratinjau.
- **Desa:** satu desa per baris.
- **Kop surat:** empat kolom teks (baris 1 sampai 4) dengan pratinjau. Logo tidak diganti lewat panel.
- **Daftar Peserta untuk umum:** saklar Tampilkan atau Sembunyikan, dengan keterangan "Bila disembunyikan, menu Peserta hilang dari halaman publik".

## 6. PDF bukti pendaftaran

A4 potret, margin 18 mm.

```
+--------------------------------+
| [logo] PANITIA HAFLAH AL MILAD |
| & AKHIR AS SANAH 1448 H        |
| [ YAYASAN ISLAM NAHDLATUTH ... ]|
| Sekretariat : PP. Nahdlatuth.. |
| WhatsApp : +62 812-1768-7686.. |
| ==============================  |
|--------------------------------|
| Bukti Pendaftaran              |
| Lomba Mewarnai Kreatif TKM &   |
| RA Se-Kecamatan Wuluhan        |
|                                |
| Kode              MWR-001      |
| Waktu daftar      21 Okt 2026  |
|                   14.32 WIB    |
| Jenis lembaga     TKM          |
| Nama lembaga      ...          |
| Desa              ...          |
| Jumlah peserta    24 anak      |
| Koordinator       ...          |
| WhatsApp          08...        |
|                                |
| Daftar peserta                 |
|  1 ...          13 ...         |
|  2 ...          14 ...         |
|                                |
| Pelaksanaan: Sabtu, 23 Jan 2027|
| 07.00 WIB sampai selesai       |
| PPTQ BUQ Yasinat, Kesilir...   |
| Kontak panitia: ...            |
| Perubahan data hanya melalui   |
| panitia.                       |
+--------------------------------+
```

- Daftar peserta satu kolom bila 30 nama atau kurang, dua kolom bila lebih (diisi turun per kolom). 100 nama harus muat dalam dua halaman tanpa nama terpotong.
- Kop memakai kop buatan sendiri (bagian 6.1), lebar penuh di atas halaman pertama. Logo tidak diregangkan.
- Huruf PDF memakai huruf yang tersedia saat konversi; uji pada tahap 1 karena konversi HTML ke PDF di Apps Script terbatas dukungan CSS-nya. Nomor halaman hanya dipakai bila terbukti didukung.
- Semua teks yang bersumber dari pengguna di-escape.

### 6.1 Kop surat

Dibuat sendiri (bukan gambar lampiran sebelumnya). Berkas acuan: `kop.html` (kode), `kop-preview.png` (pratinjau), `logo-haflah-512.png` (logo).

**Susunan:** logo di kiri, empat baris teks di kanan dengan perataan tengah, lalu garis ganda (hijau tebal dan emas tipis) di bawahnya.

| Baris | Teks (persis seperti yang diberikan) | Gaya |
|---|---|---|
| 1 | PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H | Arial tebal 16 px, Hijau Pondok |
| 2 | YAYASAN ISLAM NAHDLATUTH THALABAH | Di dalam pita Hijau Pondok, teks Emas Muda `#F6D26B`, tebal 13 px, jarak huruf renggang |
| 3 | Sekretariat : PP. Nahdlatuth Thalabah  Kesilir - Wuluhan - Jember | Arial 11,5 px, Tinta |
| 4 | WhatsApp : +62 812-1768-7686  Email : panitiahafahyasinat@gmail.com | Arial 11,5 px, Tinta |

**Logo:** berkas JPEG yang dilampirkan diolah menjadi PNG transparan (latar putih dihapus) dan dipotong rapat. Bentuknya tegak, lebarnya sekitar dua pertiga tingginya. Tinggi 88 px (sekitar 23 mm) pada kop lengkap dan 56 px pada kop ringkas. Tidak diregangkan. Berkas setinggi 512 px sudah cukup tajam untuk cetak 300 dpi.

**Dua versi**

| Versi | Dipakai di | Isi |
|---|---|---|
| Lengkap | Bukti PDF dan bagian bawah halaman Info | Logo, empat baris, garis ganda |
| Ringkas | Beranda di HP | Logo, baris 1, dan pita baris 2 |

**Catatan teknis**
- Hanya memakai tabel dan CSS polos, huruf Arial, tanpa flexbox, grid, atau font web, karena konversi HTML ke PDF di Apps Script memakai penampil lama. Logo disematkan sebagai data base64 yang dibaca dari Google Drive.
- Keempat baris teks diambil dari Pengaturan (`kop_baris1` sampai `kop_baris4`) sehingga admin dapat memperbaiki ejaan tanpa mengubah kode.
- Pratinjau di `kop-preview.png` dirender dengan huruf pengganti yang lebih lebar daripada Arial, jadi di PDF asli teks akan sedikit lebih rapat. Tampilan akhir diuji pada tahap 1.

## 7. Struktur Google Spreadsheet

Kolom berisi teks diformat **teks biasa** dan nilai yang diawali `=`, `+`, `-`, atau `@` diberi awalan aman, supaya tidak dibaca sebagai rumus.

**Sheet `Pendaftaran`** (satu baris per lembaga)

| Kolom | Isi |
|---|---|
| kode | `MWR-001` |
| waktu_daftar | Waktu server, WIB |
| jenis | `TKM` atau `RA` |
| lembaga | Nama lembaga (kapital) |
| desa | Salah satu desa |
| jumlah | Jumlah peserta |
| koordinator | Nama koordinator (kapital) |
| wa | Nomor WhatsApp, dinormalkan ke format `08...` |
| diinput_admin | `YA` bila dibuat admin |
| diubah_pada | Waktu perubahan terakhir |
| request_id | ID permintaan acak untuk mencegah data ganda dan sebagai tanda pengambilan PDF |

**Sheet `Peserta`** (satu baris per anak): `kode`, `no`, `nama_anak`.

**Sheet `Pengaturan`** (kunci dan nilai): `judul`, `mode` (`otomatis`, `tutup`, `buka`), `tutup_pada` (`2027-01-16T23:59:59+07:00`), `tanggal_pelaksanaan`, `jam`, `lokasi`, `kontak_tkm_nama`, `kontak_tkm_wa`, `kontak_ra_nama`, `kontak_ra_wa`, `ketentuan_teknis`, `daftar_desa`, `tampilkan_peserta` (`YA` atau `TIDAK`, bawaan `YA`), `kop_baris1`, `kop_baris2`, `kop_baris3`, `kop_baris4`.

**Sheet `Riwayat`**: `waktu`, `admin`, `aksi` (tambah, ubah, hapus, pengaturan), `kode`, `sebelum` (JSON), `sesudah` (JSON).

**Properti skrip (bukan sheet):** `ADMIN_EMAIL`, `COUNTER` (nomor kode terakhir yang pernah dipakai, tidak turun saat data dihapus), `LOGO_FILE_ID` (ID berkas logo PNG di Google Drive).

Karena ada dua sheet berelasi, sheet `Peserta` mempermudah penyaringan dan pencetakan per desa atau per lembaga.

## 8. Arsitektur Apps Script

**Dua deployment dari satu proyek**

| | Publik | Admin |
|---|---|---|
| Dijalankan sebagai | Pemilik skrip | Pengguna yang mengakses |
| Akses | Siapa saja | Siapa saja yang masuk dengan akun Google |
| Fungsi | `doGet` menyajikan halaman publik | `doGet` menyajikan panel admin |

Deployment admin memastikan email pengguna terbaca dan dicocokkan dengan `ADMIN_EMAIL` di sisi server pada **setiap** fungsi admin (`assertAdmin()`). Perilaku akses dua deployment ini diuji pada tahap 1 sebelum fitur lain dibuat.

**Berkas:** `Code.gs` (rute dan fungsi publik), `Admin.gs` (fungsi admin), `Util.gs` (validasi, kapitalisasi, escape, kode, waktu), `Pdf.gs`, `Index.html` dan `Admin.html` (halaman), `Style.html` (CSS bersama).

**Fungsi publik**
- `getPublicConfig()`: pengaturan yang boleh dilihat publik, status buka-tutup, dan jam server.
- `submitRegistration(payload)`: validasi ulang, kunci, buat kode, tulis, kembalikan hasil.
- `getReceiptPdf(requestId)`: PDF base64 untuk pendaftaran dengan ID itu.
- `getPublicParticipants()`: data ringkas untuk halaman Peserta (hanya kode, jenis, lembaga, desa, nama anak, waktu data). Menolak bila `tampilkan_peserta` bernilai `TIDAK`. Tidak pernah mengembalikan kolom `koordinator`, `wa`, `request_id`, atau `waktu_daftar`.

**Alur `submitRegistration`**
1. Periksa status buka-tutup memakai jam server.
2. Normalkan semua teks (rapikan spasi, kapital), periksa isian wajib, jumlah 1 sampai 100, jumlah baris sama dengan jumlah, nama kosong, nama kembar, nomor WhatsApp.
3. Ambil kunci skrip (`LockService`, tunggu maksimal 30 detik; bila gagal kembalikan pesan "server sibuk").
4. Bila `request_id` sudah ada, kembalikan hasil lama (mencegah data ganda).
5. Tentukan kode: nomor setelah `COUNTER`, lewati nomor yang sudah dipakai; tolak bila melewati 999. Simpan `COUNTER`.
6. Tulis satu baris ke `Pendaftaran` dan semua baris ke `Peserta` dengan satu panggilan `setValues`.
7. Lepas kunci, kembalikan kode, ringkasan, dan `request_id`.

**Fungsi admin (semua memanggil `assertAdmin()`):** `getDashboard`, `listRegistrations(query, filter, page)`, `getRegistration(kode)`, `saveRegistration(data, forceSave)`, `createRegistration(data)`, `deleteRegistration(kode)`, `exportData(options)`, `getSettings`, `saveSettings(data)`, `listHistory(page)`. Setiap perubahan menulis ke `Riwayat`. Setiap penyimpanan memakai kunci skrip.

**Hal teknis lain**
- Zona waktu `Asia/Jakarta` pada semua perhitungan.
- Pengaturan di-cache (`CacheService`) beberapa menit dan cache dihapus saat admin menyimpan pengaturan.
- Daftar pendaftaran admin dimuat bertahap (paginasi).
- Data Daftar Peserta di-cache 2 menit (`CacheService`, dipecah per potongan karena batas ukuran satu kunci) dan cache dihapus setiap kali admin menyimpan, menambah, atau menghapus pendaftaran. Bila total nama melampaui sekitar 5.000, pencarian dipindah ke server dengan paginasi.
- Logo kop dibaca dari Drive (`LOGO_FILE_ID`), diubah menjadi data base64, dan dipasang di HTML kop sebelum dikonversi ke PDF. Teks kop diambil dari Pengaturan.
- Semua teks pengguna di-escape sebelum masuk HTML.

## 9. Teks antarmuka

Bahasa Indonesia, kalimat biasa, kata kerja aktif, nama tombol konsisten dari awal sampai akhir alur.

| Situasi | Teks |
|---|---|
| Tombol utama beranda | Daftar sekarang |
| Tombol langkah | Lanjut, Kembali |
| Tombol akhir | Kirim pendaftaran |
| Saat mengirim | Mengirim... |
| Berhasil | Pendaftaran berhasil |
| Nama kosong | Nama anak nomor 7 belum diisi |
| Nama kembar | Nama anak nomor 12 sama dengan nomor 3 |
| Jumlah di luar rentang | Jumlah peserta harus antara 1 dan 100 |
| WhatsApp salah | Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890 |
| Gagal kirim | Pendaftaran belum terkirim. Data Anda masih tersimpan di halaman ini. Periksa sinyal lalu tekan Kirim lagi |
| Ditutup | Pendaftaran telah ditutup |
| Akses admin ditolak | Akun ini tidak terdaftar sebagai admin |
| Hapus berhasil | MWR-005 dihapus. Nomor ini tidak dipakai lagi |
| Kolom cari peserta | Cari lembaga, nama anak, atau kode |
| Hasil pencarian | 12 lembaga, 203 anak. 3 nama cocok |
| Tidak ada hasil | Tidak ada yang cocok. Ubah kata kunci atau hapus filter |
| Belum ada pendaftar | Belum ada pendaftar |
| Gagal memuat daftar | Daftar belum bisa dimuat. Periksa sinyal lalu tekan Muat ulang |
| Daftar disembunyikan | Daftar peserta belum ditampilkan oleh panitia |

## 10. Aksesibilitas dan kualitas

- Target sentuh minimal 48 x 48 px. Fokus keyboard terlihat jelas.
- Setiap isian punya label tampak, bukan hanya placeholder. Pesan kesalahan di-link ke isiannya (`aria-describedby`) dan diumumkan (`aria-live`).
- Status memakai ikon dan teks. Indikator krayon memakai warna sebagai hiasan, arti ada pada label.
- Gerak dikurangi bila pengguna meminta (`prefers-reduced-motion`).
- Tema terang saja, supaya tampilan layar dan PDF konsisten.
- Baris lembaga di Daftar Peserta memakai `aria-expanded`. Hasil pencarian diumumkan lewat `aria-live` ("12 lembaga ditemukan").
- Diuji di lebar 360 px, 412 px, dan HP layar besar, tanpa tergeser ke samping.

## 11. Pertanyaan desain yang masih terbuka

1. Apakah nada visual hijau, emas, dan krayon seperti di atas sudah sesuai selera panitia?
2. Apakah ada logo lomba atau ilustrasi lain yang ingin dipasang selain kop?
3. Apakah tombol WhatsApp di halaman Info cukup, atau ingin juga ditampilkan di halaman sukses?
4. Nama anak di Daftar Peserta tampil lengkap (usulan saat ini). Apakah panitia ingin versi singkat (misalnya nama depan dan inisial) demi privasi?
