// controllers/pembelianController.js

const prisma = require('../models/prisma'); 
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

// Fungsi Helper untuk format harga
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

// =================================================================
// 1. GET: Halaman Utama / (exports.index)
// =================================================================

exports.index = async (req, res) => { // DULU BERNAMA getFormData
    try {
        const produkList = await prisma.produk.findMany({
            include: {
                stok: true,
            }, 
        });

        const pembelianList = await prisma.pembelian.findMany({
            orderBy: { tgl_beli: 'desc' }, 
            include: {
                DetailPembelian: { 
                    include: { 
                        produk: true,
                    },
                },
            },
        });
        
        // Hitung Total Pembayaran dan Format Tanggal
        const formattedPembelianList = pembelianList.map(pembelian => {
            const totalBayar = pembelian.DetailPembelian.reduce((sum, item) => sum + (item.jumlah * item.harga_satuan), 0);
            return {
                ...pembelian,
                totalBayar: formatRupiah(totalBayar),
                tanggalFormatted: new Date(pembelian.tgl_beli).toLocaleString('id-ID'),
            };
        });

        res.render('pembelian', {
            produkList,
            pembelianList: formattedPembelianList,
            message: req.session.message, 
            formatRupiah: formatRupiah,
        });
        req.session.message = null; 

    } catch (error) {
        console.error("Error saat mengambil data form:", error);
        res.status(500).send("Terjadi kesalahan server saat memuat data.");
    }
};

// =================================================================
// 2. POST: Membuat Pembelian Baru (Status Awal: 'Baru')
// =================================================================

exports.createPembelian = async (req, res) => {
    const { id_produk, jumlah } = req.body;
    const jumlahBeli = parseInt(jumlah);
    const idProduk = parseInt(id_produk);

    if (jumlahBeli <= 0 || !idProduk) {
        req.session.message = { type: 'error', text: 'Input jumlah atau produk tidak valid.' };
        return res.redirect('/');
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Cek Ketersediaan Stok dan Harga
            const produk = await tx.produk.findUnique({
                where: { id: idProduk },
                include: { stok: true },
            });

            if (!produk || !produk.stok || produk.stok.jumlah < jumlahBeli) {
                throw new Error(`Stok produk ${produk.nama} (${produk.stok.jumlah}) tidak mencukupi untuk ${jumlahBeli} item.`);
            }

            const totalHarga = produk.harga * jumlahBeli; 
            
            // 2. Kurangi Stok
            await tx.stok.update({
                where: { id: produk.stok.id },
                data: {
                    jumlah: {
                        decrement: jumlahBeli,
                    },
                },
            });

            // 3. Buat Entri Pembelian 
            const pembelianBaru = await tx.pembelian.create({
                data: {
                    tgl_beli: new Date(),
                    status: 'Baru', 
                    total: totalHarga, 
                },
            });

            // 4. Buat Entri Detail Pembelian
            await tx.detailPembelian.create({ 
                data: {
                    id_pembelian: pembelianBaru.id,
                    id_produk: idProduk,
                    jumlah: jumlahBeli,
                    harga_satuan: produk.harga, 
                },
            });

            req.session.message = { type: 'success', text: `Pembelian ID ${pembelianBaru.id} berhasil dicatat dengan status 'Baru'. Stok berhasil dikurangi.` };
        });

    } catch (error) {
        console.error("Kesalahan Transaksi Pembelian:", error.message);
        req.session.message = { type: 'error', text: `Gagal mencatat pembelian: ${error.message}` };
    }

    res.redirect('/');
};

// =================================================================
// 3. POST: Pembatalan Pembelian
// =================================================================

exports.cancelPembelian = async (req, res) => {
    const idPembelian = parseInt(req.body.id_pembelian_cancel);

    if (!idPembelian) {
        req.session.message = { type: 'error', text: 'ID Pembelian untuk pembatalan tidak valid.' };
        return res.redirect('/');
    }

    try {
        await prisma.$transaction(async (tx) => {
            const pembelian = await tx.pembelian.findUnique({
                where: { id: idPembelian },
                include: { DetailPembelian: true }, 
            });

            if (!pembelian) {
                throw new Error(`Pembelian ID ${idPembelian} tidak ditemukan.`);
            }
            if (pembelian.status === 'Dibatalkan') { 
                throw new Error(`Pembelian ID ${idPembelian} sudah dibatalkan sebelumnya.`);
            }

            // Kembalikan Stok
            for (const item of pembelian.DetailPembelian) { 
                const stok = await tx.stok.findUnique({
                    where: { id_produk: item.id_produk },
                });
                
                if (!stok) {
                    throw new Error(`Stok produk ID ${item.id_produk} hilang.`);
                }

                await tx.stok.update({
                    where: { id: stok.id },
                    data: {
                        jumlah: {
                            increment: item.jumlah,
                        },
                    },
                });
            }

            // Perbarui Status Pembelian ke 'Dibatalkan'
            await tx.pembelian.update({
                where: { id: idPembelian },
                data: { status: 'Dibatalkan' }, 
            });

            req.session.message = { type: 'success', text: `Pembelian ID ${idPembelian} berhasil dibatalkan. Stok telah dikembalikan.` };
        });

    } catch (error) {
        console.error("Kesalahan Transaksi Pembatalan:", error.message);
        req.session.message = { type: 'error', text: `Gagal membatalkan pembelian: ${error.message}` };
    }

    res.redirect('/');
};

// =================================================================
// 4. POST: Ubah Status menjadi Selesai
// =================================================================

exports.markAsSelesai = async (req, res) => {
    const idPembelian = parseInt(req.body.id_pembelian_selesai);

    if (!idPembelian) {
        req.session.message = { type: 'error', text: 'ID Pembelian untuk penyelesaian tidak valid.' };
        return res.redirect('/');
    }

    try {
        const result = await prisma.pembelian.updateMany({
            where: { id: idPembelian, status: 'Baru' }, 
            data: { status: 'Selesai' }, 
        });

        if (result.count === 0) {
            
            const pembelianCheck = await prisma.pembelian.findUnique({
                where: { id: idPembelian },
            });

            if (!pembelianCheck) {
                req.session.message = { type: 'error', text: `Pembelian ID ${idPembelian} tidak ditemukan.` };
            } else {
                req.session.message = { type: 'error', text: `Gagal menyelesaikan pembelian ID ${idPembelian}. Status saat ini adalah '${pembelianCheck.status}', bukan 'Baru'.` };
            }
        } else {
             req.session.message = { type: 'success', text: `Pembelian ID ${idPembelian} berhasil diubah status menjadi 'Selesai'.` };
        }
        
    } catch (error) {
        console.error("Kesalahan saat mengubah status:", error.message);
        req.session.message = { type: 'error', text: `Gagal mengubah status pembelian: ${error.message}` };
    }

    res.redirect('/');
};

// =================================================================
// 5. POST: Membersihkan Transaksi Dibatalkan (Fungsi Baru)
// =================================================================
exports.clearCancelledPurchases = async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Hapus DetailPembelian yang terkait dengan Pembelian 'Dibatalkan'
            await tx.detailPembelian.deleteMany({
                where: {
                    pembelian: {
                        status: 'Dibatalkan'
                    }
                }
            });

            // 2. Hapus entitas Pembelian yang memiliki status 'Dibatalkan'
            const result = await tx.pembelian.deleteMany({
                where: {
                    status: 'Dibatalkan'
                }
            });

            req.session.message = {
                type: 'success',
                text: `${result.count} transaksi Dibatalkan berhasil dihapus permanen dari riwayat.`
            };
        });

    } catch (error) {
        console.error("Error menghapus riwayat pembatalan:", error);
        req.session.message = {
            type: 'error',
            text: 'Gagal menghapus riwayat pembatalan. Coba periksa koneksi database atau skema Prisma.'
        };
    } finally {
        res.redirect('/');
    }
};