import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Loader2, Trash2, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useContasPagar, useCreateContaPagar, useUpdateContaPagar, useDeleteContaPagar } from "@/hooks/useContasPagar";

const categorias = [
  { value: "aluguel", label: "Aluguel" },
  { value: "agua", label: "Água" },
  { value: "luz", label: "Luz" },
  { value: "internet", label: "Internet" },
  { value: "repasse_professor", label: "Repasse Professor" },
  { value: "material", label: "Material" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outros", label: "Outros" },
];

export function ContasPagarTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConta, setNewConta] = useState({
    descricao: "", valor: 0, data_vencimento: "", categoria: "outros", fornecedor: "",
  });

  const { data: contas, isLoading } = useContasPagar();
  const createConta = useCreateContaPagar();
  const updateConta = useUpdateContaPagar();
  const deleteConta = useDeleteContaPagar();

  const totalPendente = contas?.filter(c => c.status === "pendente").reduce((s, c) => s + Number(c.valor), 0) || 0;
  const totalPago = contas?.filter(c => c.status === "pago").reduce((s, c) => s + Number(c.valor), 0) || 0;

  const handleCreate = () => {
    if (!newConta.descricao || !newConta.valor) return;
    createConta.mutate(newConta, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewConta({ descricao: "", valor: 0, data_vencimento: "", categoria: "outros", fornecedor: "" });
      },
    });
  };

  const handlePay = (id: string) => {
    updateConta.mutate({ id, status: "pago", data_pagamento: new Date().toISOString().split("T")[0] });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">A Pagar: </span>
            <span className="font-bold text-destructive">{totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Pago: </span>
            <span className="font-bold text-success">{totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Nova Conta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Descrição *</Label>
                <Input placeholder="Ex: Aluguel Janeiro" value={newConta.descricao}
                  onChange={(e) => setNewConta(p => ({ ...p, descricao: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor *</Label>
                  <Input type="number" step="0.01" value={newConta.valor || ""}
                    onChange={(e) => setNewConta(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Vencimento</Label>
                  <Input type="date" value={newConta.data_vencimento}
                    onChange={(e) => setNewConta(p => ({ ...p, data_vencimento: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select value={newConta.categoria} onValueChange={(v) => setNewConta(p => ({ ...p, categoria: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Fornecedor</Label>
                  <Input placeholder="Nome" value={newConta.fornecedor}
                    onChange={(e) => setNewConta(p => ({ ...p, fornecedor: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createConta.isPending} className="w-full">
                {createConta.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {contas?.map((conta, i) => (
          <motion.div key={conta.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conta.status === "pago" ? "bg-success/20" : "bg-destructive/20"}`}>
                  {conta.status === "pago" ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-destructive" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{conta.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {categorias.find(c => c.value === conta.categoria)?.label || conta.categoria}
                    {conta.fornecedor && ` • ${conta.fornecedor}`}
                    {conta.data_vencimento && ` • Venc: ${new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {Number(conta.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                {conta.status === "pendente" && (
                  <Button variant="outline" size="sm" onClick={() => handlePay(conta.id)}>Pagar</Button>
                )}
                <Badge variant={conta.status === "pago" ? "success" : "warning"}>{conta.status}</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteConta.mutate(conta.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {(!contas || contas.length === 0) && (
          <p className="text-center text-muted-foreground py-8">Nenhuma conta cadastrada</p>
        )}
      </div>
    </div>
  );
}
