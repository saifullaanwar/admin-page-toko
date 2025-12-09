-- CreateTable
CREATE TABLE `Produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NOT NULL,
    `harga` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stok` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Stok_id_produk_key`(`id_produk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembelian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tgl_beli` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` INTEGER NOT NULL,
    `status` ENUM('Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Selesai',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailPembelian` (
    `id_pembelian` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `harga_satuan` INTEGER NOT NULL,

    PRIMARY KEY (`id_pembelian`, `id_produk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stok` ADD CONSTRAINT `Stok_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `Pembelian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
