/**
 * Leitura do texto colado da planilha de inscritos.
 *
 * Aceita colagem direta do Excel/Sheets (colunas separadas por tabulacao) ou
 * CSV com ponto e virgula/virgula. A ordem das colunas nao importa: o CPF e
 * identificado por ter 11 digitos e o nome e a coluna com letras.
 */

export interface ParsedRow {
  full_name: string
  cpf: string
}

export interface ParseIssue {
  line: number
  text: string
  reason: string
}

export interface ParseResult {
  /** Linhas validas, ja sem CPFs repetidos. */
  rows: ParsedRow[]
  /** Linhas descartadas por repetir um CPF que ja apareceu na colagem. */
  duplicates: number
  /** Linhas que nao puderam ser lidas. */
  invalid: ParseIssue[]
  /** CPFs com digito verificador incorreto. Sao importados mesmo assim. */
  suspicious: number
}

const MAX_REPORTED_ISSUES = 20

function detectDelimiter(text: string): string | null {
  if (text.includes('\t')) return '\t'
  if (text.includes(';')) return ';'
  if (text.includes(',')) return ','
  return null
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function hasLetters(value: string): boolean {
  return /\p{L}/u.test(value)
}

/** Valida os dois digitos verificadores do CPF. */
export function isValidCpf(cpf: string): boolean {
  const digits = digitsOnly(cpf)
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  for (const [length, position] of [
    [9, 10],
    [10, 11],
  ]) {
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (position - i)
    }
    const remainder = (sum * 10) % 11
    const check = remainder === 10 ? 0 : remainder
    if (check !== Number(digits[length])) return false
  }

  return true
}

/**
 * So a primeira linha com conteudo pode ser cabecalho. Sem essa restricao um
 * inscrito cujo nome contenha alguma dessas palavras sumiria sem aviso.
 */
function isHeaderLine(line: string): boolean {
  return /\b(nome|name|cpf|documento|inscri)/i.test(line)
}

/**
 * Extrai nome e CPF de uma linha. Devolve null quando nao encontra os dois.
 */
function parseLine(line: string, delimiter: string | null): ParsedRow | null {
  const cells = (delimiter ? line.split(delimiter) : [line])
    .map((cell) => cell.trim().replace(/^"|"$/g, '').trim())
    .filter((cell) => cell.length > 0)

  if (cells.length === 0) return null

  // O CPF e a celula com exatamente 11 digitos
  const cpfIndex = cells.findIndex((cell) => digitsOnly(cell).length === 11 && !hasLetters(cell))

  if (cpfIndex >= 0) {
    const nameCell = cells.find((cell, index) => index !== cpfIndex && hasLetters(cell))
    if (!nameCell) return null
    return { full_name: normalizeName(nameCell), cpf: digitsOnly(cells[cpfIndex]) }
  }

  // Sem colunas separadas: procura o CPF dentro do texto e o resto vira o nome
  const inline = line.match(/(\d{3}\D?\d{3}\D?\d{3}\D?\d{2})(?!\d)/)
  if (!inline) return null

  const cpf = digitsOnly(inline[1])
  if (cpf.length !== 11) return null

  const name = normalizeName(line.replace(inline[1], ' '))
  if (!hasLetters(name)) return null

  return { full_name: name, cpf }
}

function normalizeName(value: string): string {
  return value
    .replace(/[;,\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
}

/**
 * Converte o texto colado em inscritos prontos para importar.
 * Cabecalhos sao ignorados e CPFs repetidos ficam so com a primeira ocorrencia.
 */
export function parseParticipants(text: string): ParseResult {
  const lines = text.split(/\r?\n/)
  const delimiter = detectDelimiter(text)

  const rows: ParsedRow[] = []
  const invalid: ParseIssue[] = []
  const seen = new Set<string>()
  let duplicates = 0
  let suspicious = 0
  let isFirstContentLine = true

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (line.length === 0) return

    const couldBeHeader = isFirstContentLine
    isFirstContentLine = false

    const parsed = parseLine(line, delimiter)

    if (!parsed) {
      // Cabecalho da planilha nao conta como erro
      if (couldBeHeader && isHeaderLine(line)) return
      if (invalid.length < MAX_REPORTED_ISSUES) {
        invalid.push({ line: index + 1, text: line.slice(0, 120), reason: 'CPF não encontrado' })
      } else {
        invalid.push({ line: index + 1, text: '', reason: 'CPF não encontrado' })
      }
      return
    }

    if (seen.has(parsed.cpf)) {
      duplicates += 1
      return
    }

    seen.add(parsed.cpf)
    if (!isValidCpf(parsed.cpf)) suspicious += 1
    rows.push(parsed)
  })

  return { rows, duplicates, invalid, suspicious }
}
