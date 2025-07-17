const fs = require('fs');
const path = require('path');

const FIND_PATTERN = /import\s+prisma\s+from\s+['"]@\/lib\/prisma['"]/g;
const REPLACE_WITH = `import { prisma } from '@/lib/prisma'`;

function processFile(filePath) {
  if (filePath.includes('node_modules')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const replaced = content.replace(FIND_PATTERN, REPLACE_WITH);

  if (content !== replaced) {
    fs.writeFileSync(filePath, replaced, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file === 'node_modules' || file.startsWith('.')) return;
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
}

// 🔍 Start scanning from the current working directory
walk(process.cwd());
