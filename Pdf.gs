/**
 * Pdf.gs - Generator PDF Bukti Pendaftaran Resmi A4
 * Sesuai spesifikasi design.md Bagian 6 & 6.1 (Kop Resmi & Penataan Tabel)
 */

/**
 * Ambil data base64 logo (dari Drive jika LOGO_FILE_ID terpasang, atau dari DEFAULT_LOGO_BASE64)
 */
function getLogoBase64() {
  try {
    var fileId = PropertiesService.getScriptProperties().getProperty('LOGO_FILE_ID');
    if (fileId) {
      var file = DriveApp.getFileById(fileId);
      var bytes = file.getBlob().getBytes();
      return Utilities.base64Encode(bytes);
    }
  } catch (e) {
    Logger.log('Gagal memuat logo dari Drive, menggunakan logo default: ' + e.message);
  }
  
  if (typeof DEFAULT_LOGO_BASE64 !== 'undefined' && DEFAULT_LOGO_BASE64) {
    return DEFAULT_LOGO_BASE64;
  }
  return '';
}

/**
 * Format tanggal pelaksanaan agar selalu tampil dalam bahasa Indonesia rapi (bukan format ISO string)
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Sabtu, 23 Januari 2027';
  var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  if (dateStr instanceof Date) {
    if (!isNaN(dateStr.getTime())) {
      return dateStr.getDate() + ' ' + months[dateStr.getMonth()] + ' ' + dateStr.getFullYear();
    }
  }

  var s = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    var parts = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (parts) {
      var d = new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10));
      if (!isNaN(d.getTime())) {
        return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
      }
    }
  }
  return s;
}

/**
 * Generate string HTML bukti pendaftaran A4 siap cetak / konversi PDF
 */
function buildReceiptHtml(data, settings) {
  var logoBase64 = getLogoBase64();
  var logoSrc = logoBase64 ? 'data:image/png;base64,' + logoBase64 : '';
  
  var kop1 = escapeHtml(settings.kop_baris1 || 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H');
  var kop2 = escapeHtml(settings.kop_baris2 || 'YAYASAN ISLAM NAHDLATUTH THALABAH');
  var kop3 = escapeHtml(settings.kop_baris3 || 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember');
  var kop4 = escapeHtml(settings.kop_baris4 || 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com');
  
  var kode = escapeHtml(data.kode);
  var waktuDaftar = escapeHtml(data.waktu_daftar || formatDateWIB(new Date()));
  var jenis = escapeHtml(data.jenis);
  var lembaga = escapeHtml(data.lembaga);
  var desa = escapeHtml(data.desa);
  var jumlah = data.jumlah || (data.nama_anak ? data.nama_anak.length : 0);
  var koordinator = escapeHtml(data.koordinator);
  var wa = escapeHtml(data.wa);
  
  var tanggalPelaksanaan = escapeHtml(formatDisplayDate(settings.tanggal_pelaksanaan));
  var jamPelaksanaan = escapeHtml(settings.jam || '07.00 WIB sampai selesai');
  var lokasi = escapeHtml(settings.lokasi || 'PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember');
  
  var kontakPanitia = (jenis === 'RA') ?
    (settings.kontak_ra_nama || 'Ibu Fitriyah') + ' (WA: ' + (settings.kontak_ra_wa || '0822-3255-1107') + ')' :
    (settings.kontak_tkm_nama || 'Ibu Dita') + ' (WA: ' + (settings.kontak_tkm_wa || '0852-5971-9093') + ')';
    
  var namaList = Array.isArray(data.nama_anak) ? data.nama_anak : [];
  
  // Dua tabel peserta berdampingan agar hemat ruang dan muat dalam satu halaman
  var half = Math.ceil(namaList.length / 2);
  if (half === 0) half = 1;

  var leftRows = '';
  for (var i = 0; i < half; i++) {
    var no = i + 1;
    var nama = (i < namaList.length) ? escapeHtml(namaList[i]) : '&nbsp;';
    leftRows += '<tr>';
    leftRows += '<td style="width: 32px; text-align: center; font-weight: bold;">' + no + '</td>';
    leftRows += '<td>' + nama + '</td>';
    leftRows += '</tr>';
  }

  var rightRows = '';
  for (var j = half; j < half * 2; j++) {
    var hasChild = (j < namaList.length);
    var noR = hasChild ? (j + 1) : '&nbsp;';
    var namaR = hasChild ? escapeHtml(namaList[j]) : '&nbsp;';
    rightRows += '<tr>';
    rightRows += '<td style="width: 32px; text-align: center; font-weight: bold;">' + noR + '</td>';
    rightRows += '<td>' + namaR + '</td>';
    rightRows += '</tr>';
  }

  var pesertaHtml = '' +
    '<table class="wrapper-table">' +
    '  <tr>' +
    '    <td style="width: 49%; vertical-align: top; padding: 0 4px 0 0;">' +
    '      <table class="peserta-table">' +
    '        <thead>' +
    '          <tr>' +
    '            <th style="width: 32px; text-align: center;">NO</th>' +
    '            <th>NAMA LENGKAP PESERTA</th>' +
    '          </tr>' +
    '        </thead>' +
    '        <tbody>' +
    leftRows +
    '        </tbody>' +
    '      </table>' +
    '    </td>' +
    '    <td style="width: 2%;"></td>' +
    '    <td style="width: 49%; vertical-align: top; padding: 0 0 0 4px;">' +
    '      <table class="peserta-table">' +
    '        <thead>' +
    '          <tr>' +
    '            <th style="width: 32px; text-align: center;">NO</th>' +
    '            <th>NAMA LENGKAP PESERTA</th>' +
    '          </tr>' +
    '        </thead>' +
    '        <tbody>' +
    rightRows +
    '        </tbody>' +
    '      </table>' +
    '    </td>' +
    '  </tr>' +
    '</table>';
  
  var html = '' +
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
'<meta charset="utf-8">' +
'<title>Bukti Pendaftaran - ' + kode + '</title>' +
'<style>' +
'  * { box-sizing: border-box; }' +
'  @page { size: A4 portrait; margin: 8mm 12mm 8mm 12mm; }' +
'  body {' +
'    margin: 0; padding: 0;' +
'    font-family: Arial, Helvetica, sans-serif;' +
'    color: #000000;' +
'    font-size: 10px;' +
'    line-height: 1.25;' +
'    background: #FFFFFF;' +
'  }' +
'  ' +
'  /* KOP SURAT RESMI */' +
'  table.kop { width: 100%; border-collapse: collapse; margin-bottom: 2px; }' +
'  table.kop td { padding: 0; border: none; }' +
'  td.kop-logo { width: 70px; text-align: left; vertical-align: middle; }' +
'  td.kop-logo img { height: 70px; width: auto; display: block; }' +
'  td.kop-text { text-align: center; vertical-align: middle; padding-left: 6px; }' +
'  .l1 { font-size: 13px; line-height: 1.2; font-weight: bold; color: #005E39; letter-spacing: 0.2px; margin-bottom: 2px; }' +
'  .l2 { font-size: 16px; line-height: 1.2; font-weight: bold; color: #8A6D10; letter-spacing: 0.5px; margin-bottom: 3px; text-transform: uppercase; }' +
'  .l3, .l4 { font-size: 9px; line-height: 1.25; color: #000000; }' +
'  ' +
'  /* GARIS DOBEL HITAM PEMBATAS HEADER */' +
'  .garis-dobel {' +
'    border-top: 2.5px solid #000000;' +
'    border-bottom: 1px solid #000000;' +
'    height: 2px;' +
'    margin-top: 5px;' +
'    margin-bottom: 8px;' +
'  }' +
'  ' +
'  /* JUDUL DOKUMEN */' +
'  .title-section { text-align: center; margin-bottom: 8px; }' +
'  .doc-title { font-size: 15px; font-weight: bold; color: #000000; margin: 0 0 2px 0; letter-spacing: 0.5px; text-transform: uppercase; }' +
'  .doc-subtitle { font-size: 12px; font-weight: bold; color: #000000; margin: 0; }' +
'  ' +
'  /* DATA PENDAFTARAN (TANPA GARIS TABEL SESUAI PERMINTAAN) */' +
'  table.info-box { width: 99.5%; margin: 0 auto 10px auto; border-collapse: collapse; border: none; }' +
'  table.info-box td {' +
'    padding: 3px 2px;' +
'    vertical-align: top;' +
'    font-size: 12px;' +
'    border: none;' +
'    color: #000000;' +
'  }' +
'  .info-label { font-weight: bold; color: #000000; font-size: 12px; }' +
'  .info-sep { text-align: center; font-weight: bold; width: 10px; color: #000000; font-size: 12px; }' +
'  .info-val { font-weight: bold; color: #000000; font-size: 12px; }' +
'  .kode-text { font-size: 12px; font-weight: bold; color: #000000; letter-spacing: 0.5px; }' +
'  ' +
'  /* HEADING DAFTAR PESERTA (POSISI TENGAH) */' +
'  .section-heading {' +
'    font-size: 12px;' +
'    font-weight: bold;' +
'    color: #000000;' +
'    margin: 8px 0 6px 0;' +
'    text-transform: uppercase;' +
'    letter-spacing: 0.3px;' +
'    text-align: center;' +
'  }' +
'  ' +
'  /* DUA TABEL DAFTAR PESERTA (LEBAR 99.5% AGAR GARIS KANAN TIDAK TERPOTONG) */' +
'  table.wrapper-table { width: 99.5%; margin: 0 auto 8px auto; border-collapse: collapse; border: none; }' +
'  table.wrapper-table td { border: none; padding: 0; }' +
'  table.peserta-table { width: 100%; border-collapse: collapse; }' +
'  table.peserta-table th {' +
'    background: #F0F0F0;' +
'    color: #000000;' +
'    font-size: 12px;' +
'    font-weight: bold;' +
'    padding: 4px 6px;' +
'    text-align: left;' +
'    border: 1px solid #000000;' +
'  }' +
'  table.peserta-table td {' +
'    padding: 3.5px 6px;' +
'    font-size: 12px;' +
'    border: 1px solid #000000;' +
'    color: #000000;' +
'    font-weight: bold;' +
'  }' +
'  ' +
'  /* EVENT BOX & CATATAN */' +
'  table.event-box { width: 99.5%; margin: 8px auto 0 auto; border-collapse: collapse; border: 1px solid #000000; background: #FFFFFF; }' +
'  table.event-box td { padding: 5px 8px; font-size: 10px; line-height: 1.35; color: #000000; border: 1px solid #000000; }' +
'  .catatan { margin-top: 5px; font-size: 9px; color: #000000; text-align: center; font-style: italic; }' +
'</style>' +
'</head>' +
'<body>' +
'  <!-- KOP SURAT RESMI -->' +
'  <table class="kop" cellspacing="0" cellpadding="0">' +
'    <tr>' +
'      <td class="kop-logo">' +
'        ' + (logoSrc ? '<img src="' + logoSrc + '">' : '') +
'      </td>' +
'      <td class="kop-text">' +
'        <div class="l1">' + kop1 + '</div>' +
'        <div class="l2">' + kop2 + '</div>' +
'        <div class="l3">' + kop3 + '</div>' +
'        <div class="l4">' + kop4 + '</div>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'  <div class="garis-dobel"></div>' +
'  ' +
'  <!-- JUDUL DOKUMEN -->' +
'  <div class="title-section">' +
'    <div class="doc-title">BUKTI PENDAFTARAN RESMI</div>' +
'    <div class="doc-subtitle">Lomba Mewarnai Kreatif TKM &amp; RA Se-Kecamatan Wuluhan</div>' +
'  </div>' +
'  ' +
'  <!-- RINGKASAN DATA LEMBAGA (JENIS & NAMA LEMBAGA DIPISAHKAN, WARNA FONT & GARIS HITAM) -->' +
'  <table class="info-box">' +
'    <tr>' +
'      <td class="info-label" style="width: 20%;">KODE PENDAFTARAN</td>' +
'      <td class="info-sep" style="width: 2%;">:</td>' +
'      <td class="info-val" style="width: 28%;"><span class="kode-text">' + kode + '</span></td>' +
'      <td class="info-label" style="width: 20%;">WAKTU DAFTAR</td>' +
'      <td class="info-sep" style="width: 2%;">:</td>' +
'      <td class="info-val" style="width: 28%;">' + waktuDaftar + '</td>' +
'    </tr>' +
'    <tr>' +
'      <td class="info-label">JENIS LEMBAGA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + jenis + '</td>' +
'      <td class="info-label">ASAL DESA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + desa + '</td>' +
'    </tr>' +
'    <tr>' +
'      <td class="info-label">NAMA LEMBAGA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + lembaga + '</td>' +
'      <td class="info-label">KOORDINATOR</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + koordinator + '</td>' +
'    </tr>' +
'    <tr>' +
'      <td class="info-label">JUMLAH PESERTA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + jumlah + '</td>' +
'      <td class="info-label">NO. WHATSAPP</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + wa + '</td>' +
'    </tr>' +
'  </table>' +
'  ' +
'  <!-- DAFTAR NAMA PESERTA -->' +
'  <div class="section-heading">DAFTAR NAMA PESERTA</div>' +
'  ' + pesertaHtml +
'  ' +
'  <!-- INFO PELAKSANAAN & KONTAK -->' +
'  <table class="event-box">' +
'    <tr>' +
'      <td>' +
'        <b>Waktu &amp; Lokasi Lomba:</b> ' + tanggalPelaksanaan + ', Pukul ' + jamPelaksanaan + ' | Lokasi: ' + lokasi + '<br>' +
'        <b>Bantuan &amp; Layanan Panitia:</b> ' + kontakPanitia + '<br>' +
'        <b>Peringatan:</b> Bukti pendaftaran resmi ini wajib dibawa atau ditunjukkan koordinator saat registrasi ulang pada hari pelaksanaan lomba.' +
'      </td>' +
'    </tr>' +
'  </table>' +
'  ' +
'  <div class="catatan">' +
'    Perubahan data peserta hanya dapat dilakukan melalui panitia lomba. Dicetak secara sistem otomatis pada ' + formatDateWIB(new Date()) + '.' +
'  </div>' +
'</body>' +
'</html>';

  return html;
}

/**
 * Generate PDF dari data pendaftaran dan kembalikan sebagai base64 string
 */
function generateRegistrationPdfBase64(data, settings) {
  var html = buildReceiptHtml(data, settings);
  var filename = 'Bukti_Pendaftaran_' + (data.kode || 'MWR') + '.pdf';
  
  var blob = Utilities.newBlob(html, 'text/html', filename);
  var pdfBlob = blob.getAs('application/pdf').setName(filename);
  
  return Utilities.base64Encode(pdfBlob.getBytes());
}

/**
 * Buat template HTML untuk Daftar Hadir Koordinator Lembaga (Opsi A) - A4 Portrait
 */
function buildAttendanceSheetAHtml(settings, list, filterDesa) {
  var logoBase64 = getLogoBase64();
  var logoSrc = logoBase64 ? 'data:image/png;base64,' + logoBase64 : '';
  
  var kop1 = escapeHtml(settings.kop_baris1 || 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H');
  var kop2 = escapeHtml(settings.kop_baris2 || 'YAYASAN ISLAM NAHDLATUTH THALABAH');
  var kop3 = escapeHtml(settings.kop_baris3 || 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember');
  var kop4 = escapeHtml(settings.kop_baris4 || 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com');
  
  var fDesa = (filterDesa && filterDesa !== 'SEMUA' && filterDesa !== 'all') ? String(filterDesa).trim() : '';
  var subJudul = 'Lomba Mewarnai Tingkat TKM &amp; RA Se-Kecamatan Wuluhan' + (fDesa ? ' &mdash; Wilayah Desa ' + escapeHtml(fDesa) : '');
  
  var totalSantri = 0;
  var rowsHtml = '';
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var no = i + 1;
    totalSantri += (r.jumlah || 0);
    
    // Tanda tangan selang-seling (khas format absensi resmi Indonesia)
    var parafCell = (i % 2 === 0) ?
      '<div style="text-align: left; padding-left: 3px;"><span style="font-size: 8.5px; font-weight: bold; color: #444;">' + no + '.</span> .....................</div>' :
      '<div style="text-align: right; padding-right: 3px;"><span style="font-size: 8.5px; font-weight: bold; color: #444;">' + no + '.</span> .....................</div>';
    
    rowsHtml += '<tr>' +
      '<td style="text-align: center; font-weight: bold;">' + no + '</td>' +
      '<td style="text-align: center; font-family: monospace; font-weight: bold;">' + escapeHtml(r.kode) + '</td>' +
      '<td style="text-align: center; font-weight: bold;">' + escapeHtml(r.jenis) + '</td>' +
      '<td style="font-weight: bold;">' + escapeHtml(r.lembaga) + '</td>' +
      '<td>' + escapeHtml(r.desa) + '</td>' +
      '<td style="text-align: center; font-weight: bold;">' + (r.jumlah || 0) + '</td>' +
      '<td>' + escapeHtml(r.koordinator) + '</td>' +
      '<td>' + escapeHtml(r.wa) + '</td>' +
      '<td style="vertical-align: middle; padding: 4px 2px;">' + parafCell + '</td>' +
      '</tr>';
  }
  
  var tglCetak = formatDateWIB(new Date());
  
  var html = '' +
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
'<meta charset="utf-8">' +
'<title>Daftar Hadir Koordinator Lembaga</title>' +
'<style>' +
'  * { box-sizing: border-box; }' +
'  @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm; }' +
'  body {' +
'    margin: 0; padding: 0;' +
'    font-family: Arial, Helvetica, sans-serif;' +
'    color: #000000;' +
'    font-size: 9.5px;' +
'    line-height: 1.25;' +
'    background: #FFFFFF;' +
'  }' +
'  table.kop { width: 100%; border-collapse: collapse; margin-bottom: 2px; }' +
'  table.kop td { padding: 0; border: none; }' +
'  td.kop-logo { width: 68px; text-align: left; vertical-align: middle; }' +
'  td.kop-logo img { height: 68px; width: auto; display: block; }' +
'  td.kop-text { text-align: center; vertical-align: middle; padding-left: 6px; }' +
'  .l1 { font-size: 13px; line-height: 1.2; font-weight: bold; color: #005E39; letter-spacing: 0.2px; margin-bottom: 2px; }' +
'  .l2 { font-size: 16px; line-height: 1.2; font-weight: bold; color: #8A6D10; letter-spacing: 0.5px; margin-bottom: 3px; text-transform: uppercase; }' +
'  .l3, .l4 { font-size: 9px; line-height: 1.25; color: #000000; }' +
'  .garis-dobel {' +
'    border-top: 2.5px solid #000000;' +
'    border-bottom: 1px solid #000000;' +
'    height: 2px;' +
'    margin-top: 5px;' +
'    margin-bottom: 8px;' +
'  }' +
'  .judul-dokumen {' +
'    font-size: 14px;' +
'    font-weight: bold;' +
'    color: #000000;' +
'    text-align: center;' +
'    margin: 4px 0 3px 0;' +
'    text-transform: uppercase;' +
'    letter-spacing: 0.5px;' +
'  }' +
'  .sub-dokumen {' +
'    font-size: 10px;' +
'    font-weight: bold;' +
'    color: #000000;' +
'    text-align: center;' +
'    margin-bottom: 10px;' +
'  }' +
'  table.att-table { width: 99.5%; margin: 0 auto; border-collapse: collapse; border: 1px solid #000000; }' +
'  table.att-table th {' +
'    background: #F0F0F0;' +
'    color: #000000;' +
'    font-size: 9.5px;' +
'    font-weight: bold;' +
'    padding: 5px 3px;' +
'    border: 1px solid #000000;' +
'    text-align: left;' +
'  }' +
'  table.att-table td {' +
'    padding: 4px 4px;' +
'    border: 1px solid #000000;' +
'    color: #000000;' +
'    font-size: 9px;' +
'  }' +
'  .total-row td {' +
'    background: #FAFAFA;' +
'    font-weight: bold;' +
'    border-top: 2px solid #000000;' +
'  }' +
'</style>' +
'</head>' +
'<body>' +
'  <!-- KOP SURAT RESMI -->' +
'  <table class="kop" cellspacing="0" cellpadding="0">' +
'    <tr>' +
'      <td class="kop-logo">' +
'        ' + (logoSrc ? '<img src="' + logoSrc + '">' : '') +
'      </td>' +
'      <td class="kop-text">' +
'        <div class="l1">' + kop1 + '</div>' +
'        <div class="l2">' + kop2 + '</div>' +
'        <div class="l3">' + kop3 + '</div>' +
'        <div class="l4">' + kop4 + '</div>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'  <div class="garis-dobel"></div>' +
'  ' +
'  <!-- JUDUL DOKUMEN 14PX CENTER -->' +
'  <div class="judul-dokumen">DAFTAR HADIR KOORDINATOR LEMBAGA</div>' +
'  <div class="sub-dokumen">' + subJudul + '</div>' +
'  ' +
'  <!-- TABEL REKAPITULASI PRESENSI -->' +
'  <table class="att-table">' +
'    <thead>' +
'      <tr>' +
'        <th style="width: 26px; text-align: center;">NO</th>' +
'        <th style="width: 65px; text-align: center;">KODE</th>' +
'        <th style="width: 36px; text-align: center;">JENIS</th>' +
'        <th>NAMA LEMBAGA</th>' +
'        <th style="width: 75px;">DESA</th>' +
'        <th style="width: 38px; text-align: center;">SANTRI</th>' +
'        <th style="width: 105px;">KOORDINATOR</th>' +
'        <th style="width: 85px;">NO. WA</th>' +
'        <th style="width: 110px; text-align: center;">PARAF / TTD</th>' +
'      </tr>' +
'    </thead>' +
'    <tbody>' +
       rowsHtml +
'      <tr class="total-row">' +
'        <td colspan="5" style="text-align: right; font-weight: bold; padding-right: 8px;">TOTAL KESELURUHAN</td>' +
'        <td style="text-align: center; font-weight: bold;">' + totalSantri + '</td>' +
'        <td colspan="3" style="font-size: 8.5px; font-weight: bold; padding-left: 6px;">' + list.length + ' LEMBAGA TERDAFTAR</td>' +
'      </tr>' +
'    </tbody>' +
'  </table>' +
'  ' +
'  <!-- TANDA TANGAN PANITIA -->' +
'  <table style="width: 99.5%; margin: 15px auto 0 auto; border-collapse: collapse; border: none;">' +
'    <tr>' +
'      <td style="width: 60%; border: none; vertical-align: top; color: #444; font-size: 8.5px; font-style: italic;">' +
'        * Berkas absensi resmi Panitia Haflah Al Milad &amp; Akhir As Sanah 1448 H / 2027 M.<br>' +
'        Dicetak otomatis dari Sistem Pendaftaran Lomba Mewarnai pada ' + tglCetak + '.' +
'      </td>' +
'      <td style="width: 40%; border: none; text-align: center; vertical-align: top; font-size: 9.5px;">' +
'        Wuluhan, ' + formatDisplayDate(new Date()) + '<br>' +
'        <b>Panitia Pelaksana,</b><br><br><br><br>' +
'        ( .................................................. )' +
'      </td>' +
'    </tr>' +
'  </table>' +
'</body>' +
'</html>';

  return html;
}

/**
 * Buat template HTML untuk Daftar Hadir Peserta per Lembaga (Opsi B) - A4 Portrait
 */
function buildAttendanceSheetBHtml(settings, list, filterDesa) {
  var logoBase64 = getLogoBase64();
  var logoSrc = logoBase64 ? 'data:image/png;base64,' + logoBase64 : '';
  
  var kop1 = escapeHtml(settings.kop_baris1 || 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H');
  var kop2 = escapeHtml(settings.kop_baris2 || 'YAYASAN ISLAM NAHDLATUTH THALABAH');
  var kop3 = escapeHtml(settings.kop_baris3 || 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember');
  var kop4 = escapeHtml(settings.kop_baris4 || 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com');
  
  var fDesa = (filterDesa && filterDesa !== 'SEMUA' && filterDesa !== 'all') ? String(filterDesa).trim() : '';
  var subJudul = 'Lomba Mewarnai Tingkat TKM &amp; RA Se-Kecamatan Wuluhan' + (fDesa ? ' &mdash; Wilayah Desa ' + escapeHtml(fDesa) : '');
  
  var blocksHtml = '';
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var pesList = r.peserta || [];
    
    var childRows = '';
    if (pesList.length === 0) {
      childRows = '<tr><td colspan="4" style="text-align: center; font-style: italic; color: #666; padding: 6px;">Belum ada nama peserta anak yang dimasukkan</td></tr>';
    } else {
      for (var c = 0; c < pesList.length; c++) {
        var ch = pesList[c];
        var cNo = c + 1;
        var pCell = (c % 2 === 0) ?
          '<div style="text-align: left; padding-left: 4px;"><span style="font-size: 8.5px; font-weight: bold; color: #444;">' + cNo + '.</span> .....................</div>' :
          '<div style="text-align: right; padding-right: 4px;"><span style="font-size: 8.5px; font-weight: bold; color: #444;">' + cNo + '.</span> .....................</div>';
        
        childRows += '<tr>' +
          '<td style="text-align: center; font-weight: bold; width: 32px;">' + cNo + '</td>' +
          '<td style="font-weight: bold; text-transform: uppercase;">' + escapeHtml(ch.nama) + '</td>' +
          '<td style="width: 150px;">' + escapeHtml(r.lembaga) + '</td>' +
          '<td style="width: 120px; vertical-align: middle; padding: 3px 2px;">' + pCell + '</td>' +
          '</tr>';
      }
    }
    
    var namaLembagaFormatted = r.lembaga;
    if (r.jenis && r.lembaga.toUpperCase().indexOf(r.jenis.toUpperCase()) !== 0) {
      namaLembagaFormatted = r.jenis + ' ' + r.lembaga;
    }

    blocksHtml += '' +
      '<div class="lembaga-section">' +
      '  <table class="lembaga-banner">' +
      '    <tr>' +
      '      <td style="width: 65%; font-size: 10px;">' +
      '        <span class="kode-pill">' + escapeHtml(r.kode) + '</span> ' +
      '        <b>' + escapeHtml(namaLembagaFormatted) + '</b> &mdash; Desa ' + escapeHtml(r.desa) + '' +
      '      </td>' +
      '      <td style="width: 35%; text-align: right; font-size: 9px;">' +
      '        Koordinator: <b>' + escapeHtml(r.koordinator) + '</b> (' + escapeHtml(r.wa) + ') | <b>' + (r.jumlah || pesList.length) + ' Peserta</b>' +
      '      </td>' +
      '    </tr>' +
      '  </table>' +
      '  <table class="peserta-b-table">' +
      '    <thead>' +
      '      <tr>' +
      '        <th style="width: 32px; text-align: center;">NO</th>' +
      '        <th>NAMA LENGKAP SANTRI / PESERTA</th>' +
      '        <th style="width: 150px;">ASAL LEMBAGA</th>' +
      '        <th style="width: 120px; text-align: center;">PARAF / KEHADIRAN</th>' +
      '      </tr>' +
      '    </thead>' +
      '    <tbody>' +
             childRows +
      '    </tbody>' +
      '  </table>' +
      '</div>';
  }
  
  var tglCetak = formatDateWIB(new Date());
  
  var html = '' +
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
'<meta charset="utf-8">' +
'<title>Daftar Hadir Peserta Lomba Mewarnai</title>' +
'<style>' +
'  * { box-sizing: border-box; }' +
'  @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm; }' +
'  body {' +
'    margin: 0; padding: 0;' +
'    font-family: Arial, Helvetica, sans-serif;' +
'    color: #000000;' +
'    font-size: 9.5px;' +
'    line-height: 1.25;' +
'    background: #FFFFFF;' +
'  }' +
'  table.kop { width: 100%; border-collapse: collapse; margin-bottom: 2px; }' +
'  table.kop td { padding: 0; border: none; }' +
'  td.kop-logo { width: 68px; text-align: left; vertical-align: middle; }' +
'  td.kop-logo img { height: 68px; width: auto; display: block; }' +
'  td.kop-text { text-align: center; vertical-align: middle; padding-left: 6px; }' +
'  .l1 { font-size: 13px; line-height: 1.2; font-weight: bold; color: #005E39; letter-spacing: 0.2px; margin-bottom: 2px; }' +
'  .l2 { font-size: 16px; line-height: 1.2; font-weight: bold; color: #8A6D10; letter-spacing: 0.5px; margin-bottom: 3px; text-transform: uppercase; }' +
'  .l3, .l4 { font-size: 9px; line-height: 1.25; color: #000000; }' +
'  .garis-dobel {' +
'    border-top: 2.5px solid #000000;' +
'    border-bottom: 1px solid #000000;' +
'    height: 2px;' +
'    margin-top: 5px;' +
'    margin-bottom: 8px;' +
'  }' +
'  .judul-dokumen {' +
'    font-size: 14px;' +
'    font-weight: bold;' +
'    color: #000000;' +
'    text-align: center;' +
'    margin: 4px 0 3px 0;' +
'    text-transform: uppercase;' +
'    letter-spacing: 0.5px;' +
'  }' +
'  .sub-dokumen {' +
'    font-size: 10px;' +
'    font-weight: bold;' +
'    color: #000000;' +
'    text-align: center;' +
'    margin-bottom: 10px;' +
'  }' +
'  .lembaga-section {' +
'    page-break-inside: avoid;' +
'    margin-bottom: 12px;' +
'  }' +
'  table.lembaga-banner {' +
'    width: 99.5%;' +
'    margin: 0 auto;' +
'    border-collapse: collapse;' +
'    background: #F4F6F4;' +
'    border: 1px solid #000000;' +
'    border-bottom: none;' +
'  }' +
'  table.lembaga-banner td {' +
'    padding: 4px 6px;' +
'    color: #000000;' +
'  }' +
'  .kode-pill {' +
'    display: inline-block;' +
'    padding: 1px 5px;' +
'    font-family: monospace;' +
'    font-weight: bold;' +
'    font-size: 9px;' +
'    background: #005E39;' +
'    color: #FFFFFF;' +
'    border-radius: 3px;' +
'    margin-right: 4px;' +
'  }' +
'  table.peserta-b-table { width: 99.5%; margin: 0 auto; border-collapse: collapse; border: 1px solid #000000; }' +
'  table.peserta-b-table th {' +
'    background: #EAEAEA;' +
'    color: #000000;' +
'    font-size: 9px;' +
'    font-weight: bold;' +
'    padding: 4px 3px;' +
'    border: 1px solid #000000;' +
'    text-align: left;' +
'  }' +
'  table.peserta-b-table td {' +
'    padding: 3.5px 5px;' +
'    border: 1px solid #000000;' +
'    color: #000000;' +
'    font-size: 9px;' +
'  }' +
'</style>' +
'</head>' +
'<body>' +
'  <!-- KOP SURAT RESMI -->' +
'  <table class="kop" cellspacing="0" cellpadding="0">' +
'    <tr>' +
'      <td class="kop-logo">' +
'        ' + (logoSrc ? '<img src="' + logoSrc + '">' : '') +
'      </td>' +
'      <td class="kop-text">' +
'        <div class="l1">' + kop1 + '</div>' +
'        <div class="l2">' + kop2 + '</div>' +
'        <div class="l3">' + kop3 + '</div>' +
'        <div class="l4">' + kop4 + '</div>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'  <div class="garis-dobel"></div>' +
'  ' +
'  <!-- JUDUL DOKUMEN 14PX CENTER -->' +
'  <div class="judul-dokumen">DAFTAR HADIR PESERTA LOMBA MEWARNAI</div>' +
'  <div class="sub-dokumen">' + subJudul + '</div>' +
'  ' +
'  <!-- BLOK PER LEMBAGA -->' +
       blocksHtml +
'  ' +
'  <!-- TANDA TANGAN PANITIA -->' +
'  <table style="width: 99.5%; margin: 15px auto 0 auto; border-collapse: collapse; border: none; page-break-inside: avoid;">' +
'    <tr>' +
'      <td style="width: 60%; border: none; vertical-align: top; color: #444; font-size: 8.5px; font-style: italic;">' +
'        * Berkas absensi resmi Panitia Haflah Al Milad &amp; Akhir As Sanah 1448 H / 2027 M.<br>' +
'        Dicetak otomatis dari Sistem Pendaftaran Lomba Mewarnai pada ' + tglCetak + '.' +
'      </td>' +
'      <td style="width: 40%; border: none; text-align: center; vertical-align: top; font-size: 9.5px;">' +
'        Wuluhan, ' + formatDisplayDate(new Date()) + '<br>' +
'        <b>Panitia Pelaksana,</b><br><br><br><br>' +
'        ( .................................................. )' +
'      </td>' +
'    </tr>' +
'  </table>' +
'</body>' +
'</html>';

  return html;
}

/**
 * Generate PDF Daftar Hadir Koordinator (Opsi A) dan kembalikan sebagai base64 string
 */
function generateAttendancePdfABase64(settings, list, filterDesa, filename) {
  var html = buildAttendanceSheetAHtml(settings, list, filterDesa);
  var fn = filename || 'Daftar_Hadir_Koordinator.pdf';
  var blob = Utilities.newBlob(html, 'text/html', fn);
  var pdfBlob = blob.getAs('application/pdf').setName(fn);
  return Utilities.base64Encode(pdfBlob.getBytes());
}

/**
 * Generate PDF Daftar Hadir Peserta per Lembaga (Opsi B) dan kembalikan sebagai base64 string
 */
function generateAttendancePdfBBase64(settings, list, filterDesa, filename) {
  var html = buildAttendanceSheetBHtml(settings, list, filterDesa);
  var fn = filename || 'Daftar_Hadir_Peserta.pdf';
  var blob = Utilities.newBlob(html, 'text/html', fn);
  var pdfBlob = blob.getAs('application/pdf').setName(fn);
  return Utilities.base64Encode(pdfBlob.getBytes());
}
