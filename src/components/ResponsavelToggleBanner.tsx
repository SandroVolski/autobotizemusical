import { UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useConfiguracoes, useUpdateConfiguracoes } from "@/hooks/useConfiguracoes";

export function ResponsavelToggleBanner() {
  const { data: config } = useConfiguracoes();
  const updateConfig = useUpdateConfiguracoes();
  const enabled = (config as any)?.usar_responsavel_whatsapp !== false;

  const handleToggle = (value: boolean) => {
    updateConfig.mutate({ usar_responsavel_whatsapp: value } as any);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-primary/15 flex-shrink-0">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Enviar para o responsável quando houver</p>
            <p className="text-xs text-muted-foreground">
              Quando ativado, alunos com responsável cadastrado recebem as mensagens automáticas no telefone do responsável.
              Alunos sem responsável continuam recebendo direto.
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={updateConfig.isPending} />
      </CardContent>
    </Card>
  );
}