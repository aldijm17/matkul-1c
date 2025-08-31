
        import { db } from "./firebase.js";
        import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

        // Inisialisasi tab
        const triggerTabList = document.querySelectorAll('#infoTabs button')
        triggerTabList.forEach(triggerEl => {
            new bootstrap.Tab(triggerEl)
        });

        // Fungsi untuk membuat ornamen bintang
        function createStars() {
            const starsContainer = document.getElementById('stars-container');
            const starCount = 150;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Random size between 1-3px
                const size = Math.random() * 2 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                // Random position
                star.style.top = `${Math.random() * 100}%`;
                star.style.left = `${Math.random() * 100}%`;
                
                // Random animation duration between 2-5 seconds
                const duration = Math.random() * 3 + 2;
                star.style.animationDuration = `${duration}s`;
                
                // Random delay
                star.style.animationDelay = `${Math.random() * 5}s`;
                
                starsContainer.appendChild(star);
            }
        }
        
        // Fungsi untuk membuat ornamen konstelasi
        function createConstellation(container, dotCount) {
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.className = 'constellation-dot';
                dot.style.top = `${Math.random() * 100}%`;
                dot.style.left = `${Math.random() * 100}%`;
                
                // Random size between 2-4px
                const size = Math.random() * 2 + 2;
                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                
                container.appendChild(dot);
            }
            
            // Add some lines between dots
            const dots = container.querySelectorAll('.constellation-dot');
            for (let i = 0; i < dots.length - 1; i++) {
                if (Math.random() > 0.7) { // Only connect some dots
                    const line = document.createElement('div');
                    line.className = 'constellation-line';
                    
                    const dot1 = dots[i];
                    const dot2 = dots[i + 1];
                    
                    const rect1 = dot1.getBoundingClientRect();
                    const rect2 = dot2.getBoundingClientRect();
                    
                    const x1 = parseFloat(dot1.style.left);
                    const y1 = parseFloat(dot1.style.top);
                    const x2 = parseFloat(dot2.style.left);
                    const y2 = parseFloat(dot2.style.top);
                    
                    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    line.style.width = `${distance}%`;
                    line.style.top = `${y1}%`;
                    line.style.left = `${x1}%`;
                    line.style.transform = `rotate(${angle}deg)`;
                    
                    container.appendChild(line);
                }
            }
        }
        
        // Animasi komet
        function animateComets() {
            const comets = document.querySelectorAll('.comet');
            comets.forEach(comet => {
                comet.style.animation = `cometFly ${20 + Math.random() * 20}s linear infinite`;
            });
        }
        
        // Keyframes untuk animasi komet
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cometFly {
                0% {
                    transform: translateX(-100px) translateY(-100px) rotate(45deg);
                    opacity: 0;
                }
                1% {
                    opacity: 1;
                }
                10% {
                    opacity: 0.8;
                }
                20% {
                    opacity: 0.6;
                }
                30% {
                    opacity: 0.4;
                }
                40% {
                    opacity: 0.2;
                }
                50% {
                    transform: translateX(50vw) translateY(50vh) rotate(45deg);
                    opacity: 0;
                }
                100% {
                    transform: translateX(50vw) translateY(50vh) rotate(45deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Fungsi untuk memuat data dari Firebase
        async function loadMatkulData() {
            try {
                const querySnapshot = await getDocs(collection(db, "jadwal"));
                const matkulContainer = document.getElementById('matkul-container');
                const scheduleBody = document.getElementById('schedule-body');
                const totalMatkul = document.getElementById('total-matkul');
                
                if (querySnapshot.empty) {
                    matkulContainer.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-book fa-3x mb-3" style="color: var(--text-secondary);"></i>
                            <p>Tidak ada mata kuliah yang ditemukan.</p>
                        </div>
                    `;
                    scheduleBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center py-4">Tidak ada jadwal yang ditemukan.</td>
                        </tr>
                    `;
                    return;
                }
                
                // Update jumlah mata kuliah
                totalMatkul.textContent = querySnapshot.size;
                
                // Kosongkan container
                matkulContainer.innerHTML = '';
                scheduleBody.innerHTML = '';
                
                // Urutkan berdasarkan hari
                const dayOrder = {
                    'Senin': 1, 'Selasa': 2, 'Rabu': 3, 
                    'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7
                };
                
                const schedules = [];
                querySnapshot.forEach((doc) => {
                    schedules.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Urutkan berdasarkan hari dan waktu
                schedules.sort((a, b) => {
                    const dayDiff = dayOrder[a.hari] - dayOrder[b.hari];
                    if (dayDiff !== 0) return dayDiff;
                    
                    if (a.waktu_masuk && b.waktu_masuk) {
                        return a.waktu_masuk.localeCompare(b.waktu_masuk);
                    }
                    return 0;
                });
                
                // Render mata kuliah
                const classGrid = document.createElement('div');
                classGrid.className = 'class-grid';
                
                schedules.forEach(schedule => {
                    const classCard = document.createElement('div');
                    classCard.className = 'class-card';
                    classCard.innerHTML = `
                        <div class="class-header">
                            <h4 class="class-title">${schedule.matkul}</h4>
                        </div>
                        <div class="class-body">
                            <div class="class-info">
                                <span class="info-label">Dosen:</span>
                                <span class="info-value">${schedule.dosen}</span>
                            </div>
                            <div class="class-info">
                                <span class="info-label">Hari:</span>
                                <span class="info-value">${schedule.hari}</span>
                            </div>
                            <div class="class-info">
                                <span class="info-label">Waktu:</span>
                                <span class="info-value">${formatTime(schedule.waktu_masuk)} - ${formatTime(schedule.waktu_keluar)}</span>
                            </div>
                            <div class="class-info">
                                <span class="info-label">Ruangan:</span>
                                <span class="info-value">${schedule.ruang || 'TBA'}</span>
                            </div>
                        </div>
                    `;
                    
                    // Tambahkan event listener untuk menampilkan modal
                    classCard.addEventListener('click', () => {
                        showClassDetails(schedule);
                    });
                    
                    classGrid.appendChild(classCard);
                });
                
                matkulContainer.appendChild(classGrid);
                
                // Render jadwal
                schedules.forEach(schedule => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${schedule.hari}</td>
                        <td>${schedule.matkul}</td>
                        <td>${formatTime(schedule.waktu_masuk)} - ${formatTime(schedule.waktu_keluar)}</td>
                        <td>${schedule.ruang || 'TBA'}</td>
                    `;
                    scheduleBody.appendChild(row);
                });
                
            } catch (error) {
                console.error("Error loading data:", error);
                document.getElementById('matkul-container').innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: var(--space-pink);"></i>
                        <p>Terjadi kesalahan saat memuat data.</p>
                        <button class="btn btn-primary mt-2" onclick="loadMatkulData()">Coba Lagi</button>
                    </div>
                `;
            }
        }
        
        // Fungsi untuk menampilkan detail mata kuliah di modal
        function showClassDetails(schedule) {
            const modalTitle = document.getElementById('modalClassTitle');
            const modalBody = document.getElementById('modalClassBody');
            
            modalTitle.textContent = schedule.matkul;
            modalBody.innerHTML = `
                <div class="modal-detail">
                    <div class="detail-label">Dosen Pengajar</div>
                    <div class="detail-value">${schedule.dosen}</div>
                </div>
                <div class="modal-detail">
                    <div class="detail-label">Hari</div>
                    <div class="detail-value">${schedule.hari}</div>
                </div>
                <div class="modal-detail">
                    <div class="detail-label">Waktu</div>
                <div class="detail-value">${formatTime(schedule.waktu_masuk)} - ${formatTime(schedule.waktu_keluar)}</div>
            </div>
            <div class="modal-detail">
                <div class="detail-label">Ruangan</div>
                <div class="detail-value">${schedule.ruang || 'Tidak disebutkan'}</div>
            </div>
            <div class="modal-detail">
                <div class="detail-label">ID Jadwal</div>
                <div class="detail-value">${schedule.id}</div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('classModal'));
        modal.show();
    }
    
    // Fungsi untuk memformat waktu
    function formatTime(timeString) {
        if (!timeString) return '-';
        
        // Convert 24-hour format to more readable format
        const [hours, minutes] = timeString.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        return `${hour12}:${minutes} ${ampm}`;
    }
    
    // Muat data saat halaman dimuat
    document.addEventListener('DOMContentLoaded', () => {
        createStars();
        createConstellation(document.getElementById('constellation1'), 6);
        createConstellation(document.getElementById('constellation2'), 8);
        animateComets();
        loadMatkulData();
    });
    
    // Ekspor fungsi ke global scope untuk bisa dipanggil dari button coba lagi
    window.loadMatkulData = loadMatkulData;