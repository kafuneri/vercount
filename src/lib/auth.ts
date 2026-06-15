import { betterAuth } from "better-auth";
import { env } from "@/env";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";

// 【加回此函数】检查是否配置了用户管理所需的环境变量
export const isAuthConfigured = () => {
  return !!(env.DATABASE_URL && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.BETTER_AUTH_SECRET);
};

// 移除 Proxy 代理，直接初始化标准的 auth 实例
export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
      overrideUserInfoOnSignIn: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 缓存时间为 300 秒
    },
  },
  plugins: [
    admin(), 
    nextCookies(), 
  ],
  advanced: {
    database: {
      generateId: () => {
        return createId();
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

export const getServerSession = async () => {
  // 如果 auth 未配置，返回 null 而不是抛错
  if (!isAuthConfigured()) {
    return null;
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
};
