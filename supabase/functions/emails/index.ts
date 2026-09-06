import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { Resend } from "https://esm.sh/resend@4.0.0"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}

const OWNER_MAP: Record<string, string> = {
  "david@cloudbaud.com": "David",
  "madhuban@cloudbaud.com": "Madhuban",
  "manash@cloudbaud.com": "Manash",
  "deepika@cloudbaud.com": "Deepika",
  "suhavi@cloudbaud.com": "Suhavi",
  "team@cloudbaud.com": "SHARED",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors })
  }

  const url = new URL(req.url)
  const action = url.pathname.split("/").pop() || ""

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  const resend = new Resend(Deno.env.get("RESEND_API_KEY")!)

  try {
    // 1. INBOUND WEBHOOK - Resend -> saas.inbox_emails (lean)
    if (action === "inbound") {
      const payload = await req.json()
      const d = payload.data || payload
      const toRaw = Array.isArray(d.to)? d.to[0] : d.to || ""
      const to = String(toRaw).toLowerCase()
      const owner = OWNER_MAP[to] || null
      const scope = owner && owner!== "SHARED"? "personal" : "shared"

      const { error } = await supabase.schema("saas").from("inbox_emails").insert({
        owner,
        scope,
        from_email: d.from || d.from_email || "",
        to_email: Array.isArray(d.to)? d.to : [d.to].filter(Boolean),
        subject: d.subject || "(no subject)",
        snippet: (d.text || d.html || "").toString().slice(0, 200),
        resend_id: d.email_id || d.id || d.message_id || null,
      })

      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), { headers: cors })
    }

    // 2. LIST - received from saas + sent from Resend
    if (action === "list") {
      const owner = url.searchParams.get("owner")
      const type = url.searchParams.get("type") || "all"
      let all: any[] = []

      if (type === "all" || type === "inbox") {
        let q = supabase.schema("saas").from("inbox_emails").select("*").order("received_at", { ascending: false }).limit(100)
        if (owner === "SHARED") q = q.eq("scope", "shared")
        else if (owner) q = q.eq("owner", owner)
        const { data } = await q
        all.push(...(data || []).map((r: any) => ({
         ...r,
          direction: "inbound",
          date: r.received_at,
        })))
      }

      if (type === "all" || type === "sent") {
        const sent = await resend.emails.list({ limit: 100 })
        let list = (sent.data?.data || []) as any[]
        if (owner && owner!== "SHARED") {
          list = list.filter((s) => s.from?.toLowerCase().includes(owner.toLowerCase()))
        }
        all.push(...list.map((s: any) => ({
         ...s,
          direction: "outbound",
          date: s.created_at,
          resend_id: s.id,
          subject: s.subject,
          from_email: s.from,
          to_email: s.to,
        })))
      }

      all.sort((a, b) => +new Date(b.date) - +new Date(a.date))
      return new Response(JSON.stringify({ emails: all }), { headers: cors })
    }

    // 3. GET - full body from Resend on open
    if (action === "get") {
      const { id } = await req.json()
      const { data, error } = await resend.emails.get(id)
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: cors })
    }

    // 4. SEND
    if (action === "send") {
      const { to, subject, html, from } = await req.json()
      const { data, error } = await resend.emails.send({
        from: from || "Team Cloudbaud <team@cloudbaud.com>",
        to,
        subject,
        html,
      })
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: cors })
    }

    return new Response(JSON.stringify({ error: `unknown action: ${action}` }), { status: 404, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors })
  }
})