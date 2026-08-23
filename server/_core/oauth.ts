import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import type { Express, Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import axios from "axios";

import { getUserByOpenId, upsertUser } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

type OAuthState = {
  platform: "mobile" | "web";
  redirectUri?: string;
};

function getServerBaseUrl(req: Request) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol || "http";
  const host = req.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.OAUTH_SERVER_URL!;
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function encodeOAuthState(state: OAuthState) {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

function parseOAuthState(rawState: string | undefined): OAuthState | null {
  if (!rawState) {
    return null;
  }

  if (rawState === "mobile" || rawState === "web") {
    return { platform: rawState };
  }

  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as OAuthState;
    if (parsed.platform === "mobile" || parsed.platform === "web") {
      return parsed;
    }
  } catch (error) {
    console.error("[OAuth] Invalid state payload", error);
  }

  return null;
}

function buildUserResponse(user: Pick<User, "id" | "openId" | "name" | "email" | "loginMethod" | "role" | "lastSignedIn">) {
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

function clearSessionCookie(res: Response, req: Request) {
  const cookieOptions = getSessionCookieOptions(req);

  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.clearCookie(COOKIE_NAME, { path: "/", sameSite: "lax" });
  res.clearCookie(COOKIE_NAME, { path: "/", sameSite: "none", secure: true });
}

function toAndroidIntentUrl(url: string) {
  if (!url.startsWith("exp://")) {
    return null;
  }

  const withoutScheme = url.slice("exp://".length);
  return `intent://${withoutScheme}#Intent;scheme=exp;package=host.exp.exponent;end`;
}

async function syncUser(userInfo: {
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  platform?: string | null;
}) {
  if (!userInfo.openId) {
    throw new Error("openId missing from user info");
  }

  const saved = await upsertUser({
    openId: userInfo.openId,
    name: userInfo.name || null,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? "google",
    lastSignedIn: new Date(),
  });

  return saved ?? (await getUserByOpenId(userInfo.openId));
}

export function registerOAuthRoutes(app: Express) {
  app.get("/auth/google", (req: Request, res: Response) => {
    const isMobile = req.query.mobile === "true";
    const serverBaseUrl = getServerBaseUrl(req);
    const redirectUri = `${serverBaseUrl}/api/oauth/callback`;
    const mobileRedirectUri = getQueryParam(req, "redirectUri");
    const state = encodeOAuthState({
      platform: isMobile ? "mobile" : "web",
      redirectUri: isMobile ? mobileRedirectUri : undefined,
    });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = parseOAuthState(getQueryParam(req, "state"));
    const serverBaseUrl = getServerBaseUrl(req);

    if (!code) {
      return res.status(400).json({ error: "code is required" });
    }

    if (!state) {
      return res.status(400).json({ error: "invalid state" });
    }

    try {
      const params = new URLSearchParams();
      params.append("client_id", process.env.GOOGLE_CLIENT_ID!);
      params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET!);
      params.append("code", code);
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", `${serverBaseUrl}/api/oauth/callback`);

      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = tokenRes.data;
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const googleUser = userRes.data;
      if (!googleUser?.id) {
        throw new Error("Google user ID missing");
      }

      const user = await syncUser({
        openId: googleUser.id,
        name: googleUser.name,
        email: googleUser.email ?? null,
        loginMethod: "google",
      });

      if (!user) {
        throw new Error("Failed to sync OAuth user");
      }

      const sessionToken = await sdk.createSessionToken(user, {
        expiresInMs: ONE_YEAR_MS,
      });

      const isMobile = state.platform === "mobile";
      if (!isMobile) {
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
      }

      if (isMobile) {
        const userBase64 = Buffer.from(JSON.stringify(buildUserResponse(user))).toString("base64");
        const mobileRedirectUri = state.redirectUri || "f3fitness://oauth/callback";
        const callbackUrl =
          `${mobileRedirectUri}?sessionToken=${encodeURIComponent(sessionToken)}&user=${encodeURIComponent(userBase64)}`;
        const androidIntentUrl = toAndroidIntentUrl(callbackUrl);

        return res
          .status(200)
          .type("html")
          .send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Voltando ao app</title>
    <style>
      body { font-family: Arial, sans-serif; background: #111; color: #fff; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
      .card { max-width: 420px; padding: 24px; border-radius: 16px; background: #1b1b1b; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
      a { display: inline-block; margin-top: 16px; padding: 12px 18px; border-radius: 12px; background: #e63946; color: #fff; text-decoration: none; font-weight: 700; }
      p { color: #d1d5db; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Login concluido</h1>
      <p>Estamos tentando voltar para o aplicativo automaticamente.</p>
      <a href="${androidIntentUrl || callbackUrl}">Voltar para o app</a>
    </div>
    <script>
      window.location.replace(${JSON.stringify(callbackUrl)});
      setTimeout(function () {
        window.location.href = ${JSON.stringify(androidIntentUrl || callbackUrl)};
      }, 1200);
    </script>
  </body>
</html>`);
      }

      const frontendUrl =
        process.env.EXPO_WEB_PREVIEW_URL ||
        process.env.EXPO_PACKAGER_PROXY_URL ||
        "http://localhost:8081";

      const userBase64 = Buffer.from(JSON.stringify(buildUserResponse(user))).toString("base64");
      return res.redirect(`${frontendUrl}/oauth/callback?sessionToken=${sessionToken}&user=${userBase64}`);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  app.get("/api/oauth/mobile", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = parseOAuthState(getQueryParam(req, "state"));
    const serverBaseUrl = getServerBaseUrl(req);

    if (!state) {
      return res.status(400).json({ error: "invalid state" });
    }

    if (!code) {
      return res.status(400).json({ error: "code and state are required" });
    }

    try {
      const params = new URLSearchParams();
      params.append("client_id", process.env.GOOGLE_CLIENT_ID!);
      params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET!);
      params.append("code", code);
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", `${serverBaseUrl}/api/oauth/callback`);

      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = tokenRes.data;
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const googleUser = userRes.data;
      if (!googleUser?.id) {
        throw new Error("Google user ID missing");
      }

      const user = await syncUser({
        openId: googleUser.id,
        name: googleUser.name,
        email: googleUser.email ?? null,
        loginMethod: "google",
      });

      if (!user) {
        throw new Error("Failed to sync OAuth user");
      }

      const sessionToken = await sdk.createSessionToken(user, {
        expiresInMs: ONE_YEAR_MS,
      });

      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(user),
      });
    } catch (error) {
      console.error("[OAuth] Mobile exchange failed", error);
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });

  app.post("/api/auth/session", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }

      const token = authHeader.slice("Bearer ".length).trim();
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    clearSessionCookie(res, req);
    res.json({ success: true });
  });

  app.get("/api/auth/logout", async (req: Request, res: Response) => {
    clearSessionCookie(res, req);

    const redirectUrl = getQueryParam(req, "redirect") || "http://localhost:8081";
    res.redirect(redirectUrl);
  });
}
