import fs from 'fs'
import path from 'path'

function formatPct(pct) {
  if (pct === undefined || pct === null) return 'N/A'
  return typeof pct === 'number' ? `${pct.toFixed(1)}%` : `${pct}%`
}

function getSummary(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return data.total || null
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err)
    return null
  }
}

const rootDir = process.cwd()
const backendSummary = getSummary(path.join(rootDir, 'backend/coverage/coverage-summary.json'))
const frontendSummary = getSummary(path.join(rootDir, 'frontend/coverage/coverage-summary.json'))

let markdown = `## 📊 Test & Code Coverage Summary\n\n`
markdown += `| Scope | Statements | Branches | Functions | Lines | Status |\n`
markdown += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`

if (backendSummary) {
  markdown += `| **Backend** (\`backend/\`) | ${formatPct(backendSummary.statements.pct)} | ${formatPct(backendSummary.branches.pct)} | ${formatPct(backendSummary.functions.pct)} | ${formatPct(backendSummary.lines.pct)} | ✅ Passed |\n`
} else {
  markdown += `| **Backend** (\`backend/\`) | - | - | - | - | ⚠️ No report |\n`
}

if (frontendSummary) {
  markdown += `| **Frontend** (\`frontend/\`) | ${formatPct(frontendSummary.statements.pct)} | ${formatPct(frontendSummary.branches.pct)} | ${formatPct(frontendSummary.functions.pct)} | ${formatPct(frontendSummary.lines.pct)} | ✅ Passed |\n`
} else {
  markdown += `| **Frontend** (\`frontend/\`) | - | - | - | - | ⚠️ No report |\n`
}

markdown += `\n> 💡 *Full detailed HTML and LCOV coverage reports are uploaded as job artifacts below.*\n`

console.log(markdown)

const summaryFile = process.env.GITHUB_STEP_SUMMARY
if (summaryFile) {
  fs.appendFileSync(summaryFile, markdown, 'utf8')
}
