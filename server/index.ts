import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("🔥 INICIANDO SERVIDOR...");
    console.log("✅ Conectado com sucesso ao PostgreSQL");
    client.release();
  } catch (error) {
    console.error("❌ Erro ao conectar:", error);
  }
}

testConnection();