// models/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ekspor instance Prisma untuk digunakan di seluruh controllers
module.exports = prisma;