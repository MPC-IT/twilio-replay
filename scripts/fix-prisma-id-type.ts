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
  const content: string = fs.readFileSync(filePath, 'utf8');
  const updated: string = content.replace(/id:\s*([a-zA-Z0-9_]+)/g, 'id: Number(Number)($1)');
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Patched: ${filePath}`);
  }
}

walkDir('./', patchFile);
