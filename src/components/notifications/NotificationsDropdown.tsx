import { useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificacoesNaoLidas, useMarcarComoLida, useMarcarTodasComoLidas, useNotificacoes } from "@/hooks/useNotificacoes";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const tipoConfig = {
  info: "bg-primary/20 text-primary",
  alerta: "bg-warning/20 text-warning",
  erro: "bg-destructive/20 text-destructive",
  sucesso: "bg-success/20 text-success",
};

interface NotificationsDropdownProps {
  variant?: "icon" | "full";
  collapsed?: boolean;
}

export function NotificationsDropdown({ variant = "icon", collapsed = false }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const { data: notificacoesNaoLidas } = useNotificacoesNaoLidas();
  const { data: todasNotificacoes } = useNotificacoes();
  const marcarComoLida = useMarcarComoLida();
  const marcarTodasComoLidas = useMarcarTodasComoLidas();
  const navigate = useNavigate();

  const count = notificacoesNaoLidas?.length || 0;
  const notificacoes = todasNotificacoes?.slice(0, 10) || [];

  const handleNotificationClick = (notificacao: { id: string; link: string | null; lida: boolean }) => {
    if (!notificacao.lida) {
      marcarComoLida.mutate(notificacao.id);
    }
    if (notificacao.link) {
      navigate(notificacao.link);
      setOpen(false);
    }
  };

  const handleMarcarTodasComoLidas = () => {
    marcarTodasComoLidas.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "full" ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center"
            )}
          >
            <Bell className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Notificações</span>}
            {!collapsed && count > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {count}
              </Badge>
            )}
            {collapsed && count > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold">Notificações</h4>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasComoLidas}
              disabled={marcarTodasComoLidas.isPending}
              className="text-xs gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={cn(
                    "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    !notificacao.lida && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notificacao)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notificacao.lida ? "bg-muted-foreground/30" : "bg-primary"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium truncate", !notificacao.lida && "text-foreground")}>
                          {notificacao.titulo}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] px-1 py-0", tipoConfig[notificacao.tipo as keyof typeof tipoConfig])}
                        >
                          {notificacao.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notificacao.mensagem}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notificacao.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarComoLida.mutate(notificacao.id);
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              navigate("/comunicacao");
              setOpen(false);
            }}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
