// ============================================================
//  LIFE DASHBOARD — script.js
// ============================================================


// ============================================================
//  BAGIAN 1 — GREETING (JAM, TANGGAL, SAPAAN)
//
//  Cara kerja:
//  - updateGreeting() dipanggil sekali saat halaman dimuat,
//    lalu dipanggil otomatis setiap 1 detik via setInterval.
//  - Setiap kali dipanggil, fungsi ini:
//    1. Ambil waktu sekarang dengan new Date()
//    2. Format jam → tampilkan di #clock
//    3. Format tanggal → tampilkan di #date-text
//    4. Cek jam → tentukan sapaan → tampilkan di #greeting-text
// ============================================================

// Nama hari dan bulan dalam Bahasa Indonesia
// (browser secara default pakai bahasa Inggris)
const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Tambahkan angka nol di depan jika angka < 10.
 * Contoh: 9 → "09", 12 → "12"
 */
function padDua(angka) {
  return String(angka).padStart(2, '0');
}

/**
 * Tentukan sapaan berdasarkan jam (0–23).
 * Pagi  : 05.00 – 11.59
 * Siang : 12.00 – 14.59
 * Sore  : 15.00 – 18.59
 * Malam : 19.00 – 04.59
 */
function getSapaan(jam) {
  if (jam >= 5 && jam < 12)  return 'Selamat Pagi! ☀️';
  if (jam >= 12 && jam < 15) return 'Selamat Siang! 🌤️';
  if (jam >= 15 && jam < 19) return 'Selamat Sore! 🌅';
  return 'Selamat Malam! 🌙';
}

/**
 * Fungsi utama: update semua elemen greeting sekaligus.
 * Dipanggil setiap detik.
 */
function updateGreeting() {
  const sekarang = new Date();

  const jam    = sekarang.getHours();
  const menit  = sekarang.getMinutes();
  const detik  = sekarang.getSeconds();
  const hari   = sekarang.getDay();    // 0 = Minggu, 6 = Sabtu
  const tgl    = sekarang.getDate();
  const bulan  = sekarang.getMonth(); // 0 = Januari
  const tahun  = sekarang.getFullYear();

  // Format jam: "08:05:03"
  const jamStr = `${padDua(jam)}:${padDua(menit)}:${padDua(detik)}`;

  // Format tanggal: "Kamis, 15 Oktober 2026"
  const tglStr = `${NAMA_HARI[hari]}, ${tgl} ${NAMA_BULAN[bulan]} ${tahun}`;

  // Ambil elemen HTML lalu isi nilainya
  document.getElementById('clock').textContent        = jamStr;
  document.getElementById('date-text').textContent    = tglStr;
  document.getElementById('greeting-text').textContent = getSapaan(jam);
}

// Jalankan sekali saat halaman pertama dibuka
// (supaya tidak ada jeda 1 detik sebelum jam muncul)
updateGreeting();

// Jalankan setiap 1000 ms (1 detik) secara terus-menerus
setInterval(updateGreeting, 1000);


// ============================================================
//  BAGIAN 2 – FOCUS TIMER, TO-DO, QUICK LINKS, DARK MODE
//  → Akan ditambahkan di tahap berikutnya
// ============================================================
