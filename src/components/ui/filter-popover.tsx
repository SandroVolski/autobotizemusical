import { useState, ReactNode } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date-range";
  options?: { value: string; label: string }[];
}

export interface FilterValues {
  [key: string]: string | undefined;
}

interface FilterPopoverProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  children?: ReactNode;
}

export function FilterPopover({ filters, values, onChange, children }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = Object.values(values).filter(v => v && v !== "all").length;

  const handleClear = () => {
    const cleared: FilterValues = {};
    filters.forEach(f => {
      cleared[f.id] = undefined;
    });
    onChange(cleared);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    onChange({
      ...values,
      [filterId]: value === "all" ? undefined : value,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2 text-muted-foreground">
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm">{filter.label}</Label>
              {filter.type === "select" && filter.options && (
                <Select
                  value={values[filter.id] || "all"}
                  onValueChange={(value) => handleFilterChange(filter.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <Button 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
