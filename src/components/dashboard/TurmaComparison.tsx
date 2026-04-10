import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getTurmaStats, type Person } from "@/data/mockData";

interface TurmaComparisonProps {
  people: Person[];
}

const TurmaComparison = ({ people }: TurmaComparisonProps) => {
  const stats = getTurmaStats(people).map((s) => ({
    ...s,
    turmaShort: s.turma.replace("Desafio - ", ""),
    pctResp: s.total > 0 ? +((s.respondentes / s.total) * 100).toFixed(1) : 0,
    pctCrt: s.total > 0 ? +((s.crt / s.total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="dashboard-card">
      <h3 className="section-title mb-1">Comparativo entre Turmas</h3>
      <p className="section-subtitle mb-6">Performance por turma do Desafio</p>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="turmaShort" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            <Bar dataKey="total" name="Total" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="respondentes" name="Respondentes" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="crt" name="CRT" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Turma</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Respond.</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">% Resp.</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">CRT</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">% CRT</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.turma} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 px-3 font-medium">{s.turmaShort}</td>
                <td className="text-right py-2.5 px-3 font-mono">{s.total}</td>
                <td className="text-right py-2.5 px-3 font-mono">{s.respondentes}</td>
                <td className="text-right py-2.5 px-3">
                  <span className="badge-info">{s.pctResp}%</span>
                </td>
                <td className="text-right py-2.5 px-3 font-mono">{s.crt}</td>
                <td className="text-right py-2.5 px-3">
                  <span className="badge-success">{s.pctCrt}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TurmaComparison;
