/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Musyawarah Kerja Kepala Sekolah (MKKS) SD Kecamatan Pasirwangi
 * File: Kode.gs (Google Apps Script Routing & Controller)
 */

function doGet(e) {
  var page = e.parameter.page || 'home';
  
  if (page === 'admin') {
    return HtmlService.createTemplateFromFile('AdminDashboard')
        .evaluate()
        .setTitle('Admin Dashboard | MKKS SD Pasirwangi')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else if (page === 'user') {
    return HtmlService.createTemplateFromFile('UserDashboard')
        .evaluate()
        .setTitle('Dashboard Anggota | MKKS SD Pasirwangi')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else if (page === 'login') {
    return HtmlService.createTemplateFromFile('Login')
        .evaluate()
        .setTitle('Sistem Masuk Portal | MKKS SD Pasirwangi')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    // Default Home Landing Page
    return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('Portal Resmi MKKS SD Kecamatan Pasirwangi')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Berfungsi untuk mengimpor (menyisipkan) file CSS/JS eksternal dalam GAS
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
