import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../server/db", () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  updateUserLastSignedIn: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("../server/_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn(),
    authenticateRequest: vi.fn(),
  },
}));

import { createUser, getUserByEmail, updateUserLastSignedIn } from "../server/db";
import { registerOAuthRoutes } from "../server/_core/oauth";
import authRoutes from "../server/_core/routes/auth";
import { sdk } from "../server/_core/sdk";
import { COOKIE_NAME } from "../shared/const";

type TestUser = {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  password: string | null;
  loginMethod: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

const createUserMock = vi.mocked(createUser);
const getUserByEmailMock = vi.mocked(getUserByEmail);
const updateUserLastSignedInMock = vi.mocked(updateUserLastSignedIn);
const createSessionTokenMock = vi.mocked(sdk.createSessionToken);
const authenticateRequestMock = vi.mocked(sdk.authenticateRequest);

function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  const now = new Date("2026-03-21T18:00:00.000Z");
  return {
    id: 1,
    openId: "local:sample@example.com",
    name: "Sample User",
    email: "sample@example.com",
    password: "$2b$10$xRr1Kf3sA6vT7sI0Y9I5Mub1L5V2M0d.1H8M2do7iN6x8kz0QWJZy",
    loginMethod: "local",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    ...overrides,
  };
}

async function startTestServer() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  registerOAuthRoutes(app);

  const server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function stopTestServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("register", () => {
    it("creates a local user, returns a token, and sets the session cookie", async () => {
      const createdUser = makeUser();
      getUserByEmailMock.mockResolvedValueOnce(null as never);
      createUserMock.mockResolvedValueOnce(createdUser);
      createSessionTokenMock.mockResolvedValueOnce("jwt-register-token");

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Sample User",
            email: "Sample@Example.com",
            password: "Senha123!",
          }),
        });

        expect(response.status).toBe(201);
        expect(getUserByEmailMock).toHaveBeenCalledWith("sample@example.com");
        expect(createUserMock).toHaveBeenCalledTimes(1);

        const createUserArg = createUserMock.mock.calls[0]?.[0];
        expect(createUserArg).toMatchObject({
          openId: "local:sample@example.com",
          name: "Sample User",
          email: "sample@example.com",
          loginMethod: "local",
          role: "user",
        });
        expect(createUserArg?.password).toEqual(expect.any(String));
        expect(createUserArg?.password).not.toBe("Senha123!");

        const body = await response.json();
        expect(body).toMatchObject({
          message: "Usuario criado com sucesso",
          token: "jwt-register-token",
          user: {
            id: createdUser.id,
            openId: createdUser.openId,
            email: createdUser.email,
          },
        });

        const setCookie = response.headers.get("set-cookie");
        expect(setCookie).toContain(`${COOKIE_NAME}=jwt-register-token`);
      } finally {
        await stopTestServer(server);
      }
    });

    it("rejects duplicate email with 400", async () => {
      getUserByEmailMock.mockResolvedValueOnce(makeUser());

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Sample User",
            email: "sample@example.com",
            password: "Senha123!",
          }),
        });

        expect(response.status).toBe(400);
        expect(createUserMock).not.toHaveBeenCalled();
        expect(createSessionTokenMock).not.toHaveBeenCalled();

        const body = await response.json();
        expect(body).toEqual({ error: "Email ja cadastrado" });
      } finally {
        await stopTestServer(server);
      }
    });
  });

  describe("login", () => {
    it("returns a token, updates last sign-in, and sets the session cookie", async () => {
      const existingUser = makeUser({
        password: await import("bcrypt").then((bcrypt) => bcrypt.hash("Senha123!", 10)),
      });
      const updatedUser = makeUser({
        lastSignedIn: new Date("2026-03-21T19:00:00.000Z"),
        password: existingUser.password,
      });

      getUserByEmailMock.mockResolvedValueOnce(existingUser);
      updateUserLastSignedInMock.mockResolvedValueOnce(updatedUser);
      createSessionTokenMock.mockResolvedValueOnce("jwt-login-token");

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "sample@example.com",
            password: "Senha123!",
          }),
        });

        expect(response.status).toBe(200);
        expect(getUserByEmailMock).toHaveBeenCalledWith("sample@example.com");
        expect(updateUserLastSignedInMock).toHaveBeenCalledTimes(1);
        expect(updateUserLastSignedInMock.mock.calls[0]?.[0]).toBe(existingUser.id);
        expect(createSessionTokenMock).toHaveBeenCalledWith(updatedUser, {
          expiresInMs: expect.any(Number),
        });

        const body = await response.json();
        expect(body).toMatchObject({
          message: "Login OK",
          token: "jwt-login-token",
          user: {
            id: updatedUser.id,
            openId: updatedUser.openId,
            email: updatedUser.email,
          },
        });

        const setCookie = response.headers.get("set-cookie");
        expect(setCookie).toContain(`${COOKIE_NAME}=jwt-login-token`);
      } finally {
        await stopTestServer(server);
      }
    });

    it("rejects invalid password with 400", async () => {
      const existingUser = makeUser({
        password: await import("bcrypt").then((bcrypt) => bcrypt.hash("Senha123!", 10)),
      });
      getUserByEmailMock.mockResolvedValueOnce(existingUser);

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "sample@example.com",
            password: "SenhaErrada!",
          }),
        });

        expect(response.status).toBe(400);
        expect(updateUserLastSignedInMock).not.toHaveBeenCalled();
        expect(createSessionTokenMock).not.toHaveBeenCalled();

        const body = await response.json();
        expect(body).toEqual({ error: "Credenciais invalidas" });
      } finally {
        await stopTestServer(server);
      }
    });

    it("rejects unknown email without disclosing whether the account exists", async () => {
      getUserByEmailMock.mockResolvedValueOnce(null as never);

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unknown@example.com",
            password: "Senha123!",
          }),
        });

        expect(response.status).toBe(400);
        expect(updateUserLastSignedInMock).not.toHaveBeenCalled();
        expect(createSessionTokenMock).not.toHaveBeenCalled();

        const body = await response.json();
        expect(body).toEqual({ error: "Credenciais invalidas" });
      } finally {
        await stopTestServer(server);
      }
    });
  });

  describe("me", () => {
    it("returns the authenticated user payload", async () => {
      const authenticatedUser = makeUser({
        id: 9,
        openId: "local:me@example.com",
        email: "me@example.com",
      });
      authenticateRequestMock.mockResolvedValueOnce(authenticatedUser);

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            Authorization: "Bearer test-token",
          },
        });

        expect(response.status).toBe(200);
        expect(authenticateRequestMock).toHaveBeenCalledTimes(1);

        const body = await response.json();
        expect(body).toEqual({
          user: {
            id: authenticatedUser.id,
            openId: authenticatedUser.openId,
            name: authenticatedUser.name,
            email: authenticatedUser.email,
            loginMethod: authenticatedUser.loginMethod,
            role: authenticatedUser.role,
            lastSignedIn: authenticatedUser.lastSignedIn.toISOString(),
          },
        });
      } finally {
        await stopTestServer(server);
      }
    });

    it("returns 401 when the request is unauthenticated", async () => {
      authenticateRequestMock.mockRejectedValueOnce(new Error("Invalid session"));

      const { server, baseUrl } = await startTestServer();

      try {
        const response = await fetch(`${baseUrl}/api/auth/me`);

        expect(response.status).toBe(401);

        const body = await response.json();
        expect(body).toEqual({ error: "Unauthorized" });
      } finally {
        await stopTestServer(server);
      }
    });
  });
});
