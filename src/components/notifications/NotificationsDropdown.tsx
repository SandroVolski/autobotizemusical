import { useState } from "react";
import { Bell, Check, CheckCheck, Cake, DollarSign, Calendar, AlertTriangle, Info, RefreshCw, Users } from "lucide-react";
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

const tipoConfig: Record<string, { bg: string; icon: typeof Bell }> = {
  info: { bg: "bg-primary/15 text-primary", icon: Info },
  alerta: { bg: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400", icon: AlertTriangle },
  erro: { bg: "bg-destructive/15 text-destructive", icon: AlertTriangle },
  sucesso: { bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", icon: Check },
};

function getNotificationIcon(titulo: string, tipo: string) {
  if (titulo.includes("🎂")) return Cake;
  if (titulo.includes("💰") || titulo.includes("⚠️") || titulo.includes("📋")) return DollarSign;
  if (titulo.includes("📚")) return Calendar;
  if (titulo.includes("⚡")) return Users;
  if (titulo.includes("🔄")) return RefreshCw;
  return tipoConfig[tipo]?.icon || Bell;
}

function cleanEmoji(text: string) {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
}

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
  const notificacoes = todasNotificacoes?.slice(0, 20) || [];

  const handleNotificationClick = (notificacao: { id: string; link: string | null; lida: boolean }) => {
    if (!notificacao.lida) {
      marcarComoLida.mutate(notificacao.id);
    }
    if (notificacao.link) {
      navigate(notificacao.link);
      setOpen(false);
    }
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
              <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-5 px-1.5">
                {count > 99 ? "99+" : count}
              </Badge>
            )}
            {collapsed && count > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {count > 0 && (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[10px] font-bold text-destructive-foreground">
                    {count > 9 ? "9+" : count}
                  </span>
                </span>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive animate-ping opacity-30" />
              </>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Notificações</h4>
            {count > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                {count}
              </Badge>
            )}
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodasComoLidas.mutate()}
              disabled={marcarTodasComoLidas.isPending}
              className="text-xs gap-1 h-7 px-2"
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[380px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">Tudo em dia!</p>
              <p className="text-xs mt-1">Nenhuma notificação por enquanto</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notificacoes.map((notificacao) => {
                const config = tipoConfig[notificacao.tipo as keyof typeof tipoConfig] || tipoConfig.info;
                const Icon = getNotificationIcon(notificacao.titulo, notificacao.tipo);
                return (
                  <div
                    key={notificacao.id}
                    className={cn(
                      "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-all",
                      !notificacao.lida && "bg-primary/[0.03] border-l-2 border-l-primary"
                    )}
                    onClick={() => handleNotificationClick(notificacao)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          config.bg
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm leading-snug",
                          !notificacao.lida ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                        )}>
                          {cleanEmoji(notificacao.titulo)}
                        </p>
                        {notificacao.mensagem && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {notificacao.mensagem}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
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
                          className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLida.mutate(notificacao.id);
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {notificacoes.length > 0 && (
          <div className="border-t border-border p-2 bg-muted/20">
            <Button
              variant="ghost"
              className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigate("/comunicacao");
                setOpen(false);
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
