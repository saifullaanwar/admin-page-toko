# admin-page-toko
Pre-Interview Test for Web Developer &amp; IT Support

# 📦 PANDUAN IMPLEMENTASI & UJI COBA PROYEK ADMIN PAGE

Dokumen ini berisi langkah-langkah yang diperlukan oleh tim IT atau *Developer* untuk menyiapkan, mengonfigurasi, dan menjalankan aplikasi Admin Page Toko secara lokal.

---

## 🛠️ 1. Persiapan Awal (Prasyarat)

Pastikan lingkungan Anda memenuhi prasyarat berikut:

* **Node.js & npm:** Terinstal (versi stabil).
* **MySQL / MariaDB Server:** Layanan database harus berjalan.
* **Gemini API Key:** Diperlukan untuk fungsionalitas Chatbot.
* **Database Kosong:** Buat *database* kosong di server MySQL Anda (misalnya, beri nama `toko_db`).

### Langkah Eksekusi:

* **Kloning Repositori:**
    ```bash
    git clone https://github.com/saifullaanwar/admin-page-toko.git
    cd admin-page-toko
    ```
* **Instalasi Dependensi:**
    ```bash
    npm install
    ```

---

## 🔑 2. Konfigurasi Lingkungan (`.env`)

Anda harus membuat file konfigurasi lingkungan untuk koneksi database dan API Key.

* **Buat File `.env`:** Buat file baru bernama **`.env`** di *root* direktori proyek.

* **Isi Konfigurasi:** Ganti *placeholder* dengan kredensial yang valid dari lingkungan Anda.

    ```env
    # Koneksi Database MySQL/MariaDB
    # Sesuaikan dengan user, password, dan nama database kosong Anda
    DATABASE_URL="mysql://user_anda:password_anda@localhost:3306/toko_db"

    # API Key untuk Chatbot Gemini
    GEMINI_API_KEY="API_KEY_MEREKA"
    ```

---

## 💾 3. Penyiapan Database (Prisma Migrations)

Setelah konfigurasi koneksi selesai, terapkan skema database.

* **Jalankan Migrasi:** Perintah ini akan membuat semua tabel (`Pembelian`, `Produk`, `Stok`, dll.) berdasarkan `prisma/schema.prisma`.
    ```bash
    npx prisma migrate deploy
    ```
* **Isi Data Awal (Opsional):** Jika tersedia *seeder* (`seed.js`), jalankan untuk mengisi tabel `Produk` dengan data uji coba.
    ```bash
    npx prisma db seed
    ```

---

## ▶️ 4. Menjalankan Server dan Uji Coba

Server siap untuk dihidupkan.

* **Mulai Server:** Gunakan *script* yang telah didefinisikan.
    ```bash
    npm run dev
    # ATAU
    npm start
    ```
* **Akses Aplikasi:** Buka *browser* dan navigasi ke alamat lokal:
    ```
    http://localhost:3000
    ```

### 📋 Uji Fungsionalitas Utama

Verifikasi fitur-fitur penting proyek:

* **Input Pembelian Baru:** Uji pencatatan transaksi dan pastikan **stok produk berkurang** di database.
* **Batalkan Pembelian:** Uji pembatalan transaksi dan pastikan **stok produk dikembalikan** ke jumlah semula (menggunakan *Prisma Transaction*).
* **Pembersihan Riwayat:** Uji penghapusan permanen transaksi yang berstatus **"Dibatalkan"**.
* **Uji Chatbot:** Buka *widget floating* Chatbot dan pastikan komunikasi dengan **Gemini API** berfungsi.
