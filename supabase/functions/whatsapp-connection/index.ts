import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function extractQr(data: any): Promise<string | null> {
  if (!data) return null;
  if (typeof data === "string" && data.length > 50) return data;
  if (typeof data.base64 === "string" && data.base64.length > 50) return data.base64;
  if (typeof data.qrcode === "string" && data.qrcode.length > 50) return data.qrcode;
  if (data.qrcode?.base64 && typeof data.qrcode.base64 === "string") return data.qrcode.base64;
  if (typeof data.code === "string" && data.code.length > 50) return data.code;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      return new Response(
        JSON.stringify({ error: "Evolution API não configurada." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Require admin or secretaria role
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roles } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "secretaria"]);
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, phone, message } = body;
    const apiHeaders = {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    };
    const baseUrl = EVOLUTION_API_URL.replace(/\/$/, "");

    if (action === "status") {
      try {
        const res = await fetch(`${baseUrl}/instance/connectionState/${EVOLUTION_INSTANCE}`, { headers: apiHeaders });
        const data = await res.json();
        console.log("Status response:", JSON.stringify(data));
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ state: "close" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "connect") {
      // Step 1: Check current state
      let currentState = "unknown";
      try {
        const checkRes = await fetch(`${baseUrl}/instance/connectionState/${EVOLUTION_INSTANCE}`, { headers: apiHeaders });
        const checkData = await checkRes.json();
        console.log("Check state:", JSON.stringify(checkData));
        currentState = checkData?.state || checkData?.instance?.state || "unknown";
        
        if (currentState === "open") {
          return new Response(
            JSON.stringify({ state: "open", message: "WhatsApp já conectado!" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        currentState = "not_found";
      }

      // Step 2: Delete existing instance completely
      console.log("Cleaning up instance, current state:", currentState);
      try { await fetch(`${baseUrl}/instance/logout/${EVOLUTION_INSTANCE}`, { method: "DELETE", headers: apiHeaders }); } catch {}
      await new Promise((r) => setTimeout(r, 1000));
      try { await fetch(`${baseUrl}/instance/delete/${EVOLUTION_INSTANCE}`, { method: "DELETE", headers: apiHeaders }); } catch {}
      await new Promise((r) => setTimeout(r, 2000));

      // Step 3: Create fresh instance with webhook
      console.log("Creating fresh instance...");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_ANON_KEY_VAL = Deno.env.get("SUPABASE_ANON_KEY")!;
      const webhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
      console.log("Webhook URL:", webhookUrl);
      
      const createRes = await fetch(`${baseUrl}/instance/create`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          instanceName: EVOLUTION_INSTANCE,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true,
          webhook: {
            url: webhookUrl,
            byEvents: false,
            base64: false,
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            events: ["MESSAGES_UPSERT"],
          },
        }),
      });
      const createData = await createRes.json();
      console.log("Create response:", JSON.stringify(createData));

      let qrCode = await extractQr(createData);

      // Step 4: Poll the connect endpoint up to 5 times with increasing delays
      if (!qrCode) {
        for (let attempt = 1; attempt <= 5; attempt++) {
          const delay = attempt * 2000; // 2s, 4s, 6s, 8s, 10s
          console.log(`QR poll attempt ${attempt}, waiting ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));

          try {
            const qrRes = await fetch(`${baseUrl}/instance/connect/${EVOLUTION_INSTANCE}`, { headers: apiHeaders });
            const qrData = await qrRes.json();
            console.log(`Connect attempt ${attempt} response:`, JSON.stringify(qrData));
            
            qrCode = await extractQr(qrData);
            if (qrCode) {
              console.log(`QR code found on attempt ${attempt}!`);
              break;
            }
          } catch (e) {
            console.error(`Connect attempt ${attempt} error:`, e);
          }
        }
      }

      return new Response(
        JSON.stringify({
          qrcode: qrCode,
          state: qrCode ? "connecting" : "error",
          message: qrCode ? null : "Não foi possível gerar o QR Code. A Evolution API pode estar indisponível. Tente novamente.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send") {
      if (!phone || !message) {
        return new Response(JSON.stringify({ error: "phone e message são obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sendRes = await fetch(`${baseUrl}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({ number: phone, text: message }),
      });
      const sendData = await sendRes.json();
      console.log("Send response:", JSON.stringify(sendData));
      if (!sendRes.ok) {
        return new Response(JSON.stringify({ error: sendData?.message || "Erro ao enviar mensagem" }), {
          status: sendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, data: sendData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      try { await fetch(`${baseUrl}/instance/logout/${EVOLUTION_INSTANCE}`, { method: "DELETE", headers: apiHeaders }); } catch {}
      try { await fetch(`${baseUrl}/instance/delete/${EVOLUTION_INSTANCE}`, { method: "DELETE", headers: apiHeaders }); } catch {}
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use: status, connect, disconnect" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
