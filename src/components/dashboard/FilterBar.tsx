import { BarChart3, Filter, X, MousePointerClick } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CrossFilter } from "@/pages/Index";

interface FilterBarProps {
  turmaFilter: string;
  statusResposta: string;
  statusCRT: string;
  turmaList: string[];
  ultimaAtualizacao: Date | null; // hora real do dado no banco (não do cliente)
  fontesAtualizacao?: { ac: Date | null; ficha: Date | null; comprador: Date | null };
  crossFilter: CrossFilter | null;
  onTurmaChange: (v: string) => void;
  onStatusRespostaChange: (v: string) => void;
  onStatusCRTChange: (v: string) => void;
  onClear: () => void;
  onClearCrossFilter: () => void;
}

function fmtBRT(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FilterBar = ({
  turmaFilter,
  statusResposta,
  statusCRT,
  turmaList,
  ultimaAtualizacao,
  fontesAtualizacao,
  crossFilter,
  onTurmaChange,
  onStatusRespostaChange,
  onStatusCRTChange,
  onClear,
  onClearCrossFilter,
}: FilterBarProps) => {
  const hasFilters =
    turmaFilter !== "all" ||
    statusResposta !== "all" ||
    statusCRT !== "all";

  return (
    <div className="filter-bar space-y-4">
      {/* Row 1: Branding + meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/15 shadow-[var(--glow-primary)]">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight">
              Ficha de Interesse{" "}
              <span className="text-primary">×</span> Desafio{" "}
              <span className="text-primary">×</span> COMU RT
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Turma do Desafio → Respondeu Pesquisa → Comu RT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="text-[11px] text-muted-foreground"
            title={
              fontesAtualizacao
                ? `AC: ${fmtBRT(fontesAtualizacao.ac)} · Ficha: ${fmtBRT(fontesAtualizacao.ficha)} · Comprador: ${fmtBRT(fontesAtualizacao.comprador)}`
                : undefined
            }
          >
            Atualizado em {fmtBRT(ultimaAtualizacao)}
          </span>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Dados ao vivo do banco" />
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Filtros
          </span>
        </div>

        <Select value={turmaFilter} onValueChange={onTurmaChange}>
          <SelectTrigger className="w-[200px] h-8 text-xs bg-muted/50 border-border">
            <SelectValue placeholder="Turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {turmaList.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusResposta}
          onValueChange={onStatusRespostaChange}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs bg-muted/50 border-border">
            <SelectValue placeholder="Pesquisa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sim">Respondeu</SelectItem>
            <SelectItem value="nao">Não respondeu</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusCRT} onValueChange={onStatusCRTChange}>
          <SelectTrigger className="w-[150px] h-8 text-xs bg-muted/50 border-border">
            <SelectValue placeholder="Comu RT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sim">Na Comu RT</SelectItem>
            <SelectItem value="nao">Fora da Comu RT</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar
          </Button>
        )}

        {crossFilter && (
          <div className="flex items-center gap-2 ml-1">
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 border border-primary/25 text-primary">
              <MousePointerClick className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-[280px]">
                {crossFilter.themeTitle} = {crossFilter.value}
              </span>
              <button
                onClick={onClearCrossFilter}
                className="ml-1 p-0.5 rounded hover:bg-primary/20 transition-colors flex-shrink-0"
                title="Remover filtro contextual"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
