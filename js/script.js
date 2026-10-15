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
//  BAGIAN 3 — TO-DO LIST
//
//  Struktur data satu tugas (disimpan sebagai objek):
//  {
//    id        : number   → timestamp unik saat tugas dibuat
//    teks      : string   → isi teks tugas
//    selesai   : boolean  → true = sudah dicentang
//    dibuatPada: number   → timestamp (sama dengan id, untuk sort "urutan asli")
//  }
//
//  Semua tugas disimpan dalam array `daftarTugas`.
//  Array ini di-sync ke Local Storage setiap ada perubahan.
//
//  Challenge #2 — Cegah duplikat:
//  Sebelum menambah tugas baru, bandingkan teks (setelah
//  .trim().toLowerCase()) dengan semua tugas yang ada.
//  Jika cocok, tampilkan pesan error dan batalkan penambahan.
//
//  Challenge #3 — Sort:
//  Saat render, buat SALINAN array (spread [...]) lalu urutkan
//  salinan itu. Array asli `daftarTugas` TIDAK diubah urutan
//  simpannya — hanya tampilan yang berubah. Ini mencegah
//  data rusak saat sort berulang kali.
// ============================================================

const STORAGE_KEY_TODO = 'lifedashboard_todos';

// Muat tugas dari Local Storage, atau mulai dengan array kosong
let daftarTugas = muatTugasDariStorage();

// Referensi elemen HTML
const elTodoInput  = document.getElementById('todo-input');
const elBtnAddTodo = document.getElementById('btn-add-todo');
const elTodoError  = document.getElementById('todo-error');
const elTodoList   = document.getElementById('todo-list');
const elSortSelect = document.getElementById('sort-select');

// ── Fungsi Local Storage ──────────────────────────────────

/**
 * Simpan array daftarTugas ke Local Storage.
 * JSON.stringify mengubah array/objek JS → teks (string).
 * Teks inilah yang bisa disimpan di Local Storage.
 */
function simpanTugasKeStorage() {
  localStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(daftarTugas));
}

/**
 * Muat tugas dari Local Storage saat halaman dibuka.
 * JSON.parse mengubah teks kembali → array/objek JS.
 * Jika belum ada data, kembalikan array kosong [].
 */
function muatTugasDariStorage() {
  const data = localStorage.getItem(STORAGE_KEY_TODO);
  return data ? JSON.parse(data) : [];
}

// ── Fungsi Render ─────────────────────────────────────────

/**
 * Tampilkan seluruh daftar tugas ke layar.
 * Setiap kali ada perubahan (tambah/hapus/edit/toggle),
 * fungsi ini dipanggil untuk menggambar ulang seluruh list.
 */
function renderTodoList() {
  elTodoList.innerHTML = ''; // Kosongkan list dulu

  // Ambil nilai sort yang dipilih pengguna
  const sortMode = elSortSelect.value;

  // Buat SALINAN array supaya data asli tidak berubah urutannya
  // Tanda [...] artinya "salin semua isi array ke array baru"
  let tampilan = [...daftarTugas];

  // Terapkan pengurutan pada salinan
  switch (sortMode) {
    case 'name-asc':
      // A → Z (localeCompare untuk teks Bahasa Indonesia)
      tampilan.sort((a, b) => a.teks.localeCompare(b.teks, 'id'));
      break;
    case 'name-desc':
      // Z → A
      tampilan.sort((a, b) => b.teks.localeCompare(a.teks, 'id'));
      break;
    case 'completed':
      // Tugas selesai di atas, belum selesai di bawah
      tampilan.sort((a, b) => b.selesai - a.selesai);
      break;
    case 'active':
      // Belum selesai di atas, selesai di bawah
      tampilan.sort((a, b) => a.selesai - b.selesai);
      break;
    default:
      // 'default' = urutan asli berdasarkan waktu dibuat
      tampilan.sort((a, b) => a.dibuatPada - b.dibuatPada);
  }

  // Tampilkan pesan jika tidak ada tugas
  if (tampilan.length === 0) {
    elTodoList.innerHTML = '<li class="empty-state">Belum ada tugas. Tambahkan satu! 📝</li>';
    return;
  }

  // Buat elemen HTML untuk setiap tugas
  tampilan.forEach(function (tugas) {
    const li = document.createElement('li');
    li.className = `todo-item${tugas.selesai ? ' completed' : ''}`;
    li.dataset.id = tugas.id; // Simpan id di atribut data-id untuk referensi

    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        aria-label="Tandai selesai"
        ${tugas.selesai ? 'checked' : ''}
      />
      <span class="todo-text">${escapeHtml(tugas.teks)}</span>
      <div class="todo-actions">
        <button class="btn-edit" title="Edit tugas">✏️</button>
        <button class="btn-delete" title="Hapus tugas">🗑️</button>
      </div>
    `;

    // Event: centang/uncentang tugas
    li.querySelector('.todo-checkbox').addEventListener('change', function () {
      toggleTugas(tugas.id);
    });

    // Event: tombol edit
    li.querySelector('.btn-edit').addEventListener('click', function () {
      mulaiEditTugas(li, tugas.id);
    });

    // Event: tombol hapus
    li.querySelector('.btn-delete').addEventListener('click', function () {
      hapusTugas(tugas.id);
    });

    elTodoList.appendChild(li);
  });
}

// ── Fungsi CRUD Tugas ─────────────────────────────────────

/**
 * Tambah tugas baru ke daftarTugas.
 * Challenge #2: Cek duplikat sebelum menambahkan.
 */
function tambahTugas() {
  const teksAsli = elTodoInput.value.trim(); // Hapus spasi di awal/akhir

  // Validasi: tidak boleh kosong
  if (teksAsli === '') {
    tampilkanErrorTodo('Tugas tidak boleh kosong.');
    return;
  }

  // Challenge #2 — Cek duplikat (case-insensitive)
  // Normalisasi: ubah semua ke huruf kecil sebelum membandingkan
  const teksNormal = teksAsli.toLowerCase();
  const sudahAda = daftarTugas.some(function (t) {
    return t.teks.toLowerCase() === teksNormal;
  });

  if (sudahAda) {
    tampilkanErrorTodo(`"${teksAsli}" sudah ada di daftar tugasmu! 😊`);
    return;
  }

  // Buat objek tugas baru
  const tugasBaru = {
    id        : Date.now(),   // Timestamp unik sebagai ID
    teks      : teksAsli,
    selesai   : false,
    dibuatPada: Date.now()
  };

  daftarTugas.push(tugasBaru);  // Tambahkan ke array
  simpanTugasKeStorage();        // Simpan ke Local Storage
  renderTodoList();              // Gambar ulang list

  elTodoInput.value = '';        // Kosongkan input
  sembunyikanErrorTodo();        // Hapus pesan error lama
}

/**
 * Toggle status selesai/belum selesai berdasarkan id.
 */
function toggleTugas(id) {
  const tugas = daftarTugas.find(t => t.id === id);
  if (!tugas) return;
  tugas.selesai = !tugas.selesai; // Balik nilai boolean
  simpanTugasKeStorage();
  renderTodoList();
}

/**
 * Hapus tugas dari array berdasarkan id.
 * filter() membuat array baru yang TIDAK mengandung tugas dengan id itu.
 */
function hapusTugas(id) {
  daftarTugas = daftarTugas.filter(t => t.id !== id);
  simpanTugasKeStorage();
  renderTodoList();
}

/**
 * Ubah tampilan item tugas menjadi mode edit (inline).
 * Teks berubah jadi input, tombol edit berubah jadi tombol simpan.
 */
function mulaiEditTugas(liElemen, id) {
  const elTeks    = liElemen.querySelector('.todo-text');
  const elEdit    = liElemen.querySelector('.btn-edit');
  const teksLama  = elTeks.textContent;

  // Ganti <span> dengan <input> yang sudah terisi teks lama
  const inputEdit = document.createElement('input');
  inputEdit.type      = 'text';
  inputEdit.className = 'todo-edit-input';
  inputEdit.value     = teksLama;
  inputEdit.maxLength = 100;
  elTeks.replaceWith(inputEdit);
  inputEdit.focus();
  inputEdit.select(); // Seleksi semua teks supaya mudah diedit

  // Ganti tombol ✏️ jadi tombol ✅ (simpan)
  elEdit.textContent = '✅';
  elEdit.className   = 'btn-save';

  // Fungsi simpan perubahan
  function simpanEdit() {
    const teksBaru = inputEdit.value.trim();

    if (teksBaru === '') {
      inputEdit.style.borderColor = 'var(--accent-danger)';
      return;
    }

    // Cek duplikat saat edit (kecuali jika teksnya sama dengan sebelumnya)
    if (teksBaru.toLowerCase() !== teksLama.toLowerCase()) {
      const sudahAda = daftarTugas.some(
        t => t.id !== id && t.teks.toLowerCase() === teksBaru.toLowerCase()
      );
      if (sudahAda) {
        inputEdit.style.borderColor = 'var(--accent-danger)';
        tampilkanErrorTodo(`"${teksBaru}" sudah ada di daftar tugasmu! 😊`);
        return;
      }
    }

    // Update teks di array
    const tugas = daftarTugas.find(t => t.id === id);
    if (tugas) tugas.teks = teksBaru;
    simpanTugasKeStorage();
    sembunyikanErrorTodo();
    renderTodoList();
  }

  // Simpan saat tombol ✅ diklik
  elEdit.addEventListener('click', simpanEdit);

  // Simpan juga saat tekan Enter, batal saat tekan Escape
  inputEdit.addEventListener('keydown', function (e) {
    if (e.key === 'Enter')  simpanEdit();
    if (e.key === 'Escape') { sembunyikanErrorTodo(); renderTodoList(); }
  });
}

// ── Fungsi Helper Error ───────────────────────────────────

function tampilkanErrorTodo(pesan) {
  elTodoError.textContent = pesan;
  elTodoError.classList.remove('hidden');
}

function sembunyikanErrorTodo() {
  elTodoError.textContent = '';
  elTodoError.classList.add('hidden');
}

/**
 * Mencegah XSS: karakter HTML khusus di-escape sebelum
 * ditampilkan ke innerHTML. Ini kebiasaan aman saat
 * menampilkan teks dari input pengguna.
 */
function escapeHtml(teks) {
  return teks
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event Listener ────────────────────────────────────────

// Tombol Tambah
elBtnAddTodo.addEventListener('click', tambahTugas);

// Tekan Enter di input juga menambah tugas
elTodoInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') tambahTugas();
});

// Hapus pesan error saat pengguna mulai mengetik lagi
elTodoInput.addEventListener('input', sembunyikanErrorTodo);

// Saat dropdown sort berubah, render ulang list
elSortSelect.addEventListener('change', renderTodoList);

// Render pertama kali saat halaman dibuka
renderTodoList();


// ============================================================
//  BAGIAN 4 — QUICK LINKS
//
//  Struktur data satu tautan:
//  {
//    id   : number  → timestamp unik
//    nama : string  → label yang ditampilkan
//    url  : string  → URL lengkap (harus https:// atau http://)
//  }
//
//  Semua tautan disimpan dalam array `daftarLinks`.
//  Setiap perubahan langsung di-sync ke Local Storage.
// ============================================================

const STORAGE_KEY_LINKS = 'lifedashboard_links';

let daftarLinks = muatLinksDariStorage();

// Referensi elemen HTML
const elLinkNameInput = document.getElementById('link-name-input');
const elLinkUrlInput  = document.getElementById('link-url-input');
const elBtnAddLink    = document.getElementById('btn-add-link');
const elLinkError     = document.getElementById('link-error');
const elLinksList     = document.getElementById('links-list');

// ── Fungsi Local Storage ──────────────────────────────────

function simpanLinksKeStorage() {
  localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(daftarLinks));
}

function muatLinksDariStorage() {
  const data = localStorage.getItem(STORAGE_KEY_LINKS);
  return data ? JSON.parse(data) : [];
}

// ── Validasi URL ──────────────────────────────────────────

/**
 * Cek apakah URL valid.
 * Menggunakan objek bawaan browser `URL` untuk validasi —
 * lebih andal daripada regex buatan sendiri.
 */
function urlValid(str) {
  try {
    const u = new URL(str);
    // Hanya izinkan http dan https (bukan ftp, file, dll.)
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Fungsi Render ─────────────────────────────────────────

function renderLinksList() {
  elLinksList.innerHTML = '';

  if (daftarLinks.length === 0) {
    elLinksList.innerHTML = '<li class="empty-state">Belum ada tautan. Tambahkan satu! 🔗</li>';
    return;
  }

  daftarLinks.forEach(function (link) {
    const li = document.createElement('li');
    li.className = 'link-item';
    li.dataset.id = link.id;

    // Tampilkan domain sebagai preview URL yang ringkas
    // Contoh: "https://github.com/user/repo" → "github.com"
    let domainPreview = '';
    try {
      domainPreview = new URL(link.url).hostname;
    } catch {
      domainPreview = link.url;
    }

    li.innerHTML = `
      <a
        href="${escapeHtml(link.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="link-anchor"
        title="${escapeHtml(link.url)}"
      >${escapeHtml(link.nama)}</a>
      <span class="link-url-preview">${escapeHtml(domainPreview)}</span>
      <button class="btn-delete" title="Hapus tautan">🗑️</button>
    `;

    // Event: tombol hapus
    li.querySelector('.btn-delete').addEventListener('click', function () {
      hapusLink(link.id);
    });

    elLinksList.appendChild(li);
  });
}

// ── Fungsi CRUD Links ─────────────────────────────────────

function tambahLink() {
  const nama = elLinkNameInput.value.trim();
  const url  = elLinkUrlInput.value.trim();

  // Validasi nama
  if (nama === '') {
    tampilkanErrorLink('Nama tautan tidak boleh kosong.');
    return;
  }

  // Validasi URL
  if (url === '') {
    tampilkanErrorLink('URL tidak boleh kosong.');
    return;
  }

  if (!urlValid(url)) {
    tampilkanErrorLink('URL tidak valid. Gunakan format: https://contoh.com');
    return;
  }

  const linkBaru = {
    id  : Date.now(),
    nama: nama,
    url : url
  };

  daftarLinks.push(linkBaru);
  simpanLinksKeStorage();
  renderLinksList();

  // Kosongkan input setelah berhasil
  elLinkNameInput.value = '';
  elLinkUrlInput.value  = '';
  sembunyikanErrorLink();
  elLinkNameInput.focus();
}

function hapusLink(id) {
  daftarLinks = daftarLinks.filter(l => l.id !== id);
  simpanLinksKeStorage();
  renderLinksList();
}

// ── Fungsi Helper Error ───────────────────────────────────

function tampilkanErrorLink(pesan) {
  elLinkError.textContent = pesan;
  elLinkError.classList.remove('hidden');
}

function sembunyikanErrorLink() {
  elLinkError.textContent = '';
  elLinkError.classList.add('hidden');
}

// ── Event Listener ────────────────────────────────────────

elBtnAddLink.addEventListener('click', tambahLink);

// Tekan Enter di salah satu input juga menambah tautan
elLinkNameInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') tambahLink();
});
elLinkUrlInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') tambahLink();
});

// Hapus pesan error saat pengguna mulai mengetik lagi
elLinkNameInput.addEventListener('input', sembunyikanErrorLink);
elLinkUrlInput.addEventListener('input', sembunyikanErrorLink);

// Render pertama kali saat halaman dibuka
renderLinksList();


// ============================================================
//  BAGIAN 5 – DARK MODE
//  → Akan ditambahkan di tahap berikutnya
// ============================================================
