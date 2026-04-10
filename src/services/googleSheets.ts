const SHEET1_ID = "1kbLn8eE3BHfG8NamLaB5Zt4IJ84X7mABI9sdEYZNNAg";
const SHEET2_ID = "1fVKmODWFZ_C12_klFDtVNEzpQvizH0eI-7glmTHK4gw";

function csvUrl(sheetId: string, sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(current); current = ""; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        row.push(current); current = "";
        if (row.some(c => c.trim())) rows.push(row);
        row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }
  row.push(current);
  if (row.some(c => c.trim())) rows.push(row);
  return rows;
}

async function fetchCSV(url: string): Promise<string[][]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const rows = parseCSV(text);
  return rows.length > 1 ? rows.slice(1) : []; // skip header
}

export interface LeadRow {
  grupo: string;
  tag: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface SurveyRow {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  nome: string;
  email: string;
  telefone: string;
  areasMain: string;
  areaProsperdade: boolean;
  areaSaude: boolean;
  areaAmbiente: boolean;
  areaRelacionamento: boolean;
  areaProcrastinacao: boolean;
  areaSaudeEmocional: boolean;
  tentouOutraTerapia: string;
  quantoInvestiu: string;
  interesseTratarOutros: string;
  dispostoinvestir: string;
  mensagemExtra: string;
}

function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

function parseLeadRow(row: string[]): LeadRow {
  return {
    grupo: (row[0] || "").trim(),
    tag: (row[1] || "").trim(),
    nome: (row[2] || "").trim(),
    email: normalizeEmail(row[3]),
    telefone: (row[4] || "").trim(),
  };
}

function parseSurveyRow(row: string[]): SurveyRow {
  return {
    submissionId: (row[0] || "").trim(),
    respondentId: (row[1] || "").trim(),
    submittedAt: (row[2] || "").trim(),
    nome: (row[3] || "").trim(),
    email: normalizeEmail(row[4]),
    telefone: (row[5] || "").trim(),
    areasMain: (row[6] || "").trim(),
    areaProsperdade: (row[7] || "").toUpperCase() === "TRUE",
    areaSaude: (row[8] || "").toUpperCase() === "TRUE",
    areaAmbiente: (row[9] || "").toUpperCase() === "TRUE",
    areaRelacionamento: (row[10] || "").toUpperCase() === "TRUE",
    areaProcrastinacao: (row[11] || "").toUpperCase() === "TRUE",
    areaSaudeEmocional: (row[12] || "").toUpperCase() === "TRUE",
    tentouOutraTerapia: (row[13] || "").trim(),
    quantoInvestiu: (row[14] || "").trim(),
    interesseTratarOutros: (row[15] || "").trim(),
    dispostoinvestir: (row[16] || "").trim(),
    mensagemExtra: (row[17] || "").trim(),
  };
}

export interface SheetData {
  turmas: LeadRow[];
  compraAprovada: LeadRow[];
  crt: LeadRow[];
  survey: SurveyRow[];
}

export async function fetchAllSheets(): Promise<SheetData> {
  const [turmaRows, compraRows, crtRows, surveyRows] = await Promise.all([
    fetchCSV(csvUrl(SHEET1_ID, "desafio_turma")),
    fetchCSV(csvUrl(SHEET1_ID, "desafio_compra_aprvada")),
    fetchCSV(csvUrl(SHEET1_ID, "Desafio_crt")),
    fetchCSV(csvUrl(SHEET2_ID, "Sheet1")),
  ]);

  return {
    turmas: turmaRows.map(parseLeadRow),
    compraAprovada: compraRows.map(parseLeadRow),
    crt: crtRows.map(parseLeadRow),
    survey: surveyRows.map(parseSurveyRow),
  };
}
