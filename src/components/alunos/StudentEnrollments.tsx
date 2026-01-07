import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Trash2, Loader2 } from "lucide-react";
import { useMatriculas, useDeleteMatricula } from "@/hooks/useMatriculas";

interface StudentEnrollmentsProps {
  alunoId: string;
}

export function StudentEnrollments({ alunoId }: StudentEnrollmentsProps) {
  const { data: matriculas, isLoading } = useMatriculas(alunoId);
  const deleteMatriculaMutation = useDeleteMatricula();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!matriculas || matriculas.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Nenhuma matrícula encontrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matriculas.map(matricula => (
        <div key={matricula.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">{matricula.cursos?.nome || "Curso"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(matricula.data_inicio).toLocaleDateString("pt-BR")}
                {matricula.data_fim && ` - ${new Date(matricula.data_fim).toLocaleDateString("pt-BR")}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={matricula.status === "ativo" ? "success" : "outline"}>
              {matricula.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => deleteMatriculaMutation.mutate(matricula.id)}
              disabled={deleteMatriculaMutation.isPending}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
