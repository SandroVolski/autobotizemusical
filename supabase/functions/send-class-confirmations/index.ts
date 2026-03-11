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
        JSON.stringify({ error: "Evolution API não configurada." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse optional body params for manual dispatch
    let manualAlunoId: string | null = null;
    let forceManual = false;
    try {
      const body = await req.json();
      manualAlunoId = body?.aluno_id || null;
      forceManual = !!body?.aluno_id || body?.force === true;
    } catch { /* no body = cron call */ }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const currentDayOfWeek = in24h.getDay();

    // 1) Get RECURRING classes for the day 24h from now
    let recurringQuery = supabase
      .from("aulas")
      .select("id, aluno_id, horario, dia_semana, alunos(nome, telefone, responsavel_telefone)")
      .eq("status", "agendada")
      .eq("recorrente", true)
      .eq("dia_semana", currentDayOfWeek);

    if (manualAlunoId) recurringQuery = recurringQuery.eq("aluno_id", manualAlunoId);

    const { data: recurringAulas, error: recurringError } = await recurringQuery;
    if (recurringError) throw recurringError;

    // 2) Get ONE-OFF classes (data_especifica) within next 24h
    const nowISO = now.toISOString().split("T")[0];
    const in24hISO = in24h.toISOString().split("T")[0];
    let oneOffQuery = supabase
      .from("aulas")
      .select("id, aluno_id, horario, dia_semana, data_especifica, alunos(nome, telefone, responsavel_telefone)")
      .eq("status", "agendada")
      .or(`recorrente.eq.false,recorrente.is.null`)
      .gte("data_especifica", nowISO)
      .lte("data_especifica", in24hISO);

    if (manualAlunoId) oneOffQuery = oneOffQuery.eq("aluno_id", manualAlunoId);

    const { data: oneOffAulas, error: oneOffError } = await oneOffQuery;
    if (oneOffError) throw oneOffError;

    // Combine both lists, deduplicating by id
    const allAulas = [...(recurringAulas || []), ...(oneOffAulas || [])];
    const seen = new Set<string>();
    const aulas = allAulas.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    // Get enabled configs (skip this filter for manual sends)
    let configs: any[] = [];
    if (!forceManual) {
      const { data: cfgs, error: configsError } = await supabase
        .from("confirmacao_aula_config")
        .select("aluno_id, habilitado, telefone_override")
        .eq("habilitado", true);
      if (configsError) throw configsError;
      configs = cfgs || [];
    }

    // Get custom message template
    const { data: escolaConfig } = await supabase
      .from("configuracoes_escola")
      .select("mensagem_confirmacao")
      .limit(1)
      .maybeSingle();

    const defaultMsg = `Olá {nome}! 🎵\n\nLembramos que você tem aula amanhã ({dia}) às {horario}.\n\nVocê confirma presença?\n\n✅ Responda *SIM* para confirmar\n❌ Responda *NÃO* para cancelar`;
    const msgTemplate = (escolaConfig as any)?.mensagem_confirmacao || defaultMsg;

    const enabledSet = new Map(configs.map((c: any) => [c.aluno_id, c]));
    let sent = 0;
    let errors = 0;

    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    for (const aula of aulas) {
      const aluno = aula.alunos as any;
      if (!aluno) continue;

      // For manual sends, use aluno's phone directly; for auto, check config
      let telefone: string;
      if (forceManual) {
        telefone = aluno.telefone || aluno.responsavel_telefone || "";
      } else {
        const config = enabledSet.get(aula.aluno_id);
        if (!config) continue;
        telefone = config.telefone_override || aluno.telefone || aluno.responsavel_telefone || "";
      }

      if (!telefone) continue;
      const cleanPhone = telefone.replace(/\D/g, "");
      if (cleanPhone.length < 10) continue;
      const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

      // Determine the actual date of the class
      let aulaDate: Date;
      if (aula.data_especifica) {
        aulaDate = new Date(aula.data_especifica + "T00:00:00");
      } else {
        aulaDate = new Date(in24h);
      }
      
      if (aula.horario) {
        const [h, m] = aula.horario.split(":");
        aulaDate.setHours(parseInt(h), parseInt(m), 0, 0);
      }

      const dayIndex = aula.data_especifica ? new Date(aula.data_especifica).getDay() : currentDayOfWeek;
      const horarioFormatado = aula.horario ? aula.horario.substring(0, 5) : "";
      const diaNome = diasSemana[dayIndex];

      // Build message from template
      const mensagem = msgTemplate
        .replace(/\{nome\}/g, aluno.nome)
        .replace(/\{dia\}/g, diaNome)
        .replace(/\{horario\}/g, horarioFormatado);

      // Check if already sent today for this class (skip for manual force)
      if (!forceManual) {
        const today = now.toISOString().split("T")[0];
        const { data: existing } = await supabase
          .from("confirmacao_aula_mensagens")
          .select("id")
          .eq("aluno_id", aula.aluno_id)
          .eq("aula_id", aula.id)
          .gte("created_at", `${today}T00:00:00`)
          .limit(1);

        if (existing && existing.length > 0) continue;
      }

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
