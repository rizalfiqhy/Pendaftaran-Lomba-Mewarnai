/**
 * Util.gs - Fungsi utilitas, validasi, keamanan, dan format data
 * Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan
 */

var TIMEZONE = 'Asia/Jakarta';

/**
 * Format tanggal ke waktu WIB
 */
function formatDateWIB(date, format) {
  var d = date ? new Date(date) : new Date();
  var fmt = format || "dd MMM yyyy, HH.mm 'WIB'";
  return Utilities.formatDate(d, TIMEZONE, fmt);
}

/**
 * Format waktu saat ini dalam format ISO string dengan offset WIB
 */
function getNowISOString() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Normalisasi teks: rapikan spasi dan ubah ke huruf kapital
 */
function toUpperCaseClean(str) {
  if (str === null || str === undefined) return '';
  return String(str).trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Mencegah CSV/Formula Injection pada Google Sheets
 * Menambahkan petik tunggal jika diawali =, +, -, @
 */
function sanitizeFormulaInjection(val) {
  if (val === null || val === undefined) return '';
  var s = String(val);
  if (/^[=+\-@]/.test(s)) {
    return "'" + s;
  }
  return s;
}

/**
 * Escape string untuk rendering HTML agar aman dari XSS
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Normalisasi dan validasi nomor WhatsApp
 * Menerima format 08..., +62..., 62..., spasi atau tanda hubung diabaikan
 * Output format standar: 08xxxxxxxxxx (10-14 digit)
 */
function normalizeWA(phone) {
  if (!phone) return { valid: false, number: '', message: 'Nomor WhatsApp belum diisi' };
  var cleaned = String(phone).replace(/[\s\-\(\)\.]/g, '');
  
  if (cleaned.startsWith('+62')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  if (!/^08\d{8,12}$/.test(cleaned)) {
    return {
      valid: false,
      number: cleaned,
      message: 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890'
    };
  }
  
  return { valid: true, number: cleaned, message: '' };
}

/**
 * Validasi isian formulir pendaftaran
 * Mengembalikan objek { valid: boolean, errors: array }
 */
function validateRegistrationData(data, isPublic) {
  var errors = [];
  
  // 1. Validasi Lembaga
  var jenis = toUpperCaseClean(data.jenis);
  if (jenis !== 'TKM' && jenis !== 'RA') {
    errors.push('Pilih jenis lembaga (TKM atau RA)');
  }
  
  var lembaga = toUpperCaseClean(data.lembaga);
  if (!lembaga) {
    errors.push('Nama lembaga wajib diisi');
  }
  
  var desa = String(data.desa || '').trim();
  if (!desa) {
    errors.push('Asal desa wajib dipilih');
  }
  
  // 2. Validasi Peserta
  var jumlah = parseInt(data.jumlah, 10);
  if (isNaN(jumlah) || jumlah < 1 || jumlah > 100) {
    errors.push('Jumlah peserta harus antara 1 dan 100');
  }
  
  var namaList = Array.isArray(data.nama_anak) ? data.nama_anak : [];
  if (namaList.length !== jumlah) {
    errors.push('Jumlah nama peserta (' + namaList.length + ') tidak sesuai dengan jumlah peserta yang dipilih (' + jumlah + ')');
  }
  
  var seenNames = {};
  for (var i = 0; i < namaList.length; i++) {
    var rawName = namaList[i];
    var noUrut = i + 1;
    var cleanName = toUpperCaseClean(rawName);
    
    if (!cleanName) {
      errors.push('Nama anak nomor ' + noUrut + ' belum diisi');
    } else {
      if (seenNames[cleanName]) {
        errors.push('Nama anak nomor ' + noUrut + ' sama dengan nomor ' + seenNames[cleanName]);
      } else {
        seenNames[cleanName] = noUrut;
      }
    }
  }
  
  // 3. Validasi Koordinator
  var koordinator = toUpperCaseClean(data.koordinator);
  if (!koordinator) {
    errors.push('Nama koordinator wajib diisi');
  }
  
  var waValidation = normalizeWA(data.wa);
  if (!waValidation.valid) {
    errors.push(waValidation.message);
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    cleanData: {
      jenis: jenis,
      lembaga: lembaga,
      desa: desa,
      jumlah: jumlah,
      nama_anak: namaList.map(function(n) { return toUpperCaseClean(n); }),
      koordinator: koordinator,
      wa: waValidation.number
    }
  };
}

/**
 * Eksekusi fungsi dengan LockService skrip untuk mencegah race condition
 */
function withScriptLock(timeoutSeconds, callback) {
  var lock = LockService.getScriptLock();
  var waitTime = (timeoutSeconds || 30) * 1000;
  var success = lock.tryLock(waitTime);
  
  if (!success) {
    throw new Error('Server sedang sibuk. Tunggu beberapa detik lalu coba lagi.');
  }
  
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

/**
 * Format nomor urut pendaftaran ke format kode MWR-xxx
 */
function formatCode(num) {
  var n = parseInt(num, 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 999) {
    throw new Error('Nomor kode telah mencapai batas maksimal (MWR-999). Silakan hubungi panitia.');
  }
  var str = '000' + n;
  return 'MWR-' + str.substr(str.length - 3);
}

/**
 * Parse kode MWR-xxx ke integer
 */
function parseCodeNumber(code) {
  if (!code) return 0;
  var match = String(code).match(/^MWR-(\d{3})$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Cek format kode pendaftaran
 */
function isValidCodeFormat(code) {
  return /^MWR-\d{3}$/.test(String(code).trim());
}

/**
 * Ambil Google Spreadsheet aktif
 */
function getAppSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Ambil sheet berdasarkan nama, buat baru jika belum ada
 */
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#005E39');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Ambil seluruh konfigurasi dari sheet Pengaturan sebagai objek key-value
 */
function getSettingsFromSheet(ss) {
  var sheet = ss.getSheetByName('Pengaturan');
  if (!sheet) return {};
  
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var val = data[i][1];
    if (key) {
      settings[key] = val;
    }
  }
  return settings;
}
