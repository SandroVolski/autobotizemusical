import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, FileText, Music, Video, Image, Link, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMateriais, useCreateMaterial, useDeleteMaterial } from "@/hooks/useMateriais";
import { useCursos } from "@/hooks/useCursos";
import { AIAssistant } from "./AIAssistant";

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pdf: { icon: <FileText className="w-4 h-4" />, label: "PDF", color: "text-red-500" },
  partitura: { icon: <Music className="w-4 h-4" />, label: "Partitura", color: "text-purple-500" },
  video: { icon: <Video className="w-4 h-4" />, label: "Vídeo", color: "text-blue-500" },
  audio: { icon: <Music className="w-4 h-4" />, label: "Áudio", color: "text-green-500" },
  imagem: { icon: <Image className="w-4 h-4" />, label: "Imagem", color: "text-yellow-500" },
  link: { icon: <Link className="w-4 h-4" />, label: "Link", color: "text-cyan-500" },
};

export function MaterialsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cursoFilter, setCursoFilter] = useState<string>("all");
  const [newMaterial, setNewMaterial] = useState({
    titulo: "",
    descricao: "",
    tipo: "pdf",
    url: "",
    curso_id: "",
  });

  const { data: materiais, isLoading } = useMateriais(cursoFilter === "all" ? undefined : cursoFilter);
  const { data: cursos } = useCursos();
  const createMaterialMutation = useCreateMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  const handleCreate = () => {
    if (!newMaterial.titulo || !newMaterial.url) return;

    createMaterialMutation.mutate({
      ...newMaterial,
      curso_id: newMaterial.curso_id || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewMaterial({ titulo: "", descricao: "", tipo: "pdf", url: "", curso_id: "" });
      }
    });
  };

  const getTypeConfig = (tipo: string | null) => {
    return typeConfig[tipo || "link"] || typeConfig.link;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {cursos?.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <AIAssistant type="material" />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Material
              </Button>
            </DialogTrigger>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Material Didático</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Escala de Dó Maior"
                  value={newMaterial.titulo}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newMaterial.tipo}
                    onValueChange={(value) => setNewMaterial(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select
                    value={newMaterial.curso_id}
                    onValueChange={(value) => setNewMaterial(prev => ({ ...prev, curso_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos?.map(curso => (
                        <SelectItem key={curso.id} value={curso.id}>{curso.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL do Material *</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={newMaterial.url}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o material..."
                  value={newMaterial.descricao}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!newMaterial.titulo || !newMaterial.url || createMaterialMutation.isPending}
              >
                {createMaterialMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Adicionar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Materials Grid */}
      {!materiais || materiais.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground mb-4">Adicione materiais didáticos para seus cursos</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map((material, index) => {
            const config = getTypeConfig(material.tipo);
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteMaterialMutation.mutate(material.id)}
                        disabled={deleteMaterialMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <CardTitle className="text-base">{material.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {material.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{material.descricao}</p>
                    )}
                    {material.cursos && (
                      <p className="text-xs text-muted-foreground">
                        Curso: {material.cursos.nome}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(material.url || "", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir Material
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
