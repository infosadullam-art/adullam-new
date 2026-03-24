import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect(); // Essaie de te connecter à la base de données
    console.log("🚀 Prisma connection successful");
  } catch (error) {
    console.error("❌ Prisma connection failed", error);
  } finally {
    await prisma.$disconnect(); // Ferme la connexion après le test
  }
}

testConnection();
