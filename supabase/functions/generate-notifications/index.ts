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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all admin/secretaria user IDs to send notifications to
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "secretaria"]);

    const userIds = [...new Set((adminRoles || []).map((r) => r.user_id))];
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
      .eq("lida", true)
      .lt("created_at", threeDaysAgo.toISOString());

    await supabase
      .from("notificacoes")
      .delete()
      .lt("created_at", fourteenDaysAgo.toISOString());

    // ============================================================
    // 2. BIRTHDAYS: Today and next 3 days
    // ============================================================
    const { data: alunos } = await supabase
      .from("alunos")
      .select("id, nome, data_nascimento, status")
      .eq("status", "ativo")
      .not("data_nascimento", "is", null);

    const birthdayNotifications: any[] = [];

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

          birthdayNotifications.push({
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

    // ============================================================
    // 3. PAYMENTS: Overdue, due today, due this week
    // ============================================================
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    const { data: pagamentos } = await supabase
      .from("pagamentos")
      .select("id, aluno_id, valor, data_vencimento, status, alunos(nome)")
      .eq("status", "pendente")
      .not("data_vencimento", "is", null)
      .lte("data_vencimento", sevenDaysStr)
      .order("data_vencimento", { ascending: true });

    const paymentNotifications: any[] = [];
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

    // Summary notifications instead of individual ones
    if (overdueCount > 0) {
      paymentNotifications.push({
        titulo: `💰 ${overdueCount} pagamento${overdueCount > 1 ? "s" : ""} atrasado${overdueCount > 1 ? "s" : ""}`,
        mensagem: `Existem ${overdueCount} pagamento${overdueCount > 1 ? "s" : ""} com vencimento ultrapassado. Verifique as cobranças.`,
        tipo: "alerta",
        link: "/cobrancas",
        tag: `payments-overdue-${todayStr}`,
      });
    }

    if (dueTodayCount > 0) {
      paymentNotifications.push({
        titulo: `⚠️ ${dueTodayCount} pagamento${dueTodayCount > 1 ? "s" : ""} vence${dueTodayCount > 1 ? "m" : ""} hoje`,
        mensagem: "Fique atento aos vencimentos de hoje.",
        tipo: "alerta",
        link: "/financeiro",
        tag: `payments-today-${todayStr}`,
      });
    }

    if (dueThisWeekCount > 0) {
      paymentNotifications.push({
        titulo: `📋 ${dueThisWeekCount} pagamento${dueThisWeekCount > 1 ? "s" : ""} vence${dueThisWeekCount > 1 ? "m" : ""} esta semana`,
        mensagem: "Pagamentos com vencimento nos próximos dias.",
        tipo: "info",
        link: "/financeiro",
        tag: `payments-week-${todayStr}`,
      });
    }

    // ============================================================
    // 4. CLASSES TODAY
    // ============================================================
    const { data: aulasHoje } = await supabase
      .from("aulas")
      .select("id, horario, aluno_id, sala, alunos(nome), cursos(nome)")
      .eq("dia_semana", currentDayOfWeek)
      .eq("status", "ativo");

    if ((aulasHoje?.length || 0) > 0) {
      paymentNotifications.push({
        titulo: `📚 ${aulasHoje!.length} aula${aulasHoje!.length > 1 ? "s" : ""} hoje`,
        mensagem: `Você tem ${aulasHoje!.length} aula${aulasHoje!.length > 1 ? "s" : ""} agendada${aulasHoje!.length > 1 ? "s" : ""} para hoje. Confira a agenda.`,
        tipo: "info",
        link: "/agenda",
        tag: `classes-today-${todayStr}`,
      });
    }

    // ============================================================
    // 5. STUDENTS WITH NO RECENT ATTENDANCE (inactive risk)
    // ============================================================
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const { data: alunosAtivos } = await supabase
      .from("alunos")
      .select("id, nome")
      .eq("status", "ativo");

    const { data: presencasRecentes } = await supabase
      .from("presencas")
      .select("aluno_id")
      .gte("data", twoWeeksAgo.toISOString().split("T")[0]);

    const alunosComPresenca = new Set((presencasRecentes || []).map((p) => p.aluno_id));
    const alunosSemPresenca = (alunosAtivos || []).filter((a) => !alunosComPresenca.has(a.id));

    if (alunosSemPresenca.length > 0) {
      paymentNotifications.push({
        titulo: `⚡ ${alunosSemPresenca.length} aluno${alunosSemPresenca.length > 1 ? "s" : ""} sem presença recente`,
        mensagem: `${alunosSemPresenca.slice(0, 3).map((a) => a.nome).join(", ")}${alunosSemPresenca.length > 3 ? ` e mais ${alunosSemPresenca.length - 3}` : ""} não tiveram presença nos últimos 14 dias.`,
        tipo: "alerta",
        link: "/alunos",
        tag: `attendance-risk-${todayStr}`,
      });
    }

    // ============================================================
    // 6. REPOSIÇÕES PENDENTES
    // ============================================================
    const { data: reposicoesPendentes } = await supabase
      .from("reposicoes")
      .select("id")
      .eq("status", "pendente");

    if ((reposicoesPendentes?.length || 0) > 0) {
      paymentNotifications.push({
        titulo: `🔄 ${reposicoesPendentes!.length} reposição${reposicoesPendentes!.length > 1 ? "ões" : ""} pendente${reposicoesPendentes!.length > 1 ? "s" : ""}`,
        mensagem: "Existem reposições de aula aguardando agendamento.",
        tipo: "info",
        link: "/reposicoes",
        tag: `repo-pending-${todayStr}`,
      });
    }

    // ============================================================
    // INSERT NOTIFICATIONS (avoid duplicates by tag)
    // ============================================================
    const allNotifications = [...birthdayNotifications, ...paymentNotifications];

    // Check existing notifications for today to avoid duplicates
    const tags = allNotifications.map((n) => n.tag).filter(Boolean);
    
    const { data: existingNotifs } = await supabase
      .from("notificacoes")
      .select("mensagem, titulo")
      .in("user_id", userIds)
      .gte("created_at", todayStr + "T00:00:00.000Z");

    const existingTitles = new Set((existingNotifs || []).map((n) => n.titulo));

    const newNotifications: any[] = [];
    for (const userId of userIds) {
      for (const notif of allNotifications) {
        if (existingTitles.has(notif.titulo)) continue;
        newNotifications.push({
          user_id: userId,
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
        cleaned: "old notifications removed",
        details: {
          birthdays: birthdayNotifications.length,
          payments: paymentNotifications.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
