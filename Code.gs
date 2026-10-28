/**
 * Code.gs - Router dan Layanan Publik Web Pendaftaran
 * Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan
 */

/**
 * Handle HTTP GET Request
 * Mendukung routing publik dan admin via URL parameter ?page=admin
 * atau melalui 2 deployment terpisah dari proyek yang sama
 */
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page).toLowerCase() : '';
  
  if (page === 'admin') {
    return HtmlService.createTemplateFromFile('AdminPage')
      .evaluate()
      .setTitle('Panel Admin - Lomba Mewarnai Kreatif 1448 H')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  }
  
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
}

/**
 * Inisialisasi struktur Google Spreadsheet dan konfigurasi awal
 * Jalankan fungsi ini satu kali di Apps Script Editor untuk menyiapkan seluruh sheet
 */
function initSpreadsheet() {
  var ss = getAppSpreadsheet();
  
  // 1. Sheet Pendaftaran
  getOrCreateSheet(ss, 'Pendaftaran', [
    'kode', 'waktu_daftar', 'jenis', 'lembaga', 'desa', 'jumlah',
    'koordinator', 'wa', 'diinput_admin', 'diubah_pada', 'request_id'
  ]);
  
  // 2. Sheet Peserta
  getOrCreateSheet(ss, 'Peserta', [
    'kode', 'no', 'nama_anak'
  ]);
  
  // 3. Sheet Riwayat
  getOrCreateSheet(ss, 'Riwayat', [
    'waktu', 'admin', 'aksi', 'kode', 'sebelum', 'sesudah'
  ]);
  
  // 4. Sheet Pengaturan
  var setSheet = getOrCreateSheet(ss, 'Pengaturan', ['kunci', 'nilai']);
  if (setSheet.getLastRow() <= 1) {
    var defaultSettings = [
      ['judul', 'Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan'],
      ['mode', 'otomatis'],
      ['tutup_pada', '2027-01-16T23:59:59+07:00'],
      ['tanggal_pelaksanaan', 'Sabtu, 23 Januari 2027'],
      ['jam', '07.00 WIB sampai selesai'],
      ['lokasi', 'PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember'],
      ['kontak_tkm_nama', 'Ibu Dita'],
      ['kontak_tkm_wa', '0852-5971-9093'],
      ['kontak_ra_nama', 'Ibu Fitriyah'],
      ['kontak_ra_wa', '0822-3255-1107'],
      ['ketentuan_teknis', '1. Peserta adalah pasangan ibu dan anak dari jenjang TKM dan RA se-Kecamatan Wuluhan.\n2. Meja lipat dan krayon dibawa sendiri oleh masing-masing peserta.\n3. Kertas gambar resmi disediakan oleh panitia.\n4. Kriteria penilaian: kreativitas warna, kerapian, dan kekompakan ibu dan anak.'],
      ['daftar_desa', "Ampel\nDukuh Dempok\nGlundengan\nKesilir\nLojejer\nTamansari\nTanjungrejo"],
      ['tampilkan_peserta', 'YA'],
      ['kop_baris1', 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H'],
      ['kop_baris2', 'YAYASAN ISLAM NAHDLATUTH THALABAH'],
      ['kop_baris3', 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember'],
      ['kop_baris4', 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com'],
      ['admin_pin', '123456'],
      ['banner_order_url', ''],
      ['banner_slide_1', ''],
      ['banner_slide_2', ''],
      ['banner_slide_3', ''],
      ['banner_slide_4', ''],
      ['banner_slide_5', '']
    ];
    setSheet.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);
  }
  
  // Inisialisasi Script Properties jika belum ada
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('COUNTER')) {
    props.setProperty('COUNTER', '0');
  }
  if (!props.getProperty('ADMIN_PIN')) {
    props.setProperty('ADMIN_PIN', '123456');
  }
  if (!props.getProperty('ADMIN_EMAIL')) {
    var currentUser = Session.getActiveUser().getEmail();
    if (currentUser) {
      props.setProperty('ADMIN_EMAIL', currentUser);
    }
  }
  
  return 'Inisialisasi Spreadsheet Berhasil!';
}

/**
 * Konfigurasi publik dan penentuan status buka-tutup pendaftaran
 */
function getPublicConfig() {
  var ss = getAppSpreadsheet();
  var settings = getSettingsFromSheet(ss);
  
  var now = new Date();
  var mode = settings.mode || 'otomatis';
  var tutupPadaStr = normalizeDateToISO(settings.tutup_pada || '2027-01-16T23:59:59+07:00');
  var tutupDate = new Date(tutupPadaStr);
  
  var status = 'open';
  if (mode === 'tutup') {
    status = 'closed';
  } else if (mode === 'buka') {
    status = 'open';
  } else {
    // Mode otomatis: ikut jam server
    status = (now.getTime() <= tutupDate.getTime()) ? 'open' : 'closed';
  }
  
  var daftarDesaStr = settings.daftar_desa || "Ampel\nDukuh Dempok\nGlundengan\nKesilir\nLojejer\nTamansari\nTanjungrejo";
  var desaList = daftarDesaStr.split('\n').map(function(d) { return d.trim(); }).filter(Boolean);
  
  return {
    status: status,
    mode: mode,
    server_time: getNowISOString(),
    tutup_pada: tutupPadaStr,
    judul: settings.judul || 'Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan',
    tanggal_pelaksanaan: settings.tanggal_pelaksanaan || 'Sabtu, 23 Januari 2027',
    jam: settings.jam || '07.00 WIB sampai selesai',
    lokasi: settings.lokasi || 'PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember',
    kontak_tkm_nama: settings.kontak_tkm_nama || 'Ibu Dita',
    kontak_tkm_wa: settings.kontak_tkm_wa || '0852-5971-9093',
    kontak_ra_nama: settings.kontak_ra_nama || 'Ibu Fitriyah',
    kontak_ra_wa: settings.kontak_ra_wa || '0822-3255-1107',
    ketentuan_teknis: settings.ketentuan_teknis || 'Ketentuan akan diumumkan oleh panitia',
    daftar_desa: desaList,
    tampilkan_peserta: (settings.tampilkan_peserta || 'YA') === 'YA',
    kop: {
      baris1: settings.kop_baris1 || 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H',
      baris2: settings.kop_baris2 || 'YAYASAN ISLAM NAHDLATUTH THALABAH',
      baris3: settings.kop_baris3 || 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember',
      baris4: settings.kop_baris4 || 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com'
    },
    banner_slides: [
      settings.banner_slide_1 || '',
      settings.banner_slide_2 || '',
      settings.banner_slide_3 || '',
      settings.banner_slide_4 || '',
      settings.banner_slide_5 || ''
    ],
    banner_order_url: settings.banner_order_url || '',
    logo_base64: getLogoBase64()
  };
}

/**
 * Submit Pendaftaran Publik (dengan LockService & Idempotensi request_id)
 */
function submitRegistration(payload) {
  // 1. Cek status pendaftaran di server
  var config = getPublicConfig();
  if (config.status !== 'open') {
    throw new Error('Pendaftaran telah ditutup dan data tidak dapat dikirim. Silakan hubungi panitia.');
  }
  
  // 2. Validasi kelayakan data
  var validation = validateRegistrationData(payload, true);
  if (!validation.valid) {
    throw new Error(validation.errors.join('. '));
  }
  
  var clean = validation.cleanData;
  var requestId = String(payload.request_id || '').trim();
  if (!requestId) {
    requestId = Utilities.getUuid();
  }
  
  // 3. Eksekusi dengan ScriptLock
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var regSheet = getOrCreateSheet(ss, 'Pendaftaran');
    var pesSheet = getOrCreateSheet(ss, 'Peserta');
    var props = PropertiesService.getScriptProperties();
    
    // 4. Idempotensi: Cek apakah request_id ini sudah pernah terkirim sebelumnya
    var regData = regSheet.getDataRange().getValues();
    var idxReqId = regData[0].indexOf('request_id');
    var idxKode = regData[0].indexOf('kode');
    var idxWaktu = regData[0].indexOf('waktu_daftar');
    var idxLembaga = regData[0].indexOf('lembaga');
    var idxDesa = regData[0].indexOf('desa');
    var idxJumlah = regData[0].indexOf('jumlah');
    
    for (var i = 1; i < regData.length; i++) {
      if (String(regData[i][idxReqId]).trim() === requestId) {
        // Sudah pernah masuk, kembalikan data yang sama persis tanpa menduplikasi!
        return {
          success: true,
          kode: regData[i][idxKode],
          request_id: requestId,
          summary: {
            lembaga: regData[i][idxLembaga],
            desa: regData[i][idxDesa],
            jumlah: regData[i][idxJumlah],
            waktu_daftar: formatDateWIB(regData[i][idxWaktu])
          }
        };
      }
    }
    
    // 5. Tentukan nomor kode berurutan MWR-xxx
    var counter = parseInt(props.getProperty('COUNTER') || '0', 10);
    counter++;
    var kode = formatCode(counter);
    props.setProperty('COUNTER', String(counter));
    
    var nowWIB = getNowISOString();
    
    // 6. Tulis ke sheet Pendaftaran
    regSheet.appendRow([
      sanitizeFormulaInjection(kode),
      nowWIB,
      sanitizeFormulaInjection(clean.jenis),
      sanitizeFormulaInjection(clean.lembaga),
      sanitizeFormulaInjection(clean.desa),
      clean.jumlah,
      sanitizeFormulaInjection(clean.koordinator),
      sanitizeFormulaInjection(clean.wa),
      'TIDAK',
      nowWIB,
      requestId
    ]);
    
    // 7. Tulis ke sheet Peserta (batch setValues)
    var pesRows = [];
    for (var k = 0; k < clean.nama_anak.length; k++) {
      pesRows.push([
        sanitizeFormulaInjection(kode),
        k + 1,
        sanitizeFormulaInjection(clean.nama_anak[k])
      ]);
    }
    
    if (pesRows.length > 0) {
      var startRow = pesSheet.getLastRow() + 1;
      pesSheet.getRange(startRow, 1, pesRows.length, 3).setValues(pesRows);
    }
    
    // 8. Hapus cache peserta publik agar segera update
    CacheService.getScriptCache().remove('public_participants');
    
    return {
      success: true,
      kode: kode,
      request_id: requestId,
      summary: {
        lembaga: clean.lembaga,
        desa: clean.desa,
        jumlah: clean.jumlah,
        waktu_daftar: formatDateWIB(nowWIB)
      }
    };
  });
}

/**
 * Ambil bukti pendaftaran PDF resmi dalam bentuk base64
 */
function getReceiptPdf(requestIdOrKode) {
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  var settings = getSettingsFromSheet(ss);
  
  if (!regSheet || regSheet.getLastRow() <= 1) {
    throw new Error('Data pendaftaran belum tersedia');
  }
  
  var regData = regSheet.getDataRange().getValues();
  var headers = regData[0];
  var idxKode = headers.indexOf('kode');
  var idxReqId = headers.indexOf('request_id');
  
  var targetRow = null;
  var searchKey = String(requestIdOrKode).trim();
  
  for (var i = 1; i < regData.length; i++) {
    if (String(regData[i][idxReqId]).trim() === searchKey || String(regData[i][idxKode]).trim() === searchKey) {
      targetRow = regData[i];
      break;
    }
  }
  
  if (!targetRow) {
    throw new Error('Data bukti pendaftaran tidak ditemukan');
  }
  
  var kode = targetRow[idxKode];
  var namaAnak = [];
  if (pesSheet && pesSheet.getLastRow() > 1) {
    var pesData = pesSheet.getDataRange().getValues();
    for (var j = 1; j < pesData.length; j++) {
      if (String(pesData[j][0]).trim() === kode) {
        namaAnak.push(String(pesData[j][2]));
      }
    }
  }
  
  var regObj = {
    kode: targetRow[idxKode],
    waktu_daftar: formatDateWIB(targetRow[headers.indexOf('waktu_daftar')]),
    jenis: targetRow[headers.indexOf('jenis')],
    lembaga: targetRow[headers.indexOf('lembaga')],
    desa: targetRow[headers.indexOf('desa')],
    jumlah: namaAnak.length || targetRow[headers.indexOf('jumlah')],
    koordinator: targetRow[headers.indexOf('koordinator')],
    wa: targetRow[headers.indexOf('wa')],
    nama_anak: namaAnak
  };
  
  var base64Pdf = generateRegistrationPdfBase64(regObj, settings);
  
  return {
    success: true,
    kode: kode,
    filename: 'Bukti_Pendaftaran_' + kode + '.pdf',
    base64: base64Pdf
  };
}

/**
 * Ambil data Daftar Peserta Publik (Hanya baca, data terbatas tanpa kontak, ter-cache 2 menit)
 */
function getPublicParticipants() {
  var config = getPublicConfig();
  if (!config.tampilkan_peserta) {
    throw new Error('Daftar peserta belum ditampilkan oleh panitia');
  }
  
  var cache = CacheService.getScriptCache();
  var cached = cache.get('public_participants');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  
  if (!regSheet || regSheet.getLastRow() <= 1) {
    var emptyResult = {
      success: true,
      institutions: [],
      totalLembaga: 0,
      totalAnak: 0,
      lastUpdated: formatDateWIB(new Date(), "HH.mm 'WIB'")
    };
    return emptyResult;
  }
  
  var regRows = regSheet.getDataRange().getValues();
  var headers = regRows[0];
  var idxKode = headers.indexOf('kode');
  var idxJenis = headers.indexOf('jenis');
  var idxLembaga = headers.indexOf('lembaga');
  var idxDesa = headers.indexOf('desa');
  
  // Baca semua anak
  var childrenMap = {};
  if (pesSheet && pesSheet.getLastRow() > 1) {
    var pesRows = pesSheet.getDataRange().getValues();
    for (var j = 1; j < pesRows.length; j++) {
      var k = String(pesRows[j][0]).trim();
      var nama = String(pesRows[j][2]).trim();
      if (!childrenMap[k]) childrenMap[k] = [];
      childrenMap[k].push(nama);
    }
  }
  
  var institutions = [];
  var totalAnak = 0;
  
  for (var i = 1; i < regRows.length; i++) {
    var kode = String(regRows[i][idxKode]).trim();
    var anakList = childrenMap[kode] || [];
    totalAnak += anakList.length;
    
    // Privasi: TIDAK pernah menyertakan koordinator, wa, waktu_daftar, atau request_id!
    institutions.push({
      kode: kode,
      jenis: regRows[i][idxJenis],
      lembaga: regRows[i][idxLembaga],
      desa: regRows[i][idxDesa],
      jumlah: anakList.length,
      nama_anak: anakList
    });
  }
  
  // Urutkan Nama Lembaga A sampai Z (Aturan PRD P10)
  institutions.sort(function(a, b) {
    return a.lembaga.localeCompare(b.lembaga, 'id', { sensitivity: 'base' });
  });
  
  var result = {
    success: true,
    institutions: institutions,
    totalLembaga: institutions.length,
    totalAnak: totalAnak,
    lastUpdated: formatDateWIB(new Date(), "HH.mm 'WIB'")
  };
  
  try {
    cache.put('public_participants', JSON.stringify(result), 120); // 2 menit cache
  } catch (e) {
    Logger.log('Cache put failed: ' + e.message);
  }
  
  return result;
}
