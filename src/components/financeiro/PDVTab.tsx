import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Minus, Loader2, ShoppingCart, Package, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useProdutos, useCreateProduto } from "@/hooks/useProdutos";
import { useVendas, useCreateVenda } from "@/hooks/useVendas";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  produto_id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export function PDVTab() {
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [metodo, setMetodo] = useState("dinheiro");
  const [newProduto, setNewProduto] = useState({ nome: "", preco: 0, estoque: 10, categoria: "acessorio" });

  const { data: produtos } = useProdutos();
  const { data: vendas } = useVendas();
  const { data: alunos } = useAlunos();
  const createProduto = useCreateProduto();
  const createVenda = useCreateVenda();

  const addToCart = (produto: any) => {
    const existing = cart.find(c => c.produto_id === produto.id);
    if (existing) {
      if (existing.quantidade >= produto.estoque) {
        toast({ title: "Estoque insuficiente", variant: "destructive" });
        return;
      }
      setCart(cart.map(c => c.produto_id === produto.id ? { ...c, quantidade: c.quantidade + 1 } : c));
    } else {
      if (produto.estoque <= 0) {
        toast({ title: "Produto sem estoque", variant: "destructive" });
        return;
      }
      setCart([...cart, { produto_id: produto.id, nome: produto.nome, quantidade: 1, preco: Number(produto.preco) }]);
    }
  };

  const removeFromCart = (produtoId: string) => {
    setCart(cart.filter(c => c.produto_id !== produtoId));
  };

  const updateQty = (produtoId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.produto_id !== produtoId) return c;
      const newQty = c.quantidade + delta;
      if (newQty <= 0) return c;
      return { ...c, quantidade: newQty };
    }));
  };

  const total = cart.reduce((s, c) => s + c.preco * c.quantidade, 0);

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;
    createVenda.mutate({
      aluno_id: alunoId || undefined,
      itens: cart,
      total,
      metodo_pagamento: metodo,
    }, {
      onSuccess: () => {
        setCart([]);
        setAlunoId("");
      },
    });
  };

  const handleCreateProduto = () => {
    if (!newProduto.nome || !newProduto.preco) return;
    createProduto.mutate(newProduto, {
      onSuccess: () => {
        setProdDialogOpen(false);
        setNewProduto({ nome: "", preco: 0, estoque: 10, categoria: "acessorio" });
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Produtos</h3>
          <Dialog open={prodDialogOpen} onOpenChange={setProdDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Novo Produto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Produto</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome *</Label>
                  <Input placeholder="Ex: Palheta Fender" value={newProduto.nome}
                    onChange={(e) => setNewProduto(p => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Preço *</Label>
                    <Input type="number" step="0.01" value={newProduto.preco || ""}
                      onChange={(e) => setNewProduto(p => ({ ...p, preco: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Estoque</Label>
                    <Input type="number" value={newProduto.estoque}
                      onChange={(e) => setNewProduto(p => ({ ...p, estoque: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select value={newProduto.categoria} onValueChange={(v) => setNewProduto(p => ({ ...p, categoria: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acessorio">Acessório</SelectItem>
                        <SelectItem value="corda">Cordas</SelectItem>
                        <SelectItem value="livro">Livro/Método</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateProduto} disabled={createProduto.isPending} className="w-full">
                  {createProduto.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {produtos?.map((produto, i) => (
            <motion.div key={produto.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card
                variant="interactive"
                className="p-3 cursor-pointer"
                onClick={() => addToCart(produto)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{produto.nome}</p>
                    <p className="text-lg font-bold text-primary">
                      {Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <Badge variant={produto.estoque > 0 ? "secondary" : "destructive"} className="text-xs">
                    {produto.estoque} un
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
          {(!produtos || produtos.length === 0) && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cadastre produtos para vender</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div>
        <Card variant="glass" className="sticky top-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Carrinho</h3>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carrinho vazio</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.produto_id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(item.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} × {item.quantidade}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateQty(item.produto_id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantidade}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateQty(item.produto_id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeFromCart(item.produto_id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Vincular a aluno (opcional)</Label>
                <Select value={alunoId} onValueChange={setAlunoId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Venda avulsa" /></SelectTrigger>
                  <SelectContent>{alunos?.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Pagamento</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleFinalizeSale} disabled={cart.length === 0 || createVenda.isPending}>
                {createVenda.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Finalizar Venda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
