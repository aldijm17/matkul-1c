
import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const jadwalList = document.getElementById("jadwalList");

async function loadJadwal() {
  jadwalList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "jadwal"));
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    jadwalList.innerHTML += `
      <tr>
        <td>${data.hari}</td>
        <td>${data.matkul}</td>
        <td>${data.waktu_masuk || '-'}</td>
        <td>${data.waktu_keluar || '-'}</td>
        <td>${data.dosen}</td>
        <td>${data.ruang || '-'}</td>
        <td>
          <a href="add.html?id=${docSnap.id}">✏️ Edit</a>
          <button onclick="hapus('${docSnap.id}')">🗑️ Hapus</button>
        </td>
      </tr>
    `;
  });
}

window.hapus = async function(id) {
  if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
    await deleteDoc(doc(db, "jadwal", id));
    loadJadwal();
  }
}

loadJadwal();
