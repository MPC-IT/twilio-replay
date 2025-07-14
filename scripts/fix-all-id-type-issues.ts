const fs = require('fs');
const path = require('path');

function walkDir(dir: string, callback: (filePath: string) => void): void {
  fs.readdirSync(dir).forEach((entry: string) => {
    const fullPath: string = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      callback(fullPath);
    }
  });
}

function patchFile(filePath: string): void {
  let content: string = fs.readFileSync(filePath, 'utf8');

  // Fix 1: incorrect type declaration id: Number(number)
  content = content.replace(/id:\s*Number\(string\)/g, 'id: Number(number)');

  // Fix 2: fix string literal IDs passed to Prisma (e.g. id: Number(replayId) → id: Number(Number)(replayId))
  content = content.replace(/id:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'id: Number(Number)($1)');

  // Fix 3: ensure createdBy fields are numbers too
  content = content.replace(/createdBy:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'createdBy: Number(Number)($1)');

  // Fix 4: same for replayId/codeInt when needed
  content = content.replace(/replayId:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'replayId: Number(Number)($1)');
  content = content.replace(/codeInt:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, 'codeInt: Number(Number)($1)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Patched: ${filePath}`);
}

walkDir('./', patchFile);
