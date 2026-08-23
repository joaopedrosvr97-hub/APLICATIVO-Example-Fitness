import bcrypt from "bcrypt";
import express from "express";

import { COOKIE_NAME, ONE_YEAR_MS } from "../../../shared/const.js";
import { getSessionCookieOptions } from "../cookies";
import { sdk } from "../sdk";
import { createUser, getUserByEmail, updateUserLastSignedIn } from "../../db";

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createLocalOpenId(email: string) {
  return `local:${normalizeEmail(email)}`;
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

function buildUserResponse(user: {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  lastSignedIn: Date;
}) {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    lastSignedIn: user.lastSignedIn.toISOString(),
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Campos obrigatorios" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email invalido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Email ja cadastrado" });
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await createUser({
      openId: createLocalOpenId(normalizedEmail),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      loginMethod: "local",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    });

    if (!createdUser) {
      return res.status(500).json({ error: "Falha ao criar usuario" });
    }

    const sessionToken = await sdk.createSessionToken(createdUser, {
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    return res.status(201).json({
      message: "Usuario criado com sucesso",
      token: sessionToken,
      user: buildUserResponse(createdUser),
    });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Campos obrigatorios" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await getUserByEmail(normalizedEmail);
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Credenciais invalidas" });
    }

    if (!user || !user.password) {
      return res.status(400).json({ error: "Credenciais invalidas" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Credenciais invalidas" });
    }

    const signedInUser = (await updateUserLastSignedIn(user.id, new Date())) ?? user;
    const sessionToken = await sdk.createSessionToken(signedInUser, {
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    return res.json({
      message: "Login OK",
      token: sessionToken,
      user: buildUserResponse(signedInUser),
    });
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

export default router;
