import fs from 'fs'
import path from 'path'

const CSV_PATH = path.join(process.cwd(), 'docs', 'keywords_seed.csv')

/**
 * Returns the slug if the keyword was already posted, null otherwise.
 */
export function isKeywordPosted(keyword: string): string | null {
  try {
    if (!fs.existsSync(CSV_PATH)) return null
    const lines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n')
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      if (!cols || cols.length < 8) continue
      const kw = cols[1]?.trim()
      const posted = cols[6]?.trim()
      const slug = cols[7]?.trim()
      if (kw === keyword && posted === 'Y' && slug) return slug
    }
  } catch {
    // CSV not accessible — treat as not posted
  }
  return null
}

/**
 * Marks the keyword as posted in the CSV with its slug and today's date.
 */
export function markKeywordPosted(keyword: string, slug: string): void {
  try {
    if (!fs.existsSync(CSV_PATH)) return
    const lines = fs.readFileSync(CSV_PATH, 'utf-8').split('\n')
    const today = new Date().toISOString().split('T')[0]

    const updated = lines.map((line, i) => {
      if (i === 0) return line // header
      const cols = parseCSVLine(line)
      if (!cols || cols.length < 2) return line
      const kw = cols[1]?.trim()
      if (kw === keyword && cols[6]?.trim() !== 'Y') {
        while (cols.length < 9) cols.push('')
        cols[6] = 'Y'
        cols[7] = slug
        cols[8] = today
        return cols.join(',')
      }
      return line
    })

    fs.writeFileSync(CSV_PATH, updated.join('\n'), 'utf-8')
  } catch {
    // Silent fail — keyword tracking is best-effort
  }
}

function parseCSVLine(line: string): string[] | null {
  if (!line.trim()) return null
  return line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
}
