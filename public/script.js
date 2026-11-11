const API_URL = '/api/books';
const form = document.getElementById('bookForm');
const tableBody = document.getElementById('bookTableBody');
const bookIdInput = document.getElementById('bookId');
const judulInput = document.getElementById('judul');
const penulisInput = document.getElementById('penulis');
const submitBtn = document.getElementById('submitBtn');

// 1. READ (GET): Menampilkan data buku dari server
async function loadBooks() {
    try {
        const response = await fetch(API_URL);
        const books = await response.json();
        
        tableBody.innerHTML = ''; // Kosongkan tabel sebelum diisi ulang
        
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${book.id}</td>
                <td><strong>${book.judul}</strong></td>
                <td>${book.penulis}</td>
                <td>
                    <div class="action-buttons">
                        <!-- Perhatikan penggunaan petik terbalik (backtick) untuk mencegah error pada string -->
                        <button class="btn-edit" onclick="editBook(${book.id}, \`${book.judul}\`, \`${book.penulis}\`)">Edit</button>
                        <button class="btn-delete" onclick="deleteBook(${book.id})">Hapus</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Gagal memuat data:', error);
    }
}

// 2. CREATE & UPDATE (POST & PUT): Menangani submit form
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = bookIdInput.value;
    const judul = judulInput.value;
    const penulis = penulisInput.value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ judul, penulis })
        });

        if (response.ok) {
            form.reset(); // Kosongkan input form
            bookIdInput.value = '';
            submitBtn.textContent = 'Tambah Buku';
            submitBtn.classList.remove('btn-edit');
            submitBtn.classList.add('btn-primary');
            loadBooks(); // Muat ulang data di tabel
        } else {
            alert('Gagal menyimpan data buku.');
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
});

// Menyiapkan form untuk fitur Edit (PUT)
window.editBook = function(id, judul, penulis) {
    bookIdInput.value = id;
    judulInput.value = judul;
    penulisInput.value = penulis;
    
    // Ubah tampilan tombol submit untuk menandakan mode edit
    submitBtn.textContent = 'Simpan Perubahan';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-edit');
    
    // Scroll ke atas agar form terlihat oleh user
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. DELETE: Menghapus data buku
window.deleteBook = async function(id) {
    if (confirm('Apakah kamu yakin ingin menghapus buku ini dari daftar?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadBooks(); // Muat ulang tabel setelah data dihapus
            } else {
                alert('Gagal menghapus buku.');
            }
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
        }
    }
}

// Panggil fungsi loadBooks pertama kali saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadBooks);