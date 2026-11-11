require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = [
    { judul: 'Bumi Manusia',    penulis: 'Pramoedya Ananta Toer', warna: '#C0504D' },
    { judul: 'Laskar Pelangi',  penulis: 'Andrea Hirata',         warna: '#4F81BD' },
    { judul: 'Cantik Itu Luka', penulis: 'Eka Kurniawan',         warna: '#8C6FB0' },
    { judul: 'Laut Bercerita',  penulis: 'Leila S. Chudori',      warna: '#5E9E6E' },
];

async function main() {
    if ((await prisma.book.count()) > 0) {
        console.log('Tabel sudah berisi data, seed dilewati.');
        return;
    }
    await prisma.book.createMany({ data });
    console.log('Seed selesai: 4 buku ditambahkan.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());