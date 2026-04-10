export interface Person {
  id: string;
  name: string;
  email: string;
  turma: string;
  turmaDate: string;
  respondeuPesquisa: boolean;
  virouCRT: boolean;
  respostas?: {
    motivoPrincipal: string;
    momentoAtual: string;
    intencao: string;
    faixa: string;
    perfil: string;
  };
}

const motivoOptions = [
  "Crescer meu negócio",
  "Iniciar do zero",
  "Trocar de carreira",
  "Aumentar faturamento",
  "Aprender marketing digital",
];

const momentoOptions = [
  "Já tenho negócio",
  "Estou começando",
  "Tenho ideia mas não comecei",
  "Trabalho CLT e quero sair",
  "Já sou empreendedor",
];

const intencaoOptions = [
  "Comprar agora",
  "Avaliar primeiro",
  "Comparar opções",
  "Apenas conhecer",
  "Muito interessado",
];

const faixaOptions = [
  "Até R$3k/mês",
  "R$3k - R$5k/mês",
  "R$5k - R$10k/mês",
  "R$10k - R$20k/mês",
  "Acima de R$20k/mês",
];

const perfilOptions = [
  "Iniciante",
  "Intermediário",
  "Avançado",
  "Expert",
];

const turmas = [
  { tag: "Desafio - 06/04/26", date: "2026-04-06" },
  { tag: "Desafio - 02/03/26", date: "2026-03-02" },
  { tag: "Desafio - 09/03/26", date: "2026-03-09" },
  { tag: "Desafio - 23/02/26", date: "2026-02-23" },
  { tag: "Desafio - 16/02/26", date: "2026-02-16" },
];

const firstNames = ["Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Julia", "Kevin", "Larissa", "Marcos", "Natalia", "Pedro", "Rafaela", "Sergio", "Tatiana", "Victor", "Wendy"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Araújo"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePeople(): Person[] {
  const people: Person[] = [];
  let id = 1;

  for (const turma of turmas) {
    const count = 40 + Math.floor(Math.random() * 80);
    for (let i = 0; i < count; i++) {
      const firstName = pick(firstNames);
      const lastName = pick(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@email.com`;
      const respondeu = Math.random() < 0.55;
      const virouCRT = respondeu && Math.random() < 0.28;

      people.push({
        id: String(id++),
        name,
        email,
        turma: turma.tag,
        turmaDate: turma.date,
        respondeuPesquisa: respondeu,
        virouCRT,
        respostas: respondeu
          ? {
              motivoPrincipal: pick(motivoOptions),
              momentoAtual: pick(momentoOptions),
              intencao: pick(intencaoOptions),
              faixa: pick(faixaOptions),
              perfil: pick(perfilOptions),
            }
          : undefined,
      });
    }
  }

  return people;
}

export const mockPeople = generatePeople();

export const turmaList = turmas.map((t) => t.tag);

export function getTurmaStats(people: Person[]) {
  const turmaMap = new Map<string, { total: number; respondentes: number; crt: number }>();

  for (const p of people) {
    if (!turmaMap.has(p.turma)) {
      turmaMap.set(p.turma, { total: 0, respondentes: 0, crt: 0 });
    }
    const s = turmaMap.get(p.turma)!;
    s.total++;
    if (p.respondeuPesquisa) s.respondentes++;
    if (p.virouCRT) s.crt++;
  }

  return Array.from(turmaMap.entries())
    .map(([turma, stats]) => ({ turma, ...stats }))
    .sort((a, b) => b.total - a.total);
}

export function getResponseDistribution(people: Person[], field: keyof NonNullable<Person["respostas"]>) {
  const dist = new Map<string, { total: number; crt: number }>();
  for (const p of people) {
    if (!p.respostas) continue;
    const val = p.respostas[field];
    if (!dist.has(val)) dist.set(val, { total: 0, crt: 0 });
    const d = dist.get(val)!;
    d.total++;
    if (p.virouCRT) d.crt++;
  }
  return Array.from(dist.entries())
    .map(([value, stats]) => ({ value, ...stats }))
    .sort((a, b) => b.total - a.total);
}

export function getGlobalStats(people: Person[]) {
  const total = people.length;
  const respondentes = people.filter((p) => p.respondeuPesquisa).length;
  const crt = people.filter((p) => p.virouCRT).length;
  return {
    total,
    respondentes,
    crt,
    pctRespondentes: total > 0 ? (respondentes / total) * 100 : 0,
    pctCrtRespondentes: respondentes > 0 ? (crt / respondentes) * 100 : 0,
    pctCrtTotal: total > 0 ? (crt / total) * 100 : 0,
  };
}
