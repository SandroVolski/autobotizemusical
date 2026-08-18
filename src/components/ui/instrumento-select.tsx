import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const INSTRUMENTOS_RAW = [
  "Piano", "Teclado", "Violão", "Guitarra", "Baixo", "Contrabaixo Acústico", "Ukulele",
  "Cavaquinho", "Banjo", "Bandolim", "Viola Caipira", "Harpa",
  "Violino", "Viola", "Violoncelo",
  "Bateria", "Percussão", "Cajón", "Pandeiro",
  "Canto", "Coral",
  "Flauta Doce", "Flauta Transversal", "Clarinete", "Saxofone", "Oboé", "Fagote",
  "Trompete", "Trombone", "Trompa", "Tuba",
  "Acordeon", "Gaita", "Órgão",
  "Teoria Musical", "Musicalização Infantil", "Produção Musical", "DJ",
];

export const INSTRUMENTOS = [...INSTRUMENTOS_RAW].sort((a, b) =>
  a.localeCompare(b, "pt-BR", { sensitivity: "base" })
);

const OUTRO = "__outro__";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  /** Instrumentos já cadastrados pelo usuário — exibidos fixos no topo */
  recentes?: string[];
}

export function InstrumentoSelect({ value, onChange, placeholder = "Selecione o instrumento", id, recentes = [] }: Props) {
  const [open, setOpen] = useState(false);
  const isKnown = useMemo(() => INSTRUMENTOS.includes(value), [value]);

  const usados = useMemo(() => {
    const seen = new Set<string>();
    return recentes
      .filter((r) => {
        const k = (r || "").trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [recentes]);

  const usadosKeys = useMemo(
    () => new Set(usados.map((u) => u.trim().toLowerCase())),
    [usados]
  );
  const restantes = useMemo(
    () => INSTRUMENTOS.filter((i) => !usadosKeys.has(i.toLowerCase())),
    [usadosKeys]
  );

  // "Outro" mode is active when a custom value exists or user explicitly picked Outro
  const [outroMode, setOutroMode] = useState(!!value && !isKnown);

  const handleSelect = (item: string) => {
    if (item === OUTRO) {
      setOutroMode(true);
      onChange("");
    } else {
      setOutroMode(false);
      onChange(item);
    }
    setOpen(false);
  };

  const label = outroMode ? (value || "Outro") : value || "";

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !label && "text-muted-foreground"
            )}
          >
            <span className="truncate">{label || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar instrumento..." />
            <CommandList
              className="max-h-[280px] overflow-y-auto overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>Nenhum instrumento encontrado.</CommandEmpty>
              {usados.length > 0 && (
                <CommandGroup heading="Já utilizados">
                  {usados.map((item) => (
                    <CommandItem key={`u-${item}`} value={item} onSelect={() => handleSelect(item)}>
                      <Check className={cn("mr-2 h-4 w-4", value === item && !outroMode ? "opacity-100" : "opacity-0")} />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading={usados.length > 0 ? "Todos os instrumentos" : undefined}>
                {restantes.map((item) => (
                  <CommandItem key={item} value={item} onSelect={() => handleSelect(item)}>
                    <Check className={cn("mr-2 h-4 w-4", value === item && !outroMode ? "opacity-100" : "opacity-0")} />
                    {item}
                  </CommandItem>
                ))}
                <CommandItem value="Outro" onSelect={() => handleSelect(OUTRO)}>
                  <Check className={cn("mr-2 h-4 w-4", outroMode ? "opacity-100" : "opacity-0")} />
                  Outro (digitar)
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {outroMode && (
        <Input
          autoFocus
          placeholder="Digite o instrumento"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
