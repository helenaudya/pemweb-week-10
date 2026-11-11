require('dotenv').config();
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_WARNA = '#8C6FB0';

// Middleware wajib agar Express bisa membaca body JSON
app.use(express.json());

// Menyediakan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Ambil id dari URL, kembalikan null jika bukan angka valid
const parseId = (v) => (/^\d+$/.test(v) ? Number(v) : null);

// 1. GET: Menampilkan seluruh data buku (dari Neon via Prisma)
app.get('/api/books', async (req, res) => {
    const books = await prisma.book.findMany({ orderBy: { id: 'asc' } });
    res.status(200).json(books);
});

// 2. POST: Menambahkan data buku baru
app.post('/api/books', async (req, res) => {
    const judul = String(req.body.judul || '').trim();
    const penulis = String(req.body.penulis || '').trim();
    const warna = req.body.warna || DEFAULT_WARNA;

    if (!judul || !penulis) {
        return res.status(400).json({ message: 'Judul dan Penulis wajib diisi!' });
    }
    if (!HEX.test(warna)) {
        return res.status(400).json({ message: 'Warna cover harus berformat hex, contoh #C0504D' });
    }

    const newBook = await prisma.book.create({ data: { judul, penulis, warna } });
    res.status(201).json(newBook);
});

// 3. PUT: Mengubah data buku
app.put('/api/books/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const data = {};
    for (const k of ['judul', 'penulis']) {
        const v = String(req.body[k] || '').trim();
        if (v) data[k] = v;
    }
    if (req.body.warna) {
        if (!HEX.test(req.body.warna)) {
            return res.status(400).json({ message: 'Warna cover harus berformat hex, contoh #C0504D' });
        }
        data.warna = req.body.warna;
    }

    const exists = id !== null && (await prisma.book.findUnique({ where: { id } }));
    if (!exists) {
        return res.status(404).json({ message: 'Buku tidak ditemukan!' });
    }

    const book = await prisma.book.update({ where: { id }, data });
    res.status(200).json({ message: 'Buku berhasil diubah', book });
});

// 4. DELETE: Menghapus data buku
app.delete('/api/books/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const exists = id !== null && (await prisma.book.findUnique({ where: { id } }));
    if (!exists) {
        return res.status(404).json({ message: 'Buku tidak ditemukan!' });
    }

    const deletedBook = await prisma.book.delete({ where: { id } });
    res.status(200).json({ message: 'Buku berhasil dihapus', deletedBook });
});

// Penanganan error (Express 5 otomatis meneruskan error async ke sini)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server/database.' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });