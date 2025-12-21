const { GoogleGenAI } = require('@google/genai');
const prisma = require('../models/prisma');

// Inisialisasi Gemini dengan API Key dari .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// Riwayat chat disimpan dalam array (Memory Storage)
let chatHistory = []; 

// Tampilkan halaman chatbot
exports.getChatPage = (req, res) => {
    res.render('chatbot', { 
        history: chatHistory, 
        message: null 
    });
};

// Fungsi menghapus riwayat chat
exports.clearChat = (req, res) => {
    chatHistory = []; 
    return res.status(200).json({ success: true, message: 'Riwayat berhasil dihapus.' });
};

// Fungsi mengirim pesan ke AI
exports.sendMessage = async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
    }

    try {
        // 1. Ambil data stok & transaksi untuk konteks AI
        const produkList = await prisma.produk.findMany({ include: { stok: true } });
        const transaksiList = await prisma.pembelian.findMany({
            take: 5,
            orderBy: { tgl_beli: 'desc' }
        });

        const teksStok = produkList.map(p => `- ${p.nama}: Stok ${p.stok ? p.stok.jumlah : 0}`).join("\n");
        const teksTransaksi = transaksiList.map(t => `- ID: ${t.id}, Total: ${t.total}, Status: ${t.status}`).join("\n");

        // 2. Bungkus dalam prompt instruksi
        const promptLengkap = `
Kamu adalah asisten toko. Berikut adalah data asli dari database kami:
STOK BARANG:
${teksStok}

5 TRANSAKSI TERAKHIR:
${teksTransaksi}

Pertanyaan user: ${userMessage}`;

        // 3. Setup sesi chat Gemini
        const chat = ai.chats.create({
            model: "gemini-2.5-flash", 
            history: chatHistory.map(item => ({
                role: item.sender === 'user' ? 'user' : 'model',
                parts: [{ text: item.text }] 
            }))
        });

        const response = await chat.sendMessage({ message: promptLengkap });
        const aiResponse = response.text;

        // 4. Simpan ke history (Pesan asli user agar tampilan rapi)
        chatHistory.push({ sender: 'user', text: userMessage });
        chatHistory.push({ sender: 'model', text: aiResponse });
        
        return res.status(200).json({ 
            success: true, 
            aiResponse: aiResponse 
        });

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal menghubungi AI: ' + error.message
        });
    }
};