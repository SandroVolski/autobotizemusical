import { useState, useEffect } from "react";
import { Loader2, Check, X, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePresencasPorAula, useBulkCreatePresencas } from "@/hooks/usePresencas";
import type { Aula } from "@/hooks/useAulas";

interface AttendanceDialogProps {
  aula: Aula | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
}

type AttendanceStatus = "presente" | "falta" | "justificada";

interface AttendanceRecord {
  aluno_id: string;
  aula_id: string;
  data: string;
  status: AttendanceStatus;
  observacoes: string;
}

const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; variant: "success" | "destructive" | "warning" }> = {
  presente: { label: "Presente", icon: <Check className="w-4 h-4" />, variant: "success" },
  falta: { label: "Falta", icon: <X className="w-4 h-4" />, variant: "destructive" },
  justificada: { label: "Justificada", icon: <AlertCircle className="w-4 h-4" />, variant: "warning" },
};

export function AttendanceDialog({ aula, open, onOpenChange, date }: AttendanceDialogProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  
  const { data: existingPresencas, isLoading } = usePresencasPorAula(aula?.id, date);
  const bulkCreateMutation = useBulkCreatePresencas();

  useEffect(() => {
    if (aula?.aluno_id && open) {
      const existing = existingPresencas?.find(p => p.aluno_id === aula.aluno_id);
      setAttendance({
        aluno_id: aula.aluno_id,
        aula_id: aula.id,
        data: date,
        status: (existing?.status as AttendanceStatus) || "presente",
        observacoes: existing?.observacoes || "",
      });
    }
  }, [aula, existingPresencas, date, open]);

  const handleStatusChange = (status: AttendanceStatus) => {
    if (attendance) {
      setAttendance({ ...attendance, status });
    }
  };

  const handleSave = () => {
    if (attendance) {
      bulkCreateMutation.mutate([attendance], {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  if (!aula) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Registrar Presença
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Aula Info */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Aula</p>
              <p className="font-medium">{aula.cursos?.nome || "Sem curso"} - {aula.horario}</p>
              <p className="text-sm text-muted-foreground mt-1">Data: {new Date(date).toLocaleDateString("pt-BR")}</p>
            </div>

            {/* Student */}
            {aula.aluno_id ? (
              <>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Aluno</p>
                  <p className="font-medium">{aula.alunos?.nome}</p>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <Label>Status da Presença</Label>
                  <div className="flex gap-2">
                    {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                      const config = statusConfig[status];
                      const isActive = attendance?.status === status;
                      return (
                        <Button
                          key={status}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          className={`flex-1 gap-2 ${isActive ? "" : "text-muted-foreground"}`}
                          onClick={() => handleStatusChange(status)}
                        >
                          {config.icon}
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    placeholder="Ex: Aluno chegou atrasado..."
                    value={attendance?.observacoes || ""}
                    onChange={(e) => setAttendance(prev => prev ? { ...prev, observacoes: e.target.value } : null)}
                  />
                </div>

                {/* Save Button */}
                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={bulkCreateMutation.isPending}
                >
                  {bulkCreateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar Presença
                </Button>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Esta aula não possui aluno vinculado.</p>
                <p className="text-sm">Vincule um aluno para registrar presença.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
