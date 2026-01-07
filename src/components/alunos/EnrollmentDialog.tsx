import { useState } from "react";
import { Loader2, GraduationCap, BookOpen, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCursos } from "@/hooks/useCursos";
import { useCreateMatricula } from "@/hooks/useMatriculas";

interface EnrollmentDialogProps {
  alunoId: string;
  alunoNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollmentDialog({ alunoId, alunoNome, open, onOpenChange }: EnrollmentDialogProps) {
  const [cursoId, setCursoId] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: cursos, isLoading: cursosLoading } = useCursos();
  const createMatriculaMutation = useCreateMatricula();

  const handleSubmit = () => {
    if (!cursoId) return;

    createMatriculaMutation.mutate({
      aluno_id: alunoId,
      curso_id: cursoId,
      data_inicio: dataInicio,
      data_fim: dataFim || undefined,
      observacoes: observacoes || undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setCursoId("");
    setDataInicio(new Date().toISOString().split("T")[0]);
    setDataFim("");
    setObservacoes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Matricular Aluno em Curso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Student Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Aluno</p>
            <p className="font-medium">{alunoNome}</p>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Curso *</Label>
            <Select value={cursoId} onValueChange={setCursoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {cursosLoading ? (
                  <div className="p-2 text-center">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  cursos?.filter(c => c.status === "ativo").map(curso => (
                    <SelectItem key={curso.id} value={curso.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {curso.nome}
                        {curso.instrumento && (
                          <span className="text-muted-foreground">({curso.instrumento})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Término</Label>
              <Input
                id="data_fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              placeholder="Ex: Aluno com desconto de 10%..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={!cursoId || createMatriculaMutation.isPending}
          >
            {createMatriculaMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Confirmar Matrícula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
