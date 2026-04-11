import { useState, useMemo } from "react";
import { type Person } from "@/data/dataProcessor";
import { ChevronUp, ChevronDown, Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DetailTableProps {
  people: Person[];
}

type SortKey = "nome" | "email" | "turma" | "respondeuPesquisa" | "virouCRT";

const DetailTable = ({ people }: DetailTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("turma");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [tableSearch, setTableSearch] = useState("");
  const perPage = 20;

  const filtered = useMemo(() => {
    if (!tableSearch) return people;
    const q = tableSearch.toLowerCase();
    return people.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.turma.toLowerCase().includes(q)
    );
  }, [people, tableSearch]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "respondeuPesquisa")
          return (
            (Number(a.respondeuPesquisa) - Number(b.respondeuPesquisa)) * dir
          );
        if (sortKey === "virouCRT")
          return (Number(a.virouCRT) - Number(b.virouCRT)) * dir;
        return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
      }),
    [filtered, sortKey, sortDir]
  );

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const handleSearchChange = (v: string) => {
    setTableSearch(v);
    setPage(0);
  };

  return (
    <div className="dashboard-card">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="section-title">Tabela Analítica</h3>
          <p className="section-subtitle">
            Detalhamento individual dos contatos —{" "}
            {sorted.length.toLocaleString("pt-BR")} registros
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, email ou tag..."
            value={tableSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 w-full sm:w-[280px] text-sm bg-muted/50 border-border"
          />
          {tableSearch && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {(
                [
                  ["nome", "Nome"],
                  ["email", "Email"],
                  ["turma", "Tag do Desafio"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="text-left py-3 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </div>
                </th>
              ))}
              {(
                [
                  ["respondeuPesquisa", "Pesquisa"],
                  ["virouCRT", "Comu RT"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="text-center py-3 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </div>
                </th>
              ))}
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                Tag Comu RT
              </th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                Disposto a investir?
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2.5 px-3 font-medium max-w-[180px] truncate">
                  {p.nome}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs max-w-[200px] truncate">
                  {p.email}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground font-mono">
                  {p.turma}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {p.respondeuPesquisa ? (
                    <Check className="w-4 h-4 text-success mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {p.virouCRT ? (
                    <Check className="w-4 h-4 text-warning mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-[180px] font-mono">
                  {p.crtTag || "—"}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-[120px]">
                  {p.survey?.dispostoinvestir || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>
          Página {page + 1} de {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailTable;
