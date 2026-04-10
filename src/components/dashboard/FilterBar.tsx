import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { turmaList } from "@/data/mockData";

interface FilterBarProps {
  turmaFilter: string;
  statusResposta: string;
  statusCRT: string;
  search: string;
  onTurmaChange: (v: string) => void;
  onStatusRespostaChange: (v: string) => void;
  onStatusCRTChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onClear: () => void;
}

const FilterBar = ({
  turmaFilter, statusResposta, statusCRT, search,
  onTurmaChange, onStatusRespostaChange, onStatusCRTChange, onSearchChange, onClear,
}: FilterBarProps) => {
  const hasFilters = turmaFilter !== "all" || statusResposta !== "all" || statusCRT !== "all" || search !== "";

  return (
    <div className="filter-bar">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros</span>
        </div>

        <Select value={turmaFilter} onValueChange={onTurmaChange}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="Turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {turmaList.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusResposta} onValueChange={onStatusRespostaChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Status Resposta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sim">Respondeu</SelectItem>
            <SelectItem value="nao">Não respondeu</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusCRT} onValueChange={onStatusCRTChange}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Status CRT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sim">CRT</SelectItem>
            <SelectItem value="nao">Não CRT</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
