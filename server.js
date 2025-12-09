// server.js

// --- 1. Import Dependencies ---
const express = require('express');
const session = require('express-session'); // Digunakan untuk menyimpan session dan pesan flash (message)
const dotenv = require('dotenv');
const path = require('path');

// --- Import Controllers & Routes ---
const indexRouter = require('./routes/index'); // Route untuk Tugas 1 (Admin Page)
const chatController = require('./controllers/chatController'); // Controller untuk Tugas 2 (Chatbot)

// --- 2. Konfigurasi ---
dotenv.config(); // Memuat variabel dari file .env
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. Setup View Engine (EJS) ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- 4. Middleware ---

// A. Session Middleware (PENTING untuk menyimpan riwayat chat dan pesan notifikasi)
app.use(session({
    secret: 'kunci_rahasia_super_aman_12345', // Ganti dengan kunci rahasia yang lebih kompleks di production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } 
}));

// B. Body Parsing Middleware (PENTING! Mencegah error 'Cannot read properties of undefined')
// Digunakan untuk memproses data dari form POST (seperti input 'message' di chatbot)
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// C. Static Files Middleware
app.use(express.static(path.join(__dirname, 'public')));


// --- 5. Routing ---

// A. Rute untuk Tugas 1: Admin Page (Transaksi Pembelian)
// Menggunakan indexRouter (yang mengarah ke pembelianController)
app.use('/', indexRouter);

// B. Rute untuk Tugas 2: Chatbot Gemini
app.get('/chat', chatController.getChatPage);
app.post('/chat', chatController.sendMessage);


// --- 6. Menjalankan Server ---
app.listen(PORT, () => {
    console.log(`Admin Page Server berjalan di http://localhost:${PORT}`);
});