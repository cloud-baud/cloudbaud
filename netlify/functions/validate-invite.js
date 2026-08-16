import { getStore } from "@netlify/blobs"

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: { "Content-Type": "application/json" } })
  }
  
  try {
    const { token } = await req.json()
    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const store = getStore("finance_invites")
    const invite = await store.get(token, { type: "json" })

    if (!invite) {
      return new Response(JSON.stringify({ error: "Invalid or expired invite", code: "NOT_FOUND" }), { status: 404, headers: { "Content-Type": "application/json" } })
    }

    // Check expiry
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: "Invite expired", code: "EXPIRED", expiresAt: invite.expiresAt }), { status: 410, headers: { "Content-Type": "application/json" } })
    }

    // For non-test invites, check if already used (optional)
    if (invite.used && !invite.isTest) {
      return new Response(JSON.stringify({ error: "Invite already used", code: "USED" }), { status: 410, headers: { "Content-Type": "application/json" } })
    }

    // Return invite data (don't expose internal used flag as critical)
    return new Response(JSON.stringify({
      email: invite.email,
      role: invite.role,
      modules: invite.modules,
      path_allowlist: invite.path_allowlist,
      isTest: invite.isTest,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt
    }), { status: 200, headers: { "Content-Type": "application/json" } })

  } catch (e) {
    console.error("validate-invite error", e)
    return new Response(JSON.stringify({ error: "Server error", details: e.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
