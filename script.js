import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const jadwalList = document.getElementById("jadwalList");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");

// Days order for sorting
const dayOrder = {
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
  'Minggu': 7
};

// Loading management
function showLoading(text = "Memuat data jadwal...") {
  if (loadingText && loadingOverlay) {
    loadingText.textContent = text;
    loadingOverlay.classList.add("show");
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("show");
  }
}

// Enhanced loading function with animations
async function loadJadwal() {
  try {
    showLoading("📄 Mengambil data dari Firebase...");
    
    // Add minimum loading time for better UX
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
    const dataPromise = getDocs(collection(db, "jadwal"));
    
    const [querySnapshot] = await Promise.all([dataPromise, minLoadingTime]);
    
    if (querySnapshot.empty) {
      hideLoading();
      showEmptyState();
      return;
    }

    showLoading("📊 Memproses dan mengurutkan data...");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert to array and sort
    const schedules = [];
    querySnapshot.forEach((docSnap) => {
      schedules.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by day and time
    schedules.sort((a, b) => {
      const dayDiff = dayOrder[a.hari] - dayOrder[b.hari];
      if (dayDiff !== 0) return dayDiff;
      
      // If same day, sort by time
      if (a.waktu_masuk && b.waktu_masuk) {
        return a.waktu_masuk.localeCompare(b.waktu_masuk);
      }
      return 0;
    });

    showLoading("🎨 Menampilkan jadwal...");
    await new Promise(resolve => setTimeout(resolve, 300));

    hideLoading();
    renderSchedules(schedules);
    
  } catch (error) {
    console.error("Error loading schedules:", error);
    hideLoading();
    showErrorState(error);
  }
}

function renderSchedules(schedules) {
  if (!jadwalList) return;
  
  // Add staggered animation to rows
  jadwalList.innerHTML = schedules.map((data, index) => `
    <tr style="animation: slideInUp 0.3s ease ${index * 0.1}s both;">
      <td>
        <span class="day-badge">${data.hari}</span>
      </td>
      <td class="subject-cell">${data.matkul}</td>
      <td class="time-cell">${formatTime(data.waktu_masuk)}</td>
      <td class="time-cell">${formatTime(data.waktu_keluar)}</td>
      <td class="professor-cell">${data.dosen}</td>
      <td class="room-cell">${data.ruang || 'TBA'}</td>
      <td>
        <div class="action-buttons">
          <a href="add.html?id=${data.id}" class="btn btn-edit" title="Edit jadwal">
            ✏️ Edit
          </a>
          <button onclick="hapusJadwal('${data.id}', '${data.matkul}')" class="btn btn-delete" title="Hapus jadwal">
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Add CSS for slide animation and responsive table
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .row-deleting {
    animation: fadeOut 0.3s ease forwards;
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Responsive Table with Horizontal Scroll */
  .table-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    margin: 0;
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
  }

  /* Custom scrollbar for better UX */
  .table-container::-webkit-scrollbar {
    height: 8px;
  }

  .table-container::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb {
    background: var(--accent-blue);
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: var(--accent-purple);
  }

  /* Table responsive styles */
  .table-responsive {
    min-width: 800px; /* Minimum width to ensure readability */
  }

  /* Improve table cell spacing on mobile */
  @media (max-width: 768px) {
    .table-container {
      margin: -10px;
      border-radius: 8px;
    }
    
    .table-responsive {
      min-width: 900px; /* Slightly wider on mobile for better readability */
      font-size: 0.9rem;
    }
    
    .table-responsive td,
    .table-responsive th {
      padding: 12px 8px;
      white-space: nowrap;
    }
    
    .subject-cell,
    .professor-cell {
      min-width: 150px;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .day-badge {
      font-size: 0.8rem;
      padding: 4px 8px;
    }
    
    .action-buttons {
      min-width: 140px;
    }
    
    .btn {
      font-size: 0.8rem;
      padding: 6px 10px;
    }
  }

  /* Mobile scroll hint */
  .scroll-hint {
    display: none;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 8px;
    padding: 8px;
    background: var(--bg-secondary);
    border-radius: 6px;
    border: 1px solid var(--border-primary);
  }

  @media (max-width: 768px) {
    .scroll-hint {
      display: block;
    }
  }

  /* Sticky header for better navigation on scroll */
  .table-responsive thead {
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 10;
  }

  .table-responsive thead th {
    border-bottom: 2px solid var(--border-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;
document.head.appendChild(style);

function showEmptyState() {
  if (!jadwalList) return;
  
  jadwalList.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state" style="animation: fadeIn 0.5s ease;">
        <div class="icon">📅</div>
        <h3>Belum ada jadwal kuliah</h3>
        <p>Klik "Tambah Jadwal Baru" untuk menambahkan jadwal pertama Anda</p>
        <div style="margin-top: 20px;">
          <div style="display: inline-block; padding: 8px 16px; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.9rem; color: var(--text-secondary);">
            💡 Tip: Gunakan Ctrl+N untuk menambah jadwal dengan cepat
          </div>
        </div>
      </td>
    </tr>
  `;
}

function showErrorState(error) {
  if (!jadwalList) return;
  
  let errorMessage = "Terjadi kesalahan saat memuat jadwal.";
  
  if (error && error.code === 'permission-denied') {
    errorMessage = "Tidak memiliki izin untuk mengakses data.";
  } else if (error && error.code === 'unavailable') {
    errorMessage = "Layanan tidak tersedia saat ini.";
  } else if (!navigator.onLine) {
    errorMessage = "Tidak ada koneksi internet.";
  }

  jadwalList.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state" style="animation: fadeIn 0.5s ease;">
        <div class="icon">⚠️</div>
        <h3>Error memuat data</h3>
        <p>${errorMessage}</p>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="location.reload()" class="btn btn-edit">
            🔄 Refresh Halaman
          </button>
          <button onclick="loadJadwal()" class="btn" style="background: var(--accent-blue);">
            📡 Coba Lagi
          </button>
        </div>
      </td>
    </tr>
  `;
}

function formatTime(timeString) {
  if (!timeString) return '-';
  
  // Convert 24-hour format to more readable format
  const [hours, minutes] = timeString.split(':');
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${ampm}`;
}

// Enhanced delete function with better UX and animations
window.hapusJadwal = async function(id, matkul) {
  const confirmed = confirm(
    `⚠️ Konfirmasi Penghapusan\n\n` +
    `Apakah Anda yakin ingin menghapus jadwal:\n` +
    `"${matkul}"?\n\n` +
    `Tindakan ini tidak dapat dibatalkan!`
  );
  
  if (confirmed) {
    const row = event.target.closest('tr');
    
    try {
      // Show deleting animation
      if (row) {
        row.classList.add('row-deleting');
      }
      
      // Show loading overlay
      showLoading(`🗑️ Menghapus jadwal "${matkul}"...`);
      
      // Add minimum delay for better UX
      const minDeleteTime = new Promise(resolve => setTimeout(resolve, 1500));
      const deletePromise = deleteDoc(doc(db, "jadwal", id));
      
      await Promise.all([deletePromise, minDeleteTime]);
      
      // Show success message
      showNotification(`✅ Jadwal "${matkul}" berhasil dihapus`, 'success');
      
      // Reload the schedule list with animation
      hideLoading();
      await loadJadwal();
      
    } catch (error) {
      console.error("Error deleting schedule:", error);
      hideLoading();
      
      // Reset row animation
      if (row) {
        row.classList.remove('row-deleting');
      }
      
      let errorMsg = "❌ Gagal menghapus jadwal: ";
      if (error.code === 'permission-denied') {
        errorMsg += "Tidak memiliki izin untuk menghapus data";
      } else if (error.code === 'unavailable') {
        errorMsg += "Layanan tidak tersedia, coba lagi nanti";
      } else {
        errorMsg += error.message;
      }
      
      showNotification(errorMsg, 'error');
    }
  }
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 4000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());

  const notification = document.createElement('div');
  notification.className = 'notification';
  
  const bgColors = {
    success: 'var(--accent-green)',
    error: 'var(--accent-red)',
    info: 'var(--accent-blue)',
    warning: 'var(--accent-orange)'
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColors[type] || bgColors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 600;
    max-width: 350px;
    word-wrap: break-word;
    animation: slideInRight 0.3s ease, fadeOut 0.3s ease ${duration - 300}ms forwards;
    backdrop-filter: blur(8px);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
            style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7; padding: 0; margin-left: auto;">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, duration);
}

// Initialize with welcome message and setup responsive table
document.addEventListener('DOMContentLoaded', () => {
  setupResponsiveTable();
  loadJadwal();
  
  // Show welcome message if it's first visit
  if (!localStorage.getItem('scheduleos_visited')) {
    setTimeout(() => {
      showNotification('🎉 Selamat datang di ScheduleOS!', 'info', 3000);
      localStorage.setItem('scheduleos_visited', 'true');
    }, 1500);
  }
});

// Setup responsive table wrapper
function setupResponsiveTable() {
  const table = document.querySelector('table');
  if (table && !table.closest('.table-container')) {
    // Create wrapper container
    const container = document.createElement('div');
    container.className = 'table-container';
    
    // Add responsive class to table
    table.classList.add('table-responsive');
    
    // Wrap the table
    table.parentNode.insertBefore(container, table);
    container.appendChild(table);
    
    // Add scroll hint for mobile
    const scrollHint = document.createElement('div');
    scrollHint.className = 'scroll-hint';
    scrollHint.innerHTML = '👈 Geser ke kiri/kanan untuk melihat semua kolom 👉';
    container.parentNode.insertBefore(scrollHint, container.nextSibling);
    
    // Add scroll event listeners for better UX
    let scrollTimeout;
    container.addEventListener('scroll', () => {
      container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }, 150);
    });
    
    // Show scroll indicator on mobile if content overflows
    function checkScrollable() {
      const scrollHintEl = document.querySelector('.scroll-hint');
      if (scrollHintEl && container.scrollWidth > container.clientWidth) {
        scrollHintEl.style.display = 'block';
        scrollHintEl.innerHTML = '👈 Geser tabel untuk melihat semua kolom 👉';
      } else if (scrollHintEl) {
        scrollHintEl.style.display = 'none';
      }
    }
    
    // Check on resize
    window.addEventListener('resize', checkScrollable);
    setTimeout(checkScrollable, 100);
  }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + N for new schedule
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    window.location.href = 'add.html';
  }
  
  // F5 or Ctrl/Cmd + R for refresh
  if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
    e.preventDefault();
    loadJadwal();
    showNotification('🔄 Data jadwal diperbarui', 'info', 2000);
  }
  
  // Escape to close notifications
  if (e.key === 'Escape') {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notif => notif.remove());
  }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showNotification('❌ Terjadi kesalahan pada aplikasi', 'error');
});

// Connection status monitoring
window.addEventListener('online', () => {
  showNotification('🌐 Koneksi internet tersambung', 'success', 2000);
  // Auto-reload data when back online
  setTimeout(() => loadJadwal(), 1000);
});

window.addEventListener('offline', () => {
  showNotification('🔵 Koneksi internet terputus - Mode offline aktif', 'warning', 5000);
});

// Performance monitoring
window.addEventListener('load', () => {
  const loadTime = Math.round(performance.now());
  console.log(`🚀 ScheduleOS loaded in ${loadTime}ms`);
  
  if (loadTime > 3000) {
    showNotification('⚡ App dimuat lambat - periksa koneksi internet', 'warning', 3000);
  }
});

// Auto-refresh data every 5 minutes when page is visible
let autoRefreshInterval;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  } else {
    // Refresh data when page becomes visible again
    loadJadwal();
    
    // Set up auto-refresh
    autoRefreshInterval = setInterval(() => {
      loadJadwal();
    }, 5 * 60 * 1000); // 5 minutes
  }
});

console.log('🚀 ScheduleOS v1.0.0 - Sistem Manajemen Jadwal Kuliah');
console.log('📱 PWA Ready | 🎨 GitHub Dark Theme | ⚡ Firebase Backend');
console.log('⌨️ Keyboard Shortcuts: Ctrl+N (Tambah), F5 (Refresh), Esc (Close notifications)');