import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate all possible Brazilian phone variants for matching
function getPhoneVariants(phone: string): string[] {
  // Remove all non-digits
  const clean = phone.replace(/\D/g, "");
  const variants = new Set<string>();
  variants.add(clean);

  // Strip country code if present
  let national = clean;
  if (clean.startsWith("55") && clean.length >= 12) {
    national = clean.substring(2);
  }
  const withCountry = national.startsWith("55") ? national : `55${national}`;
  variants.add(national);
  variants.add(withCountry);

  // Brazilian mobile numbers: toggle the 9th digit
  // Format: DD + 9 + XXXXXXXX (9 digits) or DD + XXXXXXXX (8 digits)
  if (national.length === 11 && national[2] === "9") {
    // Has the 9 → remove it
    const without9 = national.substring(0, 2) + national.substring(3);
    variants.add(without9);
    variants.add(`55${without9}`);
  } else if (national.length === 10) {
    // Missing the 9 → add it
    const with9 = national.substring(0, 2) + "9" + national.substring(2);
    variants.add(with9);
    variants.add(`55${with9}`);
  }

  return Array.from(variants);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook authenticity via API key header
    const webhookApiKey = req.headers.get("apikey");
    const expectedKey = Deno.env.get("EVOLUTION_API_KEY");
    if (!webhookApiKey || webhookApiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).substring(0, 1000));

    // Evolution API sends different event types
    const event = body.event || body.type;
    
    if (event !== "messages.upsert" && event !== "MESSAGES_UPSERT") {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageData = body.data || body;
    const message = messageData.message || messageData;
    
    // Extract text - try multiple paths from Evolution API payload
    const text = (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      message.body ||
      messageData.body ||
      messageData.message?.conversation ||
      messageData.message?.extendedTextMessage?.text ||
      ""
    ).trim().toLowerCase();

    console.log("Extracted text:", JSON.stringify(text));

    if (!text) {
      return new Response(JSON.stringify({ ok: true, no_text: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sender phone
    const remoteJid = message.key?.remoteJid || messageData.key?.remoteJid || "";
    const senderPhone = remoteJid.replace("@s.whatsapp.net", "").replace("@c.us", "");
    
    console.log("Sender phone:", senderPhone, "Remote JID:", remoteJid);

    if (!senderPhone || senderPhone.includes("@g.us") || remoteJid.includes("@g.us")) {
      return new Response(JSON.stringify({ ok: true, ignored: "group" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only process if it's from the user (not from us)
    const fromMe = message.key?.fromMe || messageData.key?.fromMe || false;
    if (fromMe) {
      return new Response(JSON.stringify({ ok: true, ignored: "from_me" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if message is a confirmation response
    const isConfirm = ["sim", "s", "confirmo", "yes", "ok", "vou", "estarei"].some(w => text === w || text.startsWith(w));
    const isCancel = ["nao", "não", "n", "no", "cancelo", "cancelar", "nope"].some(w => text === w || text.startsWith(w));

    console.log("isConfirm:", isConfirm, "isCancel:", isCancel);

    if (!isConfirm && !isCancel) {
      return new Response(JSON.stringify({ ok: true, ignored: "not_confirmation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = isConfirm ? "confirmado" : "cancelado";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate all phone variants for matching
    const phoneVariants = getPhoneVariants(senderPhone);
    console.log("Phone variants to search:", JSON.stringify(phoneVariants));

    let updated = false;
    for (const phone of phoneVariants) {
      const { data: msgs, error } = await supabase
        .from("confirmacao_aula_mensagens")
        .select("id")
        .eq("telefone", phone)
        .in("status", ["enviado", "pendente"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error querying messages for phone", phone, ":", error);
        continue;
      }

      if (msgs && msgs.length > 0) {
        console.log("Found message:", msgs[0].id, "for phone:", phone);
        const { error: updateError } = await supabase
          .from("confirmacao_aula_mensagens")
          .update({
            status: newStatus,
            resposta_aluno: text,
            respondido_em: new Date().toISOString(),
          })
          .eq("id", msgs[0].id);

        if (updateError) {
          console.error("Error updating message:", updateError);
        } else {
          console.log(`Updated message ${msgs[0].id} to status: ${newStatus}`);
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      console.log(`No pending message found for any variant of phone: ${senderPhone}`);
    }

    return new Response(JSON.stringify({ ok: true, updated, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
