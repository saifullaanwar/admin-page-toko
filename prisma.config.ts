import "dotenv/config";
import { defineConfig } from "prisma/config";

const env = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Variabel lingkungan ${key} tidak didefinisikan.`);
    }
    return value;
};

if (!env("DATABASE_URL")) {
  throw new Error("DATABASE_URL must be defined in the .env file");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  
  datasource: {
    url: env("DATABASE_URL"),
  },
});