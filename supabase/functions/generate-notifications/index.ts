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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate and authorize the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === supabaseServiceKey;

    // If not service role (cron), verify user has admin/secretaria role
    if (!isServiceRole) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminCheckClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: isAdmin } = await adminCheckClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      const { data: isSecretaria } = await adminCheckClient.rpc('has_role', { _user_id: user.id, _role: 'secretaria' });
      if (!isAdmin && !isSecretaria) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all admin/secretaria user IDs to send notifications to.
    // In this multi-tenant app, each admin/secretaria user IS their own tenant
    // (data is scoped via owner_user_id = auth.uid()). When the caller is an
    // authenticated user (not cron/service-role), only process that tenant to
    // prevent cross-tenant data leakage.
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "secretaria"]);

    let userIds = [...new Set((adminRoles || []).map((r) => r.user_id))];
    if (!isServiceRole) {
      const callerToken = authHeader.replace("Bearer ", "");
      const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${callerToken}` } },
      });
      const { data: { user: caller } } = await callerClient.auth.getUser();
      userIds = caller ? userIds.filter((id) => id === caller.id) : [];
    }
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ message: "No admin users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const currentDayOfWeek = today.getDay();

    // ============================================================
    // 1. CLEANUP: Delete read notifications older than 3 days
    //    and all notifications older than 14 days
    // ============================================================
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    await supabase
      .from("notificacoes")
      .delete()
      .in("user_id", userIds)
      .eq("lida", true)
      .lt("created_at", threeDaysAgo.toISOString());

    await supabase
      .from("notificacoes")
      .delete()
      .in("user_id", userIds)
      .lt("created_at", fourteenDaysAgo.toISOString());

    // Process each tenant (owner_user_id) independently so notifications never
    // mix data across schools.
    const newNotifications: any[] = [];

    for (const ownerId of userIds) {
      // BIRTHDAYS
      const { data: alunos } = await supabase
        .from("alunos")
        .select("id, nome, data_nascimento, status")
        .eq("owner_user_id", ownerId)
        .eq("status", "ativo")
        .not("data_nascimento", "is", null);

      const tenantNotifs: any[] = [];

      for (const aluno of alunos || []) {
      if (!aluno.data_nascimento) continue;
      const [year, month, day] = aluno.data_nascimento.split("-").map(Number);

      for (let offset = 0; offset <= 3; offset++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + offset);
        const checkDay = checkDate.getDate();
        const checkMonth = checkDate.getMonth() + 1;

        if (day === checkDay && month === checkMonth) {
          const age = today.getFullYear() - year;
          const titulo =
            offset === 0
              ? `🎂 ${aluno.nome} faz ${age} anos hoje!`
              : `🎂 ${aluno.nome} faz ${age} anos em ${offset} dia${offset > 1 ? "s" : ""}`;
          const tipo = offset === 0 ? "sucesso" : "info";

          tenantNotifs.push({
            aluno_id: aluno.id,
            titulo,
            mensagem: offset === 0
              ? "Não esqueça de parabenizar! 🎉"
              : `Aniversário em ${checkDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`,
            tipo,
            link: `/alunos/${aluno.id}`,
            tag: `birthday-${aluno.id}-${todayStr}`,
          });
          break;
        }
      }
      }

      // PAYMENTS
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
      const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

      const { data: pagamentos } = await supabase
        .from("pagamentos")
        .select("id, aluno_id, valor, data_vencimento, status, alunos(nome)")
        .eq("owner_user_id", ownerId)
        .eq("status", "pendente")
        .not("data_vencimento", "is", null)
        .lte("data_vencimento", sevenDaysStr)
        .order("data_vencimento", { ascending: true });

      let overdueCount = 0;
      let dueTodayCount = 0;
      let dueThisWeekCount = 0;

    for (const pag of pagamentos || []) {
      if (!pag.data_vencimento) continue;
      const vencimento = new Date(pag.data_vencimento + "T00:00:00");
      const diffDays = Math.floor((vencimento.getTime() - new Date(todayStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24));
      const alunoNome = (pag.alunos as any)?.nome || "Aluno";

      if (diffDays < 0) overdueCount++;
      else if (diffDays === 0) dueTodayCount++;
      else dueThisWeekCount++;
    }

      if (overdueCount > 0) {
        tenantNotifs.push({
        titulo: `💰 ${overdueCount} pagamento${overdueCount > 1 ? "s" : ""} atrasado${overdueCount > 1 ? "s" : ""}`,
        mensagem: `Existem ${overdueCount} pagamento${overdueCount > 1 ? "s" : ""} com vencimento ultrapassado. Verifique as cobranças.`,
        tipo: "alerta",
        link: "/cobrancas",
        tag: `payments-overdue-${todayStr}`,
      });
    }

      if (dueTodayCount > 0) {
        tenantNotifs.push({
        titulo: `⚠️ ${dueTodayCount} pagamento${dueTodayCount > 1 ? "s" : ""} vence${dueTodayCount > 1 ? "m" : ""} hoje`,
        mensagem: "Fique atento aos vencimentos de hoje.",
        tipo: "alerta",
        link: "/financeiro",
        tag: `payments-today-${todayStr}`,
      });
    }

      if (dueThisWeekCount > 0) {
        tenantNotifs.push({
        titulo: `📋 ${dueThisWeekCount} pagamento${dueThisWeekCount > 1 ? "s" : ""} vence${dueThisWeekCount > 1 ? "m" : ""} esta semana`,
        mensagem: "Pagamentos com vencimento nos próximos dias.",
        tipo: "info",
        link: "/financeiro",
        tag: `payments-week-${todayStr}`,
      });
    }

      // CLASSES TODAY
      const { data: aulasHoje } = await supabase
        .from("aulas")
        .select("id, horario, aluno_id, sala, alunos(nome), cursos(nome)")
        .eq("owner_user_id", ownerId)
        .eq("dia_semana", currentDayOfWeek)
        .eq("status", "ativo");

      if ((aulasHoje?.length || 0) > 0) {
        tenantNotifs.push({
        titulo: `📚 ${aulasHoje!.length} aula${aulasHoje!.length > 1 ? "s" : ""} hoje`,
        mensagem: `Você tem ${aulasHoje!.length} aula${aulasHoje!.length > 1 ? "s" : ""} agendada${aulasHoje!.length > 1 ? "s" : ""} para hoje. Confira a agenda.`,
        tipo: "info",
        link: "/agenda",
        tag: `classes-today-${todayStr}`,
      });
    }

      // ATTENDANCE RISK
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);

      const { data: alunosAtivos } = await supabase
        .from("alunos")
        .select("id, nome")
        .eq("owner_user_id", ownerId)
        .eq("status", "ativo");

      const { data: presencasRecentes } = await supabase
        .from("presencas")
        .select("aluno_id")
        .eq("owner_user_id", ownerId)
        .gte("data", twoWeeksAgo.toISOString().split("T")[0]);

    const alunosComPresenca = new Set((presencasRecentes || []).map((p) => p.aluno_id));
    const alunosSemPresenca = (alunosAtivos || []).filter((a) => !alunosComPresenca.has(a.id));

      if (alunosSemPresenca.length > 0) {
        tenantNotifs.push({
        titulo: `⚡ ${alunosSemPresenca.length} aluno${alunosSemPresenca.length > 1 ? "s" : ""} sem presença recente`,
        mensagem: `${alunosSemPresenca.slice(0, 3).map((a) => a.nome).join(", ")}${alunosSemPresenca.length > 3 ? ` e mais ${alunosSemPresenca.length - 3}` : ""} não tiveram presença nos últimos 14 dias.`,
        tipo: "alerta",
        link: "/alunos",
        tag: `attendance-risk-${todayStr}`,
      });
    }

      // REPOSIÇÕES PENDENTES
      const { data: reposicoesPendentes } = await supabase
        .from("reposicoes")
        .select("id")
        .eq("owner_user_id", ownerId)
        .eq("status", "pendente");

      if ((reposicoesPendentes?.length || 0) > 0) {
        tenantNotifs.push({
        titulo: `🔄 ${reposicoesPendentes!.length} reposição${reposicoesPendentes!.length > 1 ? "ões" : ""} pendente${reposicoesPendentes!.length > 1 ? "s" : ""}`,
        mensagem: "Existem reposições de aula aguardando agendamento.",
        tipo: "info",
        link: "/reposicoes",
        tag: `repo-pending-${todayStr}`,
      });
    }

      // Dedup against existing notifications for this tenant today
      const { data: existingNotifs } = await supabase
        .from("notificacoes")
        .select("titulo")
        .eq("user_id", ownerId)
        .gte("created_at", todayStr + "T00:00:00.000Z");
      const existingTitles = new Set((existingNotifs || []).map((n) => n.titulo));

      for (const notif of tenantNotifs) {
        if (existingTitles.has(notif.titulo)) continue;
        newNotifications.push({
          user_id: ownerId,
          titulo: notif.titulo,
          mensagem: notif.mensagem,
          tipo: notif.tipo,
          link: notif.link || null,
          lida: false,
        });
      }
    }

    if (newNotifications.length > 0) {
      const { error } = await supabase.from("notificacoes").insert(newNotifications);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        message: "Notifications generated",
        created: newNotifications.length,
        tenants: userIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating notifications:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar notificações." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
