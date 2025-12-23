import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar a solicitação de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
