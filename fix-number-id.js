const fs = require('fs');
const path = require('path');

const TARGET_REGEX = /Number\(([^)]+)\)\.id/g;
const FIXED_REPLACEMENT = 'Number($1)';

function processFile(filePath) {
  if (filePath.includes('node_modules')) return; // skip node_modules

  const original = fs.readFileSync(filePath, 'utf8');
  const fixed = original.replace(TARGET_REGEX, FIXED_REPLACEMENT);

  if (original !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file === 'node_modules' || file.startsWith('.')) continue;
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

// 🔄 Start from current working directory
walk(process.cwd());
