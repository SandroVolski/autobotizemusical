import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const INSTRUMENTOS = [
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

const OUTRO = "__outro__";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function InstrumentoSelect({ value, onChange, placeholder = "Selecione o instrumento", id }: Props) {
  const [open, setOpen] = useState(false);
  const isKnown = useMemo(() => INSTRUMENTOS.includes(value), [value]);
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
            <CommandList>
              <CommandEmpty>Nenhum instrumento encontrado.</CommandEmpty>
              <CommandGroup>
                {INSTRUMENTOS.map((item) => (
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
