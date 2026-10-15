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
//  BAGIAN 2 — FOCUS TIMER (POMODORO)
//
//  Cara kerja:
//  - Durasi default = 25 menit = 1500 detik, disimpan di `sisaDetik`.
//  - Start  → jalankan setInterval setiap 1 detik, kurangi sisaDetik.
//  - Stop   → hentikan interval (timer pause, nilai tidak reset).
//  - Reset  → hentikan interval + kembalikan sisaDetik ke 1500.
//
//  Anti-ganda:
//  - Variabel `timerInterval` menyimpan ID dari setInterval.
//  - Sebelum Start membuat interval baru, cek dulu apakah
//    timerInterval sudah ada (tidak null). Jika sudah ada,
//    Start tidak melakukan apa-apa → timer tidak lari dua kali.
// ============================================================

const DURASI_DEFAULT = 25 * 60; // 1500 detik

let sisaDetik    = DURASI_DEFAULT; // Detik yang tersisa saat ini
let timerInterval = null;          // null = timer sedang tidak berjalan

// Ambil elemen HTML yang dibutuhkan
const elTimer    = document.getElementById('timer-display');
const elBtnStart = document.getElementById('btn-start');
const elBtnStop  = document.getElementById('btn-stop');
const elBtnReset = document.getElementById('btn-reset');

/**
 * Ubah jumlah detik menjadi format "MM:SS".
 * Contoh: 1500 → "25:00", 90 → "01:30"
 */
function formatWaktu(totalDetik) {
  const m = Math.floor(totalDetik / 60);
  const s = totalDetik % 60;
  return `${padDua(m)}:${padDua(s)}`;
}

/**
 * Render tampilan timer ke layar.
 * Juga ubah warna jadi merah saat sisa waktu ≤ 1 menit.
 */
function renderTimer() {
  elTimer.textContent = formatWaktu(sisaDetik);

  if (sisaDetik <= 60 && sisaDetik > 0) {
    // Warna merah saat hampir habis
    elTimer.style.color = 'var(--accent-danger)';
  } else {
    // Kembalikan ke warna normal
    elTimer.style.color = 'var(--timer-color)';
  }
}

/**
 * Fungsi yang dijalankan setiap detik saat timer aktif.
 * Kurangi sisaDetik, render, dan cek apakah sudah habis.
 */
function timerTick() {
  sisaDetik--;
  renderTimer();

  if (sisaDetik <= 0) {
    // Timer habis → hentikan dan beri tahu pengguna
    clearInterval(timerInterval);
    timerInterval = null;
    sisaDetik = 0;
    renderTimer();
    updateTombolTimer();
    // Notifikasi sederhana via alert (bisa diganti notifikasi browser nanti)
    setTimeout(() => alert('🍅 Waktu fokus selesai! Saatnya istirahat.'), 100);
  }
}

/**
 * Atur tampilan tombol sesuai kondisi timer.
 * - Saat berjalan : Start dinonaktifkan, Stop aktif
 * - Saat berhenti : Start aktif, Stop dinonaktifkan
 */
function updateTombolTimer() {
  const sedangBerjalan = timerInterval !== null;
  elBtnStart.disabled = sedangBerjalan;
  elBtnStop.disabled  = !sedangBerjalan;

  elBtnStart.style.opacity = sedangBerjalan ? '0.5' : '1';
  elBtnStop.style.opacity  = !sedangBerjalan ? '0.5' : '1';
}

// --- Event listener tombol ---

// TOMBOL START
elBtnStart.addEventListener('click', function () {
  // Jika timerInterval sudah ada (tidak null), berarti timer
  // sedang berjalan → abaikan klik supaya tidak ganda
  if (timerInterval !== null) return;
  // Jika waktu sudah habis, jangan mulai lagi tanpa reset
  if (sisaDetik <= 0) return;

  timerInterval = setInterval(timerTick, 1000);
  updateTombolTimer();
});

// TOMBOL STOP (pause)
elBtnStop.addEventListener('click', function () {
  if (timerInterval === null) return; // Sudah berhenti, tidak perlu apa-apa

  clearInterval(timerInterval); // Hentikan interval
  timerInterval = null;          // Tandai bahwa timer tidak berjalan
  updateTombolTimer();
});

// TOMBOL RESET
elBtnReset.addEventListener('click', function () {
  clearInterval(timerInterval); // Hentikan apapun yang sedang berjalan
  timerInterval = null;
  sisaDetik = DURASI_DEFAULT;   // Kembalikan ke 25 menit
  renderTimer();
  updateTombolTimer();
});

// Inisialisasi: tampilkan "25:00" dan atur tombol saat halaman dibuka
renderTimer();
updateTombolTimer();


// ============================================================
//  BAGIAN 3 – TO-DO LIST, QUICK LINKS, DARK MODE
//  → Akan ditambahkan di tahap berikutnya
// ============================================================
