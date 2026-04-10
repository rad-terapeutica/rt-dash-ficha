import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getTurmaStats, type Person } from "@/data/dataProcessor";

interface TurmaComparisonProps {
  people: Person[];
}

const TurmaComparison = ({ people }: TurmaComparisonProps) => {
  const stats = getTurmaStats(people).map(s => ({
    ...s,
    turmaShort: s.turma.replace("Desafio - ", ""),
  }));

  return (
    <div className="dashboard-card">
      <h3 className="section-title mb-1">Comparativo entre Turmas</h3>
      <p className="section-subtitle mb-6">Performance por turma do Desafio</p>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
            <XAxis dataKey="turmaShort" tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(225 20% 10%)",
                border: "1px solid hsl(225 15% 18%)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                color: "hsl(210 20% 93%)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            <Bar dataKey="total" name="Total" fill="hsl(210 100% 62%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="respondentes" name="Respondentes" fill="hsl(280 60% 58%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="crt" name="CRT" fill="hsl(38 95% 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Turma</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Total</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Respond.</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">% Resp.</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">CRT</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">% CRT/Total</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">% CRT/Resp.</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.turma} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 font-medium">{s.turmaShort}</td>
                <td className="text-right py-2.5 px-3 font-mono">{s.total.toLocaleString("pt-BR")}</td>
                <td className="text-right py-2.5 px-3 font-mono">{s.respondentes.toLocaleString("pt-BR")}</td>
                <td className="text-right py-2.5 px-3">
                  <span className="badge-info">{s.pctResp.toFixed(1)}%</span>
                </td>
                <td className="text-right py-2.5 px-3 font-mono">{s.crt.toLocaleString("pt-BR")}</td>
                <td className="text-right py-2.5 px-3">
                  <span className="badge-success">{s.pctCrt.toFixed(1)}%</span>
                </td>
                <td className="text-right py-2.5 px-3">
                  <span className="badge-warning">{s.pctCrtResp.toFixed(1)}%</span>
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
