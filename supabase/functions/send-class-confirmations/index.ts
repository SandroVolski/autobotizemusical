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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      return new Response(
        JSON.stringify({ error: "Evolution API não configurada. Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current time and 24h window
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const currentDayOfWeek = in24h.getDay(); // 0=Sunday

    // Get all recurring classes that happen on the day 24h from now
    const { data: aulas, error: aulasError } = await supabase
      .from("aulas")
      .select("id, aluno_id, horario, dia_semana, alunos(nome, telefone, responsavel_telefone)")
      .eq("status", "agendada")
      .eq("recorrente", true)
      .eq("dia_semana", currentDayOfWeek);

    if (aulasError) throw aulasError;

    // Get enabled configs
    const { data: configs, error: configsError } = await supabase
      .from("confirmacao_aula_config")
      .select("aluno_id, habilitado, telefone_override")
      .eq("habilitado", true);

    if (configsError) throw configsError;

    const enabledSet = new Map(configs?.map((c: any) => [c.aluno_id, c]) || []);
    let sent = 0;
    let errors = 0;

    for (const aula of (aulas || [])) {
      const config = enabledSet.get(aula.aluno_id);
      if (!config) continue;

      const aluno = aula.alunos as any;
      if (!aluno) continue;

      const telefone = config.telefone_override || aluno.telefone || aluno.responsavel_telefone;
      if (!telefone) continue;

      // Clean phone number
      const cleanPhone = telefone.replace(/\D/g, "");
      if (cleanPhone.length < 10) continue;
      const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

      // Build date for data_aula
      const aulaDate = new Date(in24h);
      if (aula.horario) {
        const [h, m] = aula.horario.split(":");
        aulaDate.setHours(parseInt(h), parseInt(m), 0, 0);
      }

      const horarioFormatado = aula.horario ? aula.horario.substring(0, 5) : "";
      const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const diaNome = diasSemana[currentDayOfWeek];

      const mensagem = `Olá ${aluno.nome}! 🎵\n\nLembramos que você tem aula amanhã (${diaNome}) às ${horarioFormatado}.\n\nVocê confirma presença?\n\n✅ Responda *SIM* para confirmar\n❌ Responda *NÃO* para cancelar`;

      // Check if already sent today for this class
      const today = now.toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("confirmacao_aula_mensagens")
        .select("id")
        .eq("aluno_id", aula.aluno_id)
        .eq("aula_id", aula.id)
        .gte("created_at", `${today}T00:00:00`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Send via Evolution API
      let status = "enviado";
      let erro = null;

      try {
        const response = await fetch(
          `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              number: phoneWithCountry,
              text: mensagem,
            }),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Evolution API [${response.status}]: ${errorBody}`);
        }
        await response.text();
        sent++;
      } catch (e) {
        status = "erro";
        erro = e instanceof Error ? e.message : "Erro desconhecido";
        errors++;
      }

      // Log the message
      await supabase.from("confirmacao_aula_mensagens").insert({
        aluno_id: aula.aluno_id,
        aula_id: aula.id,
        telefone: phoneWithCountry,
        mensagem,
        status,
        data_aula: aulaDate.toISOString(),
        enviado_em: status === "enviado" ? new Date().toISOString() : null,
        erro,
      });
    }

    return new Response(
      JSON.stringify({ success: true, sent, errors, total: aulas?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
