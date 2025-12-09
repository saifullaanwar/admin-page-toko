require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialProducts = [
    { nama: 'Laptop Gaming', harga: 15000000, initialStock: 50 },
    { nama: 'Monitor 27 Inch', harga: 3500000, initialStock: 50 },
    { nama: 'Keyboard Mekanik', harga: 1200000, initialStock: 50 },
    { nama: 'Mouse Wireless', harga: 450000, initialStock: 50 },
    { nama: 'Headset Bluetooth', harga: 700000, initialStock: 50 },
    { nama: 'Webcam HD', harga: 550000, initialStock: 50 },
    { nama: 'SSD 512GB', harga: 800000, initialStock: 50 },
    { nama: 'RAM 16GB DDR4', harga: 950000, initialStock: 50 },
    { nama: 'Power Bank 10000mAh', harga: 250000, initialStock: 50 },
    { nama: 'Speaker Portable', harga: 300000, initialStock: 50 },
];

async function main() {
    console.log(`Menghapus data Produk dan Stok lama...`);
    await prisma.stok.deleteMany({});
    await prisma.produk.deleteMany({});
    await prisma.pembelian.deleteMany({});

    console.log(`Memulai seeding data Produk dan Stok...`);

    for (const data of initialProducts) {
        const product = await prisma.produk.create({
            data: {
                nama: data.nama,
                harga: data.harga, 
                stok: {
                    create: {
                        jumlah: data.initialStock,
                    },
                },
            },
        });
        console.log(`Berhasil membuat produk ID: ${product.id}, Nama: ${product.nama}`);
    }

    console.log(`Seeding selesai.`);
}

main()
    .catch((e) => {
        console.error("Error saat seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });