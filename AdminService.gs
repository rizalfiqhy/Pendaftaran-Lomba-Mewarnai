/**
 * AdminService.gs - Layanan Panel Admin Resmi
 * Penanganan hak akses, dasbor, CRUD pendaftaran, ekspor data, pengaturan sistem, dan riwayat
 */

/**
 * Validasi otentikasi admin di sisi server pada setiap fungsi admin
 */
function assertAdmin() {
  var activeEmail = Session.getActiveUser().getEmail();
  var props = PropertiesService.getScriptProperties();
  var configuredAdmin = props.getProperty('ADMIN_EMAIL');
  
  // Jika belum disetel di Script Properties, cek pengaturan atau fallback ke user yang sedang deploy
  if (!configuredAdmin) {
    var ss = getAppSpreadsheet();
    var settings = getSettingsFromSheet(ss);
    configuredAdmin = settings.admin_email || '';
  }
  
  if (configuredAdmin && activeEmail) {
    if (activeEmail.toLowerCase().trim() !== configuredAdmin.toLowerCase().trim()) {
      throw new Error('Akses ditolak: Akun (' + activeEmail + ') tidak terdaftar sebagai admin.');
    }
  }
  
  return activeEmail || configuredAdmin || 'admin@haflah.id';
}

/**
 * Catat aksi ke sheet Riwayat
 */
function logHistory(ss, adminUser, aksi, kode, sebelumObj, sesudahObj) {
  try {
    var sheet = getOrCreateSheet(ss, 'Riwayat', ['waktu', 'admin', 'aksi', 'kode', 'sebelum', 'sesudah']);
    sheet.appendRow([
      getNowISOString(),
      sanitizeFormulaInjection(adminUser),
      sanitizeFormulaInjection(aksi),
      sanitizeFormulaInjection(kode || '-'),
      sebelumObj ? JSON.stringify(sebelumObj) : '',
      sesudahObj ? JSON.stringify(sesudahObj) : ''
    ]);
  } catch (e) {
    Logger.log('Gagal mencatat riwayat: ' + e.message);
  }
}

/**
 * Data statistik untuk Dasbor Admin
 */
function getDashboardData() {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  var settings = getSettingsFromSheet(ss);
  
  var totalLembaga = 0;
  var totalAnak = 0;
  var totalTKM = 0;
  var totalRA = 0;
  var desaMap = {};
  
  // Ambil daftar desa dari konfigurasi
  var daftarDesaStr = settings.daftar_desa || "Ampel\nDukuh Dempok\nGlundengan\nKesilir\nLojejer\nTamansari\nTanjungrejo";
  var desaList = daftarDesaStr.split('\n').map(function(d) { return d.trim(); }).filter(Boolean);
  desaList.forEach(function(d) {
    desaMap[d] = { lembaga: 0, anak: 0 };
  });
  
  var recentList = [];
  
  if (regSheet && regSheet.getLastRow() > 1) {
    var regData = regSheet.getDataRange().getValues();
    var headers = regData[0];
    
    var idxKode = headers.indexOf('kode');
    var idxWaktu = headers.indexOf('waktu_daftar');
    var idxJenis = headers.indexOf('jenis');
    var idxLembaga = headers.indexOf('lembaga');
    var idxDesa = headers.indexOf('desa');
    var idxJumlah = headers.indexOf('jumlah');
    
    totalLembaga = regData.length - 1;
    
    for (var i = 1; i < regData.length; i++) {
      var row = regData[i];
      var jenis = String(row[idxJenis]).toUpperCase();
      var desa = String(row[idxDesa]).trim();
      var jumlah = parseInt(row[idxJumlah], 10) || 0;
      
      totalAnak += jumlah;
      if (jenis === 'TKM') totalTKM++;
      else if (jenis === 'RA') totalRA++;
      
      if (!desaMap[desa]) {
        desaMap[desa] = { lembaga: 0, anak: 0 };
      }
      desaMap[desa].lembaga++;
      desaMap[desa].anak += jumlah;
      
      // Ambil hingga 5 pendaftaran terbaru (ambil dari baris akhir)
      if (i > regData.length - 6) {
        recentList.unshift({
          kode: row[idxKode],
          waktu: formatDateWIB(row[idxWaktu]),
          jenis: row[idxJenis],
          lembaga: row[idxLembaga],
          desa: row[idxDesa],
          jumlah: jumlah
        });
      }
    }
  }
  
  // Hitung status pendaftaran
  var config = getPublicConfig();
  
  return {
    success: true,
    stats: {
      totalLembaga: totalLembaga,
      totalAnak: totalAnak,
      totalTKM: totalTKM,
      totalRA: totalRA,
      desaStats: desaMap,
      desaList: desaList,
      status: config.status,
      mode: config.mode,
      serverTime: config.server_time,
      tutupPada: config.tutup_pada,
      tutupPadaLabel: formatDateWIB(config.tutup_pada),
      recent: recentList
    }
  };
}

/**
 * Daftar pendaftaran admin dengan pencarian, filter, dan paginasi
 */
function listAdminRegistrations(query, filterJenis, filterDesa, page, pageSize) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  
  if (!regSheet || regSheet.getLastRow() <= 1) {
    return { success: true, list: [], totalCount: 0, totalChildren: 0, page: 1, totalPages: 1 };
  }
  
  var regRows = regSheet.getDataRange().getValues();
  var headers = regRows[0];
  var idxKode = headers.indexOf('kode');
  var idxWaktu = headers.indexOf('waktu_daftar');
  var idxJenis = headers.indexOf('jenis');
  var idxLembaga = headers.indexOf('lembaga');
  var idxDesa = headers.indexOf('desa');
  var idxJumlah = headers.indexOf('jumlah');
  var idxKoordinator = headers.indexOf('koordinator');
  var idxWa = headers.indexOf('wa');
  var idxAdmin = headers.indexOf('diinput_admin');
  var idxUbah = headers.indexOf('diubah_pada');
  var idxRequestId = headers.indexOf('request_id');
  
  // Baca juga peserta untuk pencarian nama anak jika query diisi
  var q = query ? toUpperCaseClean(query) : '';
  var childSearchMatches = {};
  if (q && pesSheet && pesSheet.getLastRow() > 1) {
    var pesData = pesSheet.getDataRange().getValues();
    for (var p = 1; p < pesData.length; p++) {
      var cKode = String(pesData[p][0]);
      var cNama = toUpperCaseClean(pesData[p][2]);
      if (cNama.indexOf(q) !== -1) {
        childSearchMatches[cKode] = true;
      }
    }
  }
  
  var filtered = [];
  var totalChildrenCount = 0;
  
  for (var i = 1; i < regRows.length; i++) {
    var r = regRows[i];
    var kode = String(r[idxKode]);
    var jenis = String(r[idxJenis]);
    var lembaga = String(r[idxLembaga]);
    var desa = String(r[idxDesa]);
    var koordinator = String(r[idxKoordinator]);
    var wa = String(r[idxWa]);
    var jumlah = parseInt(r[idxJumlah], 10) || 0;
    
    // Filter Jenis
    if (filterJenis && filterJenis !== 'SEMUA' && jenis !== filterJenis) {
      continue;
    }
    // Filter Desa
    if (filterDesa && filterDesa !== 'SEMUA' && desa !== filterDesa) {
      continue;
    }
    // Filter Query
    if (q) {
      var match = (
        kode.toUpperCase().indexOf(q) !== -1 ||
        lembaga.toUpperCase().indexOf(q) !== -1 ||
        koordinator.toUpperCase().indexOf(q) !== -1 ||
        wa.indexOf(q) !== -1 ||
        childSearchMatches[kode]
      );
      if (!match) continue;
    }
    
    totalChildrenCount += jumlah;
    filtered.push({
      kode: kode,
      waktu_daftar: formatDateWIB(r[idxWaktu]),
      raw_waktu: r[idxWaktu],
      jenis: jenis,
      lembaga: lembaga,
      desa: desa,
      jumlah: jumlah,
      koordinator: koordinator,
      wa: wa,
      diinput_admin: r[idxAdmin] === 'YA',
      diubah_pada: r[idxUbah] ? formatDateWIB(r[idxUbah]) : '',
      request_id: r[idxRequestId] || ''
    });
  }
  
  // Urutkan default: terbaru paling atas
  filtered.sort(function(a, b) {
    return new Date(b.raw_waktu) - new Date(a.raw_waktu);
  });
  
  var p = parseInt(page, 10) || 1;
  var ps = parseInt(pageSize, 10) || 20;
  var totalCount = filtered.length;
  var totalPages = Math.ceil(totalCount / ps) || 1;
  if (p > totalPages) p = totalPages;
  var startIdx = (p - 1) * ps;
  var paginatedList = filtered.slice(startIdx, startIdx + ps);
  
  return {
    success: true,
    list: paginatedList,
    totalCount: totalCount,
    totalChildren: totalChildrenCount,
    page: p,
    totalPages: totalPages
  };
}

/**
 * Ambil detail lengkap pendaftaran beserta seluruh nama anak untuk diedit
 */
function getAdminRegistrationDetail(kode) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  
  if (!regSheet || !kode) throw new Error('Data tidak ditemukan');
  
  var regRows = regSheet.getDataRange().getValues();
  var headers = regRows[0];
  var idxKode = headers.indexOf('kode');
  var targetRow = null;
  
  for (var i = 1; i < regRows.length; i++) {
    if (String(regRows[i][idxKode]).trim() === String(kode).trim()) {
      targetRow = regRows[i];
      break;
    }
  }
  
  if (!targetRow) throw new Error('Pendaftaran dengan kode ' + kode + ' tidak ditemukan');
  
  // Ambil nama anak dari sheet Peserta
  var namaAnak = [];
  if (pesSheet && pesSheet.getLastRow() > 1) {
    var pesRows = pesSheet.getDataRange().getValues();
    for (var j = 1; j < pesRows.length; j++) {
      if (String(pesRows[j][0]).trim() === String(kode).trim()) {
        namaAnak.push(String(pesRows[j][2]));
      }
    }
  }
  
  var idxWaktu = headers.indexOf('waktu_daftar');
  var idxJenis = headers.indexOf('jenis');
  var idxLembaga = headers.indexOf('lembaga');
  var idxDesa = headers.indexOf('desa');
  var idxJumlah = headers.indexOf('jumlah');
  var idxKoordinator = headers.indexOf('koordinator');
  var idxWa = headers.indexOf('wa');
  var idxAdmin = headers.indexOf('diinput_admin');
  var idxUbah = headers.indexOf('diubah_pada');
  var idxRequestId = headers.indexOf('request_id');
  
  return {
    success: true,
    data: {
      kode: targetRow[idxKode],
      waktu_daftar: formatDateWIB(targetRow[idxWaktu]),
      jenis: targetRow[idxJenis],
      lembaga: targetRow[idxLembaga],
      desa: targetRow[idxDesa],
      jumlah: namaAnak.length || targetRow[idxJumlah],
      koordinator: targetRow[idxKoordinator],
      wa: targetRow[idxWa],
      diinput_admin: targetRow[idxAdmin] === 'YA',
      diubah_pada: targetRow[idxUbah] ? formatDateWIB(targetRow[idxUbah]) : '',
      request_id: targetRow[idxRequestId],
      nama_anak: namaAnak
    }
  };
}

/**
 * Simpan perubahan pendaftaran oleh admin (edit apa pun)
 * Mendukung forceSave: jika ada peringatan validasi, admin tetap dapat memilih "Tetap Simpan"
 */
function saveAdminRegistration(payload, forceSave) {
  var adminUser = assertAdmin();
  var validation = validateRegistrationData(payload, false);
  
  // Jika validasi gagal dan admin tidak memilih forceSave, kembalikan peringatan
  if (!validation.valid && !forceSave) {
    return {
      success: false,
      warning: true,
      messages: validation.errors
    };
  }
  
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var regSheet = ss.getSheetByName('Pendaftaran');
    var pesSheet = ss.getSheetByName('Peserta');
    
    var oldKode = String(payload.oldKode || payload.kode).trim();
    var newKode = String(payload.kode).trim().toUpperCase();
    
    if (!isValidCodeFormat(newKode)) {
      throw new Error('Format kode tidak valid. Harus berformat MWR-nomor 3 angka (contoh: MWR-001)');
    }
    
    var regRows = regSheet.getDataRange().getValues();
    var headers = regRows[0];
    var idxKode = headers.indexOf('kode');
    var targetRowIndex = -1;
    
    // Cek keberadaan data dan cek jika newKode bentrok dengan kode lembaga lain
    for (var i = 1; i < regRows.length; i++) {
      var rowKode = String(regRows[i][idxKode]).trim();
      if (rowKode === oldKode) {
        targetRowIndex = i + 1; // 1-indexed untuk getRange
      } else if (rowKode === newKode) {
        throw new Error('Kode ' + newKode + ' sudah dipakai oleh lembaga lain. Kode harus unik.');
      }
    }
    
    if (targetRowIndex === -1) {
      throw new Error('Data pendaftaran ' + oldKode + ' tidak ditemukan');
    }
    
    // Ambil data sebelum untuk riwayat
    var detailSebelum = getAdminRegistrationDetail(oldKode).data;
    
    // Normalisasi isian
    var jenis = toUpperCaseClean(payload.jenis);
    var lembaga = toUpperCaseClean(payload.lembaga);
    var desa = String(payload.desa).trim();
    var namaList = Array.isArray(payload.nama_anak) ? payload.nama_anak.map(function(n) { return toUpperCaseClean(n); }) : [];
    var jumlah = namaList.length;
    var koordinator = toUpperCaseClean(payload.koordinator);
    var waClean = normalizeWA(payload.wa).number || String(payload.wa).trim();
    var nowWIB = getNowISOString();
    
    // Perbarui baris di sheet Pendaftaran
    var idxWaktu = headers.indexOf('waktu_daftar');
    var idxJenis = headers.indexOf('jenis');
    var idxLembaga = headers.indexOf('lembaga');
    var idxDesa = headers.indexOf('desa');
    var idxJumlah = headers.indexOf('jumlah');
    var idxKoordinator = headers.indexOf('koordinator');
    var idxWa = headers.indexOf('wa');
    var idxUbah = headers.indexOf('diubah_pada');
    
    regSheet.getRange(targetRowIndex, idxKode + 1).setValue(sanitizeFormulaInjection(newKode));
    regSheet.getRange(targetRowIndex, idxJenis + 1).setValue(sanitizeFormulaInjection(jenis));
    regSheet.getRange(targetRowIndex, idxLembaga + 1).setValue(sanitizeFormulaInjection(lembaga));
    regSheet.getRange(targetRowIndex, idxDesa + 1).setValue(sanitizeFormulaInjection(desa));
    regSheet.getRange(targetRowIndex, idxJumlah + 1).setValue(jumlah);
    regSheet.getRange(targetRowIndex, idxKoordinator + 1).setValue(sanitizeFormulaInjection(koordinator));
    regSheet.getRange(targetRowIndex, idxWa + 1).setValue(sanitizeFormulaInjection(waClean));
    regSheet.getRange(targetRowIndex, idxUbah + 1).setValue(nowWIB);
    
    // Hapus baris nama anak lama di sheet Peserta
    if (pesSheet && pesSheet.getLastRow() > 1) {
      var pesData = pesSheet.getDataRange().getValues();
      for (var p = pesData.length - 1; p >= 1; p--) {
        if (String(pesData[p][0]).trim() === oldKode) {
          pesSheet.deleteRow(p + 1);
        }
      }
    }
    
    // Tambah nama anak baru
    if (namaList.length > 0) {
      var newPesertaRows = [];
      for (var k = 0; k < namaList.length; k++) {
        newPesertaRows.push([
          sanitizeFormulaInjection(newKode),
          k + 1,
          sanitizeFormulaInjection(namaList[k])
        ]);
      }
      var startRow = pesSheet.getLastRow() + 1;
      pesSheet.getRange(startRow, 1, newPesertaRows.length, 3).setValues(newPesertaRows);
    }
    
    // Data sesudah
    var detailSesudah = {
      kode: newKode,
      jenis: jenis,
      lembaga: lembaga,
      desa: desa,
      jumlah: jumlah,
      nama_anak: namaList,
      koordinator: koordinator,
      wa: waClean,
      diubah_pada: nowWIB
    };
    
    // Catat ke Riwayat
    logHistory(ss, adminUser, 'UBAH', newKode, detailSebelum, detailSesudah);
    
    // Bersihkan cache publik
    CacheService.getScriptCache().remove('public_participants');
    
    return {
      success: true,
      kode: newKode,
      message: 'Perubahan data pendaftaran ' + newKode + ' berhasil disimpan.'
    };
  });
}

/**
 * Tambah pendaftaran manual oleh admin
 */
function createAdminRegistration(payload) {
  var adminUser = assertAdmin();
  
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var regSheet = ss.getSheetByName('Pendaftaran');
    var pesSheet = ss.getSheetByName('Peserta');
    var props = PropertiesService.getScriptProperties();
    
    var customKode = payload.kode ? String(payload.kode).trim().toUpperCase() : '';
    var kode = '';
    
    if (customKode) {
      if (!isValidCodeFormat(customKode)) {
        throw new Error('Format kode harus MWR-nomor 3 angka (contoh: MWR-001)');
      }
      // Cek keunikan
      var regData = regSheet.getDataRange().getValues();
      for (var i = 1; i < regData.length; i++) {
        if (String(regData[i][0]).trim() === customKode) {
          throw new Error('Kode ' + customKode + ' sudah terdaftar. Gunakan kode lain.');
        }
      }
      kode = customKode;
      // Perbarui counter jika kode kustom lebih tinggi
      var num = parseCodeNumber(kode);
      var currentCounter = parseInt(props.getProperty('COUNTER') || '0', 10);
      if (num > currentCounter) {
        props.setProperty('COUNTER', String(num));
      }
    } else {
      var counter = parseInt(props.getProperty('COUNTER') || '0', 10);
      counter++;
      kode = formatCode(counter);
      props.setProperty('COUNTER', String(counter));
    }
    
    var jenis = toUpperCaseClean(payload.jenis || 'TKM');
    var lembaga = toUpperCaseClean(payload.lembaga || 'LEMBAGA TANPA NAMA');
    var desa = String(payload.desa || '').trim();
    var namaList = Array.isArray(payload.nama_anak) ? payload.nama_anak.map(function(n) { return toUpperCaseClean(n); }) : [];
    var jumlah = namaList.length;
    var koordinator = toUpperCaseClean(payload.koordinator || 'PANITIA');
    var waClean = normalizeWA(payload.wa).number || String(payload.wa || '081234567890');
    var nowWIB = getNowISOString();
    var reqId = 'ADMIN-' + Utilities.getUuid();
    
    // Tulis ke sheet Pendaftaran
    regSheet.appendRow([
      sanitizeFormulaInjection(kode),
      nowWIB,
      sanitizeFormulaInjection(jenis),
      sanitizeFormulaInjection(lembaga),
      sanitizeFormulaInjection(desa),
      jumlah,
      sanitizeFormulaInjection(koordinator),
      sanitizeFormulaInjection(waClean),
      'YA',
      nowWIB,
      reqId
    ]);
    
    // Tulis ke sheet Peserta
    if (namaList.length > 0) {
      var pesRows = [];
      for (var k = 0; k < namaList.length; k++) {
        pesRows.push([
          sanitizeFormulaInjection(kode),
          k + 1,
          sanitizeFormulaInjection(namaList[k])
        ]);
      }
      var startRow = pesSheet.getLastRow() + 1;
      pesSheet.getRange(startRow, 1, pesRows.length, 3).setValues(pesRows);
    }
    
    var dataBaru = {
      kode: kode,
      jenis: jenis,
      lembaga: lembaga,
      desa: desa,
      jumlah: jumlah,
      nama_anak: namaList,
      koordinator: koordinator,
      wa: waClean,
      diinput_admin: true
    };
    
    logHistory(ss, adminUser, 'TAMBAH', kode, null, dataBaru);
    CacheService.getScriptCache().remove('public_participants');
    
    return {
      success: true,
      kode: kode,
      message: 'Pendaftaran manual berhasil ditambahkan dengan kode ' + kode
    };
  });
}

/**
 * Hapus pendaftaran oleh admin dengan menyimpan arsip lengkap ke Riwayat
 */
function deleteAdminRegistration(kode) {
  var adminUser = assertAdmin();
  if (!kode) throw new Error('Kode pendaftaran wajib disertakan');
  
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var regSheet = ss.getSheetByName('Pendaftaran');
    var pesSheet = ss.getSheetByName('Peserta');
    
    var detail = getAdminRegistrationDetail(kode).data;
    
    // Hapus dari Pendaftaran
    var regRows = regSheet.getDataRange().getValues();
    var idxKode = regRows[0].indexOf('kode');
    for (var i = regRows.length - 1; i >= 1; i--) {
      if (String(regRows[i][idxKode]).trim() === String(kode).trim()) {
        regSheet.deleteRow(i + 1);
        break;
      }
    }
    
    // Hapus dari Peserta
    if (pesSheet && pesSheet.getLastRow() > 1) {
      var pesRows = pesSheet.getDataRange().getValues();
      for (var j = pesRows.length - 1; j >= 1; j--) {
        if (String(pesRows[j][0]).trim() === String(kode).trim()) {
          pesSheet.deleteRow(j + 1);
        }
      }
    }
    
    // Simpan ke Riwayat (Aturan B2: Kode tidak dipakai ulang, arsip tersimpan untuk recovery)
    logHistory(ss, adminUser, 'HAPUS', kode, detail, null);
    CacheService.getScriptCache().remove('public_participants');
    
    return {
      success: true,
      kode: kode,
      message: kode + ' dihapus. Nomor ini tidak dipakai lagi.'
    };
  });
}

/**
 * Ambil seluruh pengaturan sistem untuk Panel Admin
 */
function getAdminSettings() {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var settings = getSettingsFromSheet(ss);
  var props = PropertiesService.getScriptProperties();
  
  return {
    success: true,
    settings: {
      mode: settings.mode || 'otomatis',
      tutup_pada: normalizeDateToISO(settings.tutup_pada || '2027-01-16T23:59:59+07:00'),
      judul: settings.judul || 'Lomba Mewarnai Kreatif TKM & RA Se-Kecamatan Wuluhan',
      tanggal_pelaksanaan: settings.tanggal_pelaksanaan || 'Sabtu, 23 Januari 2027',
      jam: settings.jam || '07.00 WIB sampai selesai',
      lokasi: settings.lokasi || 'PPTQ BUQ YASINAT, Kesilir, Wuluhan, Jember',
      kontak_tkm_nama: settings.kontak_tkm_nama || 'Ibu Dita',
      kontak_tkm_wa: settings.kontak_tkm_wa || '0852-5971-9093',
      kontak_ra_nama: settings.kontak_ra_nama || 'Ibu Fitriyah',
      kontak_ra_wa: settings.kontak_ra_wa || '0822-3255-1107',
      ketentuan_teknis: settings.ketentuan_teknis || 'Ketentuan akan diumumkan oleh panitia',
      daftar_desa: settings.daftar_desa || "Ampel\nDukuh Dempok\nGlundengan\nKesilir\nLojejer\nTamansari\nTanjungrejo",
      tampilkan_peserta: (settings.tampilkan_peserta || 'YA') === 'YA',
      kop_baris1: settings.kop_baris1 || 'PANITIA HAFLAH AL MILAD & AKHIR AS SANAH 1448 H',
      kop_baris2: settings.kop_baris2 || 'YAYASAN ISLAM NAHDLATUTH THALABAH',
      kop_baris3: settings.kop_baris3 || 'Sekretariat : PP. Nahdlatuth Thalabah Kesilir - Wuluhan - Jember',
      kop_baris4: settings.kop_baris4 || 'WhatsApp : +62 812-1768-7686 Email : panitiahafahyasinat@gmail.com',
      admin_email: props.getProperty('ADMIN_EMAIL') || settings.admin_email || ''
    }
  };
}

/**
 * Simpan pengaturan sistem
 */
function saveAdminSettings(payload) {
  var adminUser = assertAdmin();
  
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var setSheet = getOrCreateSheet(ss, 'Pengaturan', ['kunci', 'nilai']);
    var props = PropertiesService.getScriptProperties();
    
    var sebelum = getSettingsFromSheet(ss);
    
    var keysToSave = [
      'mode', 'tutup_pada', 'judul', 'tanggal_pelaksanaan', 'jam', 'lokasi',
      'kontak_tkm_nama', 'kontak_tkm_wa', 'kontak_ra_nama', 'kontak_ra_wa',
      'ketentuan_teknis', 'daftar_desa', 'tampilkan_peserta',
      'kop_baris1', 'kop_baris2', 'kop_baris3', 'kop_baris4'
    ];
    
    // Konversi tampilkan_peserta boolean ke YA/TIDAK
    if (typeof payload.tampilkan_peserta === 'boolean') {
      payload.tampilkan_peserta = payload.tampilkan_peserta ? 'YA' : 'TIDAK';
    }
    
    var existingData = setSheet.getDataRange().getValues();
    var keyRowMap = {};
    for (var i = 1; i < existingData.length; i++) {
      keyRowMap[String(existingData[i][0]).trim()] = i + 1;
    }
    
    for (var k = 0; k < keysToSave.length; k++) {
      var key = keysToSave[k];
      if (payload[key] !== undefined) {
        var val = sanitizeFormulaInjection(payload[key]);
        if (key === 'tutup_pada') {
          val = normalizeDateToISO(val);
        }
        if (keyRowMap[key]) {
          var cell = setSheet.getRange(keyRowMap[key], 2);
          cell.setNumberFormat('@');
          cell.setValue(val);
        } else {
          setSheet.appendRow([key, val]);
        }
      }
    }
    
    if (payload.admin_email) {
      props.setProperty('ADMIN_EMAIL', String(payload.admin_email).trim());
    }
    
    var sesudah = getSettingsFromSheet(ss);
    logHistory(ss, adminUser, 'PENGATURAN', 'SISTEM', sebelum, sesudah);
    
    // Hapus seluruh cache
    var cache = CacheService.getScriptCache();
    cache.remove('public_config');
    cache.remove('public_participants');
    
    return {
      success: true,
      message: 'Pengaturan sistem berhasil disimpan.'
    };
  });
}

/**
 * Data ekspor untuk absensi dan rekapitulasi Excel/CSV
 */
function getAdminExportData(scope, filterDesa, filterLembaga) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  
  if (!regSheet || regSheet.getLastRow() <= 1) {
    return { success: true, rows: [] };
  }
  
  var regRows = regSheet.getDataRange().getValues();
  var headers = regRows[0];
  var idxKode = headers.indexOf('kode');
  var idxJenis = headers.indexOf('jenis');
  var idxLembaga = headers.indexOf('lembaga');
  var idxDesa = headers.indexOf('desa');
  var idxKoordinator = headers.indexOf('koordinator');
  var idxWa = headers.indexOf('wa');
  var idxWaktu = headers.indexOf('waktu_daftar');
  
  // Mapping lembaga
  var regMap = {};
  for (var i = 1; i < regRows.length; i++) {
    var k = String(regRows[i][idxKode]);
    var d = String(regRows[i][idxDesa]);
    var l = String(regRows[i][idxLembaga]);
    
    if (filterDesa && filterDesa !== 'SEMUA' && d !== filterDesa) continue;
    if (filterLembaga && filterLembaga !== 'SEMUA' && l !== filterLembaga) continue;
    
    regMap[k] = {
      kode: k,
      jenis: regRows[i][idxJenis],
      lembaga: l,
      desa: d,
      koordinator: regRows[i][idxKoordinator],
      wa: regRows[i][idxWa],
      waktu_daftar: formatDateWIB(regRows[i][idxWaktu])
    };
  }
  
  var exportRows = [];
  if (pesSheet && pesSheet.getLastRow() > 1) {
    var pesRows = pesSheet.getDataRange().getValues();
    for (var j = 1; j < pesRows.length; j++) {
      var pKode = String(pesRows[j][0]);
      if (regMap[pKode]) {
        var info = regMap[pKode];
        exportRows.push({
          kode: info.kode,
          lembaga: info.lembaga,
          jenis: info.jenis,
          desa: info.desa,
          no_anak: pesRows[j][1],
          nama_anak: pesRows[j][2],
          koordinator: info.koordinator,
          wa: info.wa,
          waktu_daftar: info.waktu_daftar,
          hadir: '' // Kolom absensi
        });
      }
    }
  }
  
  // Urutkan berdasarkan Lembaga A-Z lalu No Anak
  exportRows.sort(function(a, b) {
    if (a.lembaga < b.lembaga) return -1;
    if (a.lembaga > b.lembaga) return 1;
    return a.no_anak - b.no_anak;
  });
  
  return {
    success: true,
    totalRows: exportRows.length,
    rows: exportRows
  };
}

/**
 * Daftar riwayat perubahan sistem (Audit Log)
 */
function listAdminHistory(page, pageSize) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var sheet = ss.getSheetByName('Riwayat');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, list: [], totalCount: 0, page: 1, totalPages: 1 };
  }
  
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = data.length - 1; i >= 1; i--) {
    list.push({
      waktu: formatDateWIB(data[i][0]),
      admin: data[i][1],
      aksi: data[i][2],
      kode: data[i][3],
      sebelum: data[i][4] ? JSON.parse(data[i][4]) : null,
      sesudah: data[i][5] ? JSON.parse(data[i][5]) : null
    });
  }
  
  var p = parseInt(page, 10) || 1;
  var ps = parseInt(pageSize, 10) || 20;
  var totalCount = list.length;
  var totalPages = Math.ceil(totalCount / ps) || 1;
  var startIdx = (p - 1) * ps;
  
  return {
    success: true,
    list: list.slice(startIdx, startIdx + ps),
    totalCount: totalCount,
    page: p,
    totalPages: totalPages
  };
}

/**
 * Reset seluruh data pendaftaran ujicoba dan kembalikan penomoran kode ke 0 (MWR-001)
 * Hanya dapat dijalankan oleh Admin terautentikasi
 */
function resetAllRegistrationsData() {
  var adminUser = assertAdmin();
  
  return withScriptLock(30, function() {
    var ss = getAppSpreadsheet();
    var regSheet = ss.getSheetByName('Pendaftaran');
    var pesSheet = ss.getSheetByName('Peserta');
    var props = PropertiesService.getScriptProperties();
    
    var deletedRegCount = 0;
    var deletedPesCount = 0;
    
    // 1. Bersihkan sheet Pendaftaran (baris 2 ke bawah, header tetap aman)
    if (regSheet && regSheet.getLastRow() > 1) {
      deletedRegCount = regSheet.getLastRow() - 1;
      regSheet.deleteRows(2, deletedRegCount);
    }
    
    // 2. Bersihkan sheet Peserta (baris 2 ke bawah, header tetap aman)
    if (pesSheet && pesSheet.getLastRow() > 1) {
      deletedPesCount = pesSheet.getLastRow() - 1;
      pesSheet.deleteRows(2, deletedPesCount);
    }
    
    // 3. Reset counter penomoran kode pendaftaran kembali ke 0
    props.setProperty('COUNTER', '0');
    
    // 4. Bersihkan Cache Script
    var cache = CacheService.getScriptCache();
    cache.remove('public_participants');
    cache.remove('public_config');
    
    // 5. Catat audit log di sheet Riwayat
    logHistory(ss, adminUser, 'RESET_DATA', 'ALL', {
      keterangan: 'Reset seluruh data pendaftaran ujicoba. Penomoran kode direset kembali ke 0.',
      pendaftaran_dihapus: deletedRegCount,
      peserta_dihapus: deletedPesCount
    }, { counter_sekarang: 0 });
    
    return {
      success: true,
      message: 'Berhasil me-reset data! Seluruh pendaftaran (' + deletedRegCount + ' lembaga) telah dibersihkan dan nomor urut kode pendaftaran kembali ke 0. Pendaftaran berikutnya akan dimulai dari MWR-001.'
    };
  });
}

/**
 * Ambil data terstruktur untuk Daftar Hadir (Presensi)
 */
function getAdminAttendanceData(filterDesa) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var regSheet = ss.getSheetByName('Pendaftaran');
  var pesSheet = ss.getSheetByName('Peserta');
  
  var fDesa = (filterDesa && filterDesa !== 'all') ? String(filterDesa).trim() : 'SEMUA';
  
  if (!regSheet || regSheet.getLastRow() <= 1) {
    return { success: true, list: [], totalSantri: 0, filterDesa: fDesa };
  }
  
  var regRows = regSheet.getDataRange().getValues();
  var headers = regRows[0];
  var idxKode = headers.indexOf('kode');
  var idxJenis = headers.indexOf('jenis');
  var idxLembaga = headers.indexOf('lembaga');
  var idxDesa = headers.indexOf('desa');
  var idxKoordinator = headers.indexOf('koordinator');
  var idxWa = headers.indexOf('wa');
  var idxJumlah = headers.indexOf('jumlah');
  
  // Mapping anak dari sheet Peserta
  var childMap = {};
  if (pesSheet && pesSheet.getLastRow() > 1) {
    var pesRows = pesSheet.getDataRange().getValues();
    for (var j = 1; j < pesRows.length; j++) {
      var pKode = String(pesRows[j][0]).trim();
      var noAnak = pesRows[j][1];
      var namaAnak = String(pesRows[j][2]).trim();
      if (!childMap[pKode]) childMap[pKode] = [];
      childMap[pKode].push({
        no: noAnak,
        nama: namaAnak
      });
    }
  }
  
  var list = [];
  var totalSantri = 0;
  
  for (var i = 1; i < regRows.length; i++) {
    var k = String(regRows[i][idxKode]).trim();
    if (!k) continue;
    var d = String(regRows[i][idxDesa]).trim();
    if (fDesa !== 'SEMUA' && d !== fDesa) {
      continue;
    }
    
    var kids = childMap[k] || [];
    var jml = kids.length || parseInt(regRows[i][idxJumlah], 10) || 0;
    totalSantri += jml;
    
    list.push({
      kode: k,
      jenis: String(regRows[i][idxJenis] || '').trim(),
      lembaga: String(regRows[i][idxLembaga] || '').trim(),
      desa: d,
      koordinator: String(regRows[i][idxKoordinator] || '').trim(),
      wa: String(regRows[i][idxWa] || '').trim(),
      jumlah: jml,
      peserta: kids
    });
  }
  
  // Urutkan berdasarkan kode pendaftaran (MWR-001, MWR-002, ...)
  list.sort(function(a, b) {
    return a.kode.localeCompare(b.kode, undefined, { numeric: true });
  });
  
  return {
    success: true,
    list: list,
    totalSantri: totalSantri,
    filterDesa: fDesa
  };
}

/**
 * Generate PDF Daftar Hadir (Opsi A atau Opsi B) dan kembalikan Base64
 */
function getAttendancePdf(type, filterDesa) {
  assertAdmin();
  var ss = getAppSpreadsheet();
  var settings = getSettingsFromSheet(ss);
  var fDesa = (filterDesa && filterDesa !== 'all') ? String(filterDesa).trim() : 'SEMUA';
  var dataRes = getAdminAttendanceData(fDesa);
  
  if (!dataRes.list || dataRes.list.length === 0) {
    throw new Error('Tidak ada data pendaftaran yang ditemukan' + (fDesa !== 'SEMUA' ? ' untuk wilayah Desa ' + fDesa : '') + '.');
  }
  
  var nowStr = Utilities.formatDate(new Date(), TIMEZONE, "yyyyMMdd_HHmm");
  var filename = '';
  var base64Pdf = '';
  
  if (type === 'A') {
    filename = 'Daftar_Hadir_Koordinator_' + (fDesa !== 'SEMUA' ? fDesa.replace(/\s+/g, '_') + '_' : '') + nowStr + '.pdf';
    base64Pdf = generateAttendancePdfABase64(settings, dataRes.list, fDesa, filename);
  } else {
    filename = 'Daftar_Hadir_Peserta_' + (fDesa !== 'SEMUA' ? fDesa.replace(/\s+/g, '_') + '_' : '') + nowStr + '.pdf';
    base64Pdf = generateAttendancePdfBBase64(settings, dataRes.list, fDesa, filename);
  }
  
  return {
    success: true,
    type: type,
    filename: filename,
    base64: base64Pdf,
    totalLembaga: dataRes.list.length,
    totalSantri: dataRes.totalSantri
  };
}
