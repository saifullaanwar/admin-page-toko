// routes/index.js

const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const chatController = require('../controllers/chatController'); // Harus tetap ada

// ===================================================
// ROUTES ADMIN PAGE (PEMBELIAN)
// ===================================================

// Route GET: Halaman Utama (memanggil pembelianController.index)
router.get('/', pembelianController.index);

// Route POST: Input Pembelian Baru
// DIPERBAIKI: Mengubah inputPembelian menjadi createPembelian
router.post('/pembelian/input', pembelianController.createPembelian);

// Route POST: Pembatalan Pembelian
router.post('/pembelian/cancel', pembelianController.cancelPembelian);

// Route POST: Selesaikan Pembelian
// DIPERBAIKI: Mengubah completePembelian menjadi markAsSelesai
router.post('/pembelian/selesai', pembelianController.markAsSelesai);

// --- ROUTE BARU UNTUK PEMBERSIHAN ---
// Route POST: Membersihkan transaksi yang dibatalkan
router.post('/clear-cancelled', pembelianController.clearCancelledPurchases);

// ===================================================
// ROUTES CHATBOT
// ===================================================

// Route GET: Halaman Chatbot (diakses oleh iframe widget)
router.get('/chat', chatController.getChatPage);

// Route POST: Mengirim pesan ke Chatbot (menggunakan AJAX/Fetch)
router.post('/chat', chatController.sendMessage);


module.exports = router;