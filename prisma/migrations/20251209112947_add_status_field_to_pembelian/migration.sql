-- AlterTable
ALTER TABLE `pembelian` MODIFY `status` ENUM('Baru', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Baru';
