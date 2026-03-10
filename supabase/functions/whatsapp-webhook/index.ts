import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).substring(0, 500));

    // Evolution API sends different event types
    const event = body.event || body.type;
    
    // We only care about incoming messages
    if (event !== "messages.upsert" && event !== "MESSAGES_UPSERT") {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract message data - Evolution API v2 format
    const messageData = body.data || body;
    const message = messageData.message || messageData;
    
    // Get the text content
    const text = (
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      message.body ||
      messageData.body ||
      ""
    ).trim().toLowerCase();

    if (!text) {
      return new Response(JSON.stringify({ ok: true, no_text: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sender phone - remove @s.whatsapp.net suffix
    const remoteJid = message.key?.remoteJid || messageData.key?.remoteJid || "";
    const senderPhone = remoteJid.replace("@s.whatsapp.net", "").replace("@c.us", "");
    
    if (!senderPhone || senderPhone.includes("@g.us")) {
      // Ignore group messages
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

    console.log(`Message from ${senderPhone}: "${text}"`);

    // Check if message is a confirmation response
    const isConfirm = ["sim", "s", "confirmo", "yes", "ok", "vou", "estarei"].some(w => text === w || text.startsWith(w));
    const isCancel = ["nao", "não", "n", "no", "cancelo", "cancelar", "nope"].some(w => text === w || text.startsWith(w));

    if (!isConfirm && !isCancel) {
      console.log("Message is not a confirmation response, ignoring");
      return new Response(JSON.stringify({ ok: true, ignored: "not_confirmation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = isConfirm ? "confirmado" : "cancelado";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the most recent pending/sent message for this phone number
    // The phone might have or not have the country code prefix
    const phoneVariants = [senderPhone];
    if (senderPhone.startsWith("55")) {
      phoneVariants.push(senderPhone.substring(2));
    } else {
      phoneVariants.push(`55${senderPhone}`);
    }

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
        console.error("Error querying messages:", error);
        continue;
      }

      if (msgs && msgs.length > 0) {
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
      console.log(`No pending message found for phone: ${senderPhone}`);
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
