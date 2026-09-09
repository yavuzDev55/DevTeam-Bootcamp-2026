import { defineConfig } from "prisma/config";

// npx prisma komutunu Prisma kendi süreci olarak başlatır; ona --env-file
// geçiremeyiz, o yüzden .env'i burada kendimiz okuyoruz.
//
// Dosya henüz yoksa sessizce geçiyoruz — böylece hata "config yüklenemedi"
// diye değil, Prisma'nın kendi "DATABASE_URL gerekli" mesajıyla gelir.
try {
  process.loadEnvFile(".env");
} catch {
  // .env yok; DATABASE_URL ortamdan gelebilir ya da hiç gelmeyebilir
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL },
});
