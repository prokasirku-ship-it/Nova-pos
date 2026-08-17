// Fungsi untuk memuat modul halaman tanpa reload browser
async function loadPage(pageName, element) {
  const container = document.getElementById('main-content');
  container.innerHTML = '<div class="loader">Memuat modul...</div>';

  // Update status tombol menu yang aktif
  if (element) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
  }

  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error('Modul gagal dimuat');
    const html = await response.text();
    
    // Masukkan HTML baru ke wadah utama
    container.innerHTML = html;

    // Inisialisasi ulang fungsi sesuai halaman yang dibuka
    if (pageName === 'pos' && typeof renderPOSProducts === 'function') renderPOSProducts();
    if (pageName === 'inventory' && typeof renderProductTable === 'function') renderProductTable();
    if (pageName === 'reports' && typeof renderReportView === 'function') renderReportView();

  } catch (error) {
    container.innerHTML = `<div style="color:var(--danger); font-weight:bold;">Gagal memuat modul: ${error.message}</div>`;
  }
}

// Muat modul 'pos' secara otomatis saat aplikasi pertama kali dibuka
document.addEventListener('DOMContentLoaded', () => {
  loadPage('pos', document.querySelector('.nav-link.active'));
});
