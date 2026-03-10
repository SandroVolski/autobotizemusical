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
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      return new Response(
        JSON.stringify({ error: "Evolution API não configurada." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify auth
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();
    const headers = {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    };

    // ACTION: check status
    if (action === "status") {
      const res = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
        { headers }
      );
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: create instance if not exists, then get QR
    if (action === "connect") {
      // Try to fetch instance info first
      const checkRes = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
        { headers }
      );
      const checkData = await checkRes.json();

      // If instance doesn't exist, create it
      if (!checkRes.ok || checkData?.error) {
        const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            instanceName: EVOLUTION_INSTANCE,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
          }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          return new Response(
            JSON.stringify({ error: "Erro ao criar instância", details: createData }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Return QR from creation response
        if (createData?.qrcode) {
          return new Response(
            JSON.stringify({ qrcode: createData.qrcode.base64 || createData.qrcode, state: "connecting" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // If already open (connected)
      if (checkData?.state === "open" || checkData?.instance?.state === "open") {
        return new Response(
          JSON.stringify({ state: "open", message: "WhatsApp já conectado!" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If stuck in "connecting" state, logout first to get a fresh QR
      const currentState = checkData?.state || checkData?.instance?.state;
      if (currentState === "connecting" || currentState === "close") {
        // Logout/restart to force a new QR code
        await fetch(
          `${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`,
          { method: "DELETE", headers }
        );
        // Small delay to let it process
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Get fresh QR code
      const qrRes = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`,
        { headers }
      );
      const qrData = await qrRes.json();

      const qrcode = qrData?.base64 || qrData?.qrcode?.base64 || qrData?.qrcode || qrData?.code || null;

      // If still null, try to extract from nested structures
      let finalQr = null;
      if (typeof qrcode === 'string' && qrcode.length > 50) {
        finalQr = qrcode;
      } else if (qrData?.qrcode && typeof qrData.qrcode === 'object') {
        finalQr = qrData.qrcode.base64 || qrData.qrcode.code || null;
      }

      return new Response(
        JSON.stringify({
          qrcode: finalQr,
          pairingCode: qrData?.pairingCode || null,
          state: "connecting",
          debug: { keys: Object.keys(qrData || {}), hasQr: !!finalQr },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: disconnect / logout
    if (action === "disconnect") {
      const res = await fetch(
        `${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`,
        { method: "DELETE", headers }
      );
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data }), {
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
