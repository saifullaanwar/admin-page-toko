// controllers/chatController.js

const { GoogleGenAI } = require('@google/genai');

// Inisialisasi Gemini AI. Kunci akan otomatis dibaca dari GEMINI_API_KEY di .env
const ai = new GoogleGenAI({}); 
// Riwayat chat di luar fungsi controller agar tetap tersimpan selama server berjalan
const chatHistory = []; 

// 1. GET: Menampilkan halaman chat (hanya untuk memuat riwayat awal)
exports.getChatPage = (req, res) => {
    // Karena kita tidak lagi menggunakan pesan session untuk error saat AJAX,
    // kita hanya mengirim history.
    res.render('chatbot', { 
        history: chatHistory, 
        message: null // Tidak perlu pesan flash message dari session
    });
};

// 2. POST: Mengirim pesan ke AI (HARUS MENGEMBALIKAN JSON)
exports.sendMessage = async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        // Jika pesan kosong, kirim status 400 Bad Request
        return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
    }

    // Tambahkan pesan pengguna ke riwayat (di sisi server)
    chatHistory.push({ sender: 'user', text: userMessage });

    try {
        // Setup sesi chat dengan riwayat yang ada
        const chat = ai.chats.create({
            model: "gemini-2.5-flash", 
            history: chatHistory.map(item => ({
                role: item.sender === 'user' ? 'user' : 'model',
                // Pastikan format parts sesuai: [ {text: "teks"} ]
                parts: [{ text: item.text }] 
            }))
        });

        // Kirim pesan terbaru
        const response = await chat.sendMessage({ message: userMessage });
        const aiResponse = response.text;

        // Tambahkan respons AI ke riwayat (di sisi server)
        chatHistory.push({ sender: 'model', text: aiResponse });
        
        // Kirim respons JSON ke client
        return res.status(200).json({ 
            success: true, 
            aiResponse: aiResponse 
        });

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        // Kirim respons error JSON
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal menghubungi AI. Pastikan API Key valid dan terisi.' 
        });
    }
};