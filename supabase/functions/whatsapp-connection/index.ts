import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();
    const apiHeaders = {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    };

    const baseUrl = EVOLUTION_API_URL.replace(/\/$/, "");

    // ACTION: check status
    if (action === "status") {
      try {
        const res = await fetch(
          `${baseUrl}/instance/connectionState/${EVOLUTION_INSTANCE}`,
          { headers: apiHeaders }
        );
        const data = await res.json();
        console.log("Status response:", JSON.stringify(data));
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Status error:", e);
        return new Response(JSON.stringify({ state: "close" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ACTION: connect - delete instance if stuck, then create fresh with QR
    if (action === "connect") {
      // Step 1: Check current state
      let currentState = "unknown";
      try {
        const checkRes = await fetch(
          `${baseUrl}/instance/connectionState/${EVOLUTION_INSTANCE}`,
          { headers: apiHeaders }
        );
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

      // Step 2: If instance exists but not connected, delete it completely
      if (currentState !== "not_found" && currentState !== "unknown") {
        console.log("Deleting stuck instance...");
        try {
          // First try logout
          await fetch(`${baseUrl}/instance/logout/${EVOLUTION_INSTANCE}`, {
            method: "DELETE",
            headers: apiHeaders,
          });
        } catch { /* ignore */ }

        try {
          // Then delete the instance
          await fetch(`${baseUrl}/instance/delete/${EVOLUTION_INSTANCE}`, {
            method: "DELETE",
            headers: apiHeaders,
          });
        } catch { /* ignore */ }

        // Wait for cleanup
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Step 3: Create a fresh instance with QR code enabled
      console.log("Creating fresh instance...");
      const createRes = await fetch(`${baseUrl}/instance/create`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          instanceName: EVOLUTION_INSTANCE,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true,
        }),
      });
      const createData = await createRes.json();
      console.log("Create response:", JSON.stringify(createData));

      // Extract QR from creation response
      let qrCode = null;
      if (createData?.qrcode) {
        if (typeof createData.qrcode === "string") {
          qrCode = createData.qrcode;
        } else if (createData.qrcode.base64) {
          qrCode = createData.qrcode.base64;
        }
      }
      // Some versions return it at top level
      if (!qrCode && createData?.base64) {
        qrCode = createData.base64;
      }

      // If QR not in create response, try connect endpoint
      if (!qrCode) {
        console.log("QR not in create response, trying connect endpoint...");
        await new Promise((r) => setTimeout(r, 1000));
        
        const qrRes = await fetch(
          `${baseUrl}/instance/connect/${EVOLUTION_INSTANCE}`,
          { headers: apiHeaders }
        );
        const qrData = await qrRes.json();
        console.log("Connect response:", JSON.stringify(qrData));
        
        if (qrData?.base64) {
          qrCode = qrData.base64;
        } else if (typeof qrData?.qrcode === "string" && qrData.qrcode.length > 50) {
          qrCode = qrData.qrcode;
        } else if (qrData?.qrcode?.base64) {
          qrCode = qrData.qrcode.base64;
        } else if (qrData?.code && qrData.code.length > 50) {
          qrCode = qrData.code;
        }
      }

      return new Response(
        JSON.stringify({
          qrcode: qrCode,
          pairingCode: createData?.pairingCode || null,
          state: "connecting",
          debug: {
            createKeys: Object.keys(createData || {}),
            hasQr: !!qrCode,
            createDataSample: JSON.stringify(createData).substring(0, 500),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: disconnect / logout
    if (action === "disconnect") {
      try {
        await fetch(`${baseUrl}/instance/logout/${EVOLUTION_INSTANCE}`, {
          method: "DELETE",
          headers: apiHeaders,
        });
      } catch { /* ignore */ }
      
      try {
        await fetch(`${baseUrl}/instance/delete/${EVOLUTION_INSTANCE}`, {
          method: "DELETE",
          headers: apiHeaders,
        });
      } catch { /* ignore */ }

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
