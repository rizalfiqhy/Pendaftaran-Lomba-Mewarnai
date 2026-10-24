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
  
  var tanggalPelaksanaan = escapeHtml(settings.tanggal_pelaksanaan || 'Sabtu, 23 Januari 2027');
  var jamPelaksanaan = escapeHtml(settings.jam || '07.00 WIB sampai selesai');
  var lokasi = escapeHtml(settings.lokasi || 'PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember');
  
  var kontakPanitia = (jenis === 'RA') ?
    (settings.kontak_ra_nama || 'Ibu Fitriyah') + ' (WA: ' + (settings.kontak_ra_wa || '0822-3255-1107') + ')' :
    (settings.kontak_tkm_nama || 'Ibu Dita') + ' (WA: ' + (settings.kontak_tkm_wa || '0852-5971-9093') + ')';
    
  var namaList = Array.isArray(data.nama_anak) ? data.nama_anak : [];
  
  // Penataan daftar peserta: 1 kolom bila <= 30 anak, 2 kolom bila > 30 anak
  var pesertaHtml = '';
  if (namaList.length <= 30) {
    pesertaHtml += '<table class="peserta-table single-col">';
    pesertaHtml += '<tr><th style="width:40px;">NO</th><th>NAMA LENGKAP PESERTA</th><th style="width:65px;">PARAF</th></tr>';
    for (var i = 0; i < namaList.length; i++) {
      var no = i + 1;
      var nama = escapeHtml(namaList[i]);
      pesertaHtml += '<tr>';
      pesertaHtml += '<td class="col-no">' + no + '</td>';
      pesertaHtml += '<td class="col-nama">' + nama + '</td>';
      pesertaHtml += '<td class="col-paraf">&nbsp;</td>';
      pesertaHtml += '</tr>';
    }
    pesertaHtml += '</table>';
  } else {
    var half = Math.ceil(namaList.length / 2);
    pesertaHtml += '<table class="peserta-table double-col">';
    pesertaHtml += '<tr>';
    pesertaHtml += '<th style="width:28px;">NO</th><th>NAMA PESERTA</th><th style="width:45px;">PARAF</th>';
    pesertaHtml += '<th style="width:28px; border-left: 2px solid #005E39;">NO</th><th>NAMA PESERTA</th><th style="width:45px;">PARAF</th>';
    pesertaHtml += '</tr>';
    
    for (var r = 0; r < half; r++) {
      var no1 = r + 1;
      var nama1 = escapeHtml(namaList[r]);
      
      var idx2 = r + half;
      var no2 = idx2 < namaList.length ? (idx2 + 1) : '';
      var nama2 = idx2 < namaList.length ? escapeHtml(namaList[idx2]) : '';
      
      pesertaHtml += '<tr>';
      pesertaHtml += '<td class="col-no">' + no1 + '</td>';
      pesertaHtml += '<td class="col-nama">' + nama1 + '</td>';
      pesertaHtml += '<td class="col-paraf">&nbsp;</td>';
      
      pesertaHtml += '<td class="col-no" style="border-left: 2px solid #005E39;">' + (no2 ? no2 : '') + '</td>';
      pesertaHtml += '<td class="col-nama">' + (nama2 ? nama2 : '&nbsp;') + '</td>';
      pesertaHtml += '<td class="col-paraf">' + (no2 ? '&nbsp;' : '') + '</td>';
      pesertaHtml += '</tr>';
    }
    pesertaHtml += '</table>';
  }
  
  var html = '' +
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
'<meta charset="utf-8">' +
'<title>Bukti Pendaftaran - ' + kode + '</title>' +
'<style>' +
'  @page { size: A4 portrait; margin: 12mm 15mm 12mm 15mm; }' +
'  body {' +
'    margin: 0; padding: 0;' +
'    font-family: Arial, Helvetica, sans-serif;' +
'    color: #1C2A21;' +
'    font-size: 11px;' +
'    line-height: 1.35;' +
'    background: #FFFFFF;' +
'  }' +
'  table.kop { width: 100%; border-collapse: collapse; margin-bottom: 4px; }' +
'  table.kop td { padding: 0; }' +
'  td.kop-logo { width: 75px; text-align: left; vertical-align: middle; }' +
'  td.kop-logo img { height: 75px; width: auto; display: block; }' +
'  td.kop-text { text-align: center; vertical-align: middle; padding-left: 6px; }' +
'  .l1 { font-size: 13.5px; line-height: 1.2; font-weight: bold; color: #005E39; letter-spacing: 0.2px; }' +
'  .l2 { margin: 4px 0 4px; background: #005E39; color: #F6D26B; font-size: 11px; line-height: 1.2; font-weight: bold; letter-spacing: 1.2px; padding: 3px 6px; }' +
'  .l3, .l4 { font-size: 9.5px; line-height: 1.35; color: #1C2A21; }' +
'  .garis-hijau { height: 2.5px; background: #005E39; margin-top: 6px; }' +
'  .garis-emas  { height: 1.2px; background: #EEB92B; margin-top: 2px; margin-bottom: 12px; }' +
'  ' +
'  .title-section { text-align: center; margin-bottom: 12px; }' +
'  .doc-title { font-size: 15px; font-weight: bold; color: #005E39; margin: 0 0 2px 0; letter-spacing: 0.5px; }' +
'  .doc-subtitle { font-size: 11px; font-weight: bold; color: #1C2A21; margin: 0; }' +
'  ' +
'  .info-box { width: 100%; border-collapse: collapse; margin-bottom: 12px; background: #FAFCFA; border: 1px solid #CBD8CE; }' +
'  .info-box td { padding: 5px 8px; vertical-align: top; font-size: 10.5px; border-bottom: 1px solid #E7F2E9; }' +
'  .info-label { width: 130px; font-weight: bold; color: #005E39; }' +
'  .info-sep { width: 10px; text-align: center; font-weight: bold; }' +
'  .info-val { color: #1C2A21; font-weight: bold; }' +
'  .kode-badge { display: inline-block; padding: 2px 10px; background: #005E39; color: #FFFFFF; font-weight: bold; font-size: 14px; border-radius: 4px; letter-spacing: 1px; }' +
'  ' +
'  .section-heading { font-size: 11px; font-weight: bold; color: #005E39; border-bottom: 1.5px solid #005E39; padding-bottom: 3px; margin: 10px 0 6px 0; text-transform: uppercase; }' +
'  ' +
'  table.peserta-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }' +
'  table.peserta-table th {' +
'    background: #005E39; color: #FFFFFF; font-size: 9.5px; font-weight: bold; padding: 4px 6px; text-align: left; border: 1px solid #005E39;' +
'  }' +
'  table.peserta-table td {' +
'    padding: 3px 5px; font-size: 9.5px; border: 1px solid #CBD8CE;' +
'  }' +
'  table.peserta-table tr:nth-child(even) { background: #F6FAF7; }' +
'  .col-no { text-align: center; font-weight: bold; width: 26px; }' +
'  .col-nama { font-weight: bold; color: #1C2A21; }' +
'  .col-paraf { width: 45px; text-align: center; }' +
'  ' +
'  .event-box { width: 100%; border-collapse: collapse; margin-top: 8px; border: 1px dashed #005E39; background: #E7F2E9; border-radius: 4px; }' +
'  .event-box td { padding: 7px 10px; font-size: 9.5px; line-height: 1.4; color: #1C2A21; }' +
'  .catatan { margin-top: 8px; font-size: 8.5px; color: #555555; text-align: center; font-style: italic; }' +
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
'  <div class="garis-hijau"></div>' +
'  <div class="garis-emas"></div>' +
'  ' +
'  <!-- JUDUL DOKUMEN -->' +
'  <div class="title-section">' +
'    <div class="doc-title">BUKTI PENDAFTARAN RESMI</div>' +
'    <div class="doc-subtitle">Lomba Mewarnai Kreatif TKM &amp; RA Se-Kecamatan Wuluhan</div>' +
'  </div>' +
'  ' +
'  <!-- RINGKASAN DATA LEMBAGA -->' +
'  <table class="info-box">' +
'    <tr>' +
'      <td class="info-label">KODE PENDAFTARAN</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val"><span class="kode-badge">' + kode + '</span></td>' +
'      <td class="info-label">WAKTU DAFTAR</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + waktuDaftar + '</td>' +
'    </tr>' +
'    <tr>' +
'      <td class="info-label">JENIS &amp; NAMA LEMBAGA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + jenis + ' ' + lembaga + '</td>' +
'      <td class="info-label">ASAL DESA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + desa + '</td>' +
'    </tr>' +
'    <tr>' +
'      <td class="info-label">JUMLAH PESERTA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + jumlah + ' Anak Peserta</td>' +
'      <td class="info-label">KOORDINATOR / WA</td>' +
'      <td class="info-sep">:</td>' +
'      <td class="info-val">' + koordinator + ' (' + wa + ')</td>' +
'    </tr>' +
'  </table>' +
'  ' +
'  <!-- DAFTAR NAMA PESERTA -->' +
'  <div class="section-heading">Daftar Nama Anak Peserta Lomba (' + jumlah + ' Anak)</div>' +
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
