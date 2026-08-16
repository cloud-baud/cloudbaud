import { getStore } from "@netlify/blobs"
import crypto from "crypto"

export default async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 })
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }
  const { email, isTest } = await req.json()
  if (!email) return new Response("email required", { status: 400 })
  const token = crypto.randomBytes(32).toString("hex")
  const store = getStore("finance_invites")
  await store.setJSON(token, {
    email: email.toLowerCase(),
    role: "cpa_external",
    modules: ["finance"],
    path_allowlist: ["/taxes/*", "/documents/*"],
    isTest: !!isTest,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
    used: false
  })
  return Response.json({ 
    email, 
    link: `https://finance.cloudbaud.com/invite/${token}`,
    token 
  })
}
