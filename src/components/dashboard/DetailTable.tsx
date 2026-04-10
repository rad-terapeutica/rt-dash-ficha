import { useState } from "react";
import { type Person } from "@/data/dataProcessor";
import { ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DetailTableProps {
  people: Person[];
}

type SortKey = "nome" | "email" | "turma" | "respondeuPesquisa" | "virouCRT";

const DetailTable = ({ people }: DetailTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("turma");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const sorted = [...people].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "respondeuPesquisa") return (Number(a.respondeuPesquisa) - Number(b.respondeuPesquisa)) * dir;
    if (sortKey === "virouCRT") return (Number(a.virouCRT) - Number(b.virouCRT)) * dir;
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
  });

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const getStatus = (p: Person) => {
    if (p.virouCRT) return "CRT";
    if (p.respondeuPesquisa) return "Respondeu";
    return "Apenas Turma";
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title">Tabela Detalhada</h3>
          <p className="section-subtitle">{sorted.length.toLocaleString("pt-BR")} registros encontrados</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {([
                ["nome", "Nome"],
                ["email", "Email"],
                ["turma", "Turma"],
                ["respondeuPesquisa", "Pesquisa"],
                ["virouCRT", "CRT"],
              ] as [SortKey, string][]).map(([key, label]) => (
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
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Tag CRT</th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Disposto a investir?</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 font-medium max-w-[180px] truncate">{p.nome}</td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs max-w-[200px] truncate">{p.email}</td>
                <td className="py-2.5 px-3 text-xs">{p.turma.replace("Desafio - ", "")}</td>
                <td className="py-2.5 px-3">
                  {p.respondeuPesquisa ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </td>
                <td className="py-2.5 px-3">
                  {p.virouCRT ? (
                    <Check className="w-4 h-4 text-warning" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant={p.virouCRT ? "default" : p.respondeuPesquisa ? "secondary" : "outline"} className="text-xs">
                    {getStatus(p)}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-[180px]">
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
        <span>Página {page + 1} de {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
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
