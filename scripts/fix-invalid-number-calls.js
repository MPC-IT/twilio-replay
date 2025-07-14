const fs = require('fs');
const path = require('path');

const dir = './';

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const fixedContent = content.replace(
    /Number\s*\(\s*Number\s*\)\s*\(\s*String\s*\)\s*\((.*?)\)/g,
    'Number(String($1))'
  );

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Patched: ${filePath}`);
  }
}

function walkDir(dirPath) {
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  }
}

walkDir(dir);
