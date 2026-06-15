## Problema

A data de nascimento salva como `2010-10-10` é exibida como `09/10/2010`. Causa: `new Date("2010-10-10").toLocaleDateString("pt-BR")` interpreta a string como UTC meia-noite e, no fuso do Brasil (UTC-3), volta um dia.

Local do bug: `src/pages/AlunoPerfil.tsx:393`
```ts
new Date(aluno.data_nascimento).toLocaleDateString("pt-BR")
```

## Correção

Criar um helper utilitário `formatDateBR(dateStr)` em `src/lib/utils.ts` que faz parse manual de strings `YYYY-MM-DD` (sem usar `new Date(str)` direto), retornando `DD/MM/YYYY` sem deslocamento de fuso.

```ts
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return "";
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return dateStr;
}
```

Substituir o uso em `AlunoPerfil.tsx:393` por `formatDateBR(aluno.data_nascimento)`.

## Verificação adicional

Rodar uma busca rápida por outros `new Date(...).toLocaleDateString` aplicados a campos do tipo `date` puro (nascimento, vencimento, feriado, etc.) e aplicar o mesmo helper apenas onde houver risco de off-by-one. Escopo desta tarefa: garantir que a data de nascimento do aluno apareça correta em todos os pontos onde é renderizada.

Inputs `<input type="date">` não são afetados — eles usam `YYYY-MM-DD` diretamente.
