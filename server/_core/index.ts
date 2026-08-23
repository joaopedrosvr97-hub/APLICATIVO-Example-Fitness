import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { Pool } from "pg";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import authRoutes from "./routes/auth";

// ===============================
// 🔌 DATABASE TEST (POSTGRES)
// ===============================
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("🚀 Iniciando servidor...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await pool.connect();
    console.log("✅ Conectado com sucesso ao PostgreSQL");
  } catch (error) {
    console.error("❌ Erro ao conectar no banco:", error);
  }
}

// ===============================
// PORT UTILS
// ===============================
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ===============================
// SERVER
// ===============================
async function startServer() {
  await testConnection(); // 🔥 testa banco antes de subir servidor

  const app = express();
  const server = createServer(app);

  // ===============================
  // CORS
  // ===============================
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  // ===============================
  // BODY PARSER
  // ===============================
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ===============================
  // ROTAS
  // ===============================
  registerOAuthRoutes(app);

  // 🔐 AUTH (login/register)
  app.use("/auth", authRoutes);

  // ❤️ HEALTH CHECK
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // ⚡ TRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ===============================
  // START SERVER
  // ===============================
  const preferredPort = 3000;
  let port = parseInt(process.env.PORT || "3000");

  if (!(await isPortAvailable(port))) {
    port = await findAvailablePort(preferredPort);
    console.log(`⚠️ Porta ${preferredPort} ocupada. Usando ${port}`);
  }

  server.listen(port, () => {
    console.log(`🌐 API rodando em http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Erro ao iniciar servidor:", err);
});