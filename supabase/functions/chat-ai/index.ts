import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client to validate the user
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Erro de configuração do servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth validation failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Erro de configuração do servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = `Você é um assistente especializado em gestão de escolas de música. 
Você ajuda professores e administradores com:
- Sugestões de repertório para alunos
- Planejamento de aulas
- Dicas de teoria musical
- Gestão pedagógica
- Análise de progresso de alunos
Responda sempre em português brasileiro de forma clara e útil.`;

    if (type === "repertoire") {
      systemPrompt = `Você é um especialista em repertório musical. Sugira músicas apropriadas para o nível do aluno, considerando:
- Nível técnico atual
- Interesses musicais
- Objetivos de aprendizado
- Progressão pedagógica natural

IMPORTANTE: Para CADA música sugerida, você DEVE incluir:
1. **Link para a cifra**: Use o formato https://www.cifraclub.com.br/[artista]/[musica]/ (substitua espaços por hífens e remova acentos)
2. **Link para o YouTube**: Use o formato https://www.youtube.com/results?search_query=[artista]+[musica] (para busca direta)

Formate sua resposta de forma clara e organizada, usando negrito para títulos e listas para organizar as informações.
Responda em português brasileiro.`;
    } else if (type === "lesson-plan") {
      systemPrompt = `Você é um especialista em pedagogia musical. Crie planos de aula detalhados incluindo:
- Objetivos de aprendizado
- Materiais necessários
- Atividades práticas
- Exercícios técnicos
- Métodos de avaliação

IMPORTANTE: Quando você mencionar músicas específicas para praticar, estudar ou como exemplo, SEMPRE inclua:
1. **Link para a cifra**: https://www.cifraclub.com.br/[artista]/[musica]/ (substitua espaços por hífens e remova acentos)
2. **Link para o YouTube**: https://www.youtube.com/results?search_query=[artista]+[musica]

Formate sua resposta de forma clara e organizada.
Responda em português brasileiro.`;
    } else if (type === "exercise-generator") {
      systemPrompt = `Você é um especialista em criação de exercícios musicais. Crie exercícios práticos e progressivos considerando:
- Nível técnico do aluno
- Instrumento específico
- Objetivos de desenvolvimento
- Dificuldade progressiva

IMPORTANTE: Quando você sugerir músicas para praticar os exercícios, treinar técnicas ou como referência, SEMPRE inclua:
1. **Link para a cifra**: https://www.cifraclub.com.br/[artista]/[musica]/ (substitua espaços por hífens e remova acentos)
2. **Link para o YouTube**: https://www.youtube.com/results?search_query=[artista]+[musica]

Formate sua resposta de forma clara e organizada.
Responda em português brasileiro.`;
    } else if (type === "study-plan") {
      systemPrompt = `Você é um especialista em planejamento de estudos musicais. Crie planos de estudo personalizados incluindo:
- Cronograma semanal/mensal
- Metas de curto e longo prazo
- Exercícios técnicos recomendados
- Repertório progressivo

IMPORTANTE: Quando você recomendar músicas para o plano de estudos, seja para treino técnico, repertório ou prática, SEMPRE inclua:
1. **Link para a cifra**: https://www.cifraclub.com.br/[artista]/[musica]/ (substitua espaços por hífens e remova acentos)
2. **Link para o YouTube**: https://www.youtube.com/results?search_query=[artista]+[musica]

Formate sua resposta de forma clara e organizada.
Responda em português brasileiro.`;
    } else if (type === "evasion-analysis") {
      systemPrompt = `Você é um especialista em retenção de alunos em escolas de música. Analise padrões de comportamento e sugira:
- Sinais de risco de evasão
- Estratégias de engajamento
- Ações preventivas
- Melhorias no acompanhamento
Responda em português brasileiro.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta Lovable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Log error details server-side only
      const errorText = await response.text();
      console.error("AI gateway error:", {
        status: response.status,
        error: errorText,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      // Return generic error to client
      return new Response(JSON.stringify({ error: "Erro ao processar a solicitação de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    // Log detailed error server-side only
    console.error("chat-ai error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    // Return generic error to client
    return new Response(JSON.stringify({ error: "Erro ao processar a solicitação de IA" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
