const fs = require('fs');
const path = require('path');

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((entry: string) => {
    const entryPath = path.join(dir, entry);
    const stats = fs.statSync(entryPath);
    if (stats.isDirectory()) {
      walkDir(entryPath, callback);
    } else if (entryPath.endsWith('.ts') || entryPath.endsWith('.tsx')) {
      callback(entryPath);
    }
  });
}

function patchFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');

  const before = content;

  content = content
    .replace(/Number\(string\)/g, 'number')
    .replace(/Number\(number\)/g, 'number')
    .replace(/String\(string\)/g, 'string')
    .replace(/String\(number\)/g, 'string');

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✔ Patched: ${filePath}`);
  }
}

walkDir('./', patchFile);
