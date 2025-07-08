const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'pages');
const excluded = ['login.tsx', '_app.tsx', '_document.tsx'];

function pageTitleFromFilename(filename) {
  return filename
    .replace('.tsx', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function previewChanges(filePath) {
  const fileName = path.basename(filePath);
  if (excluded.includes(fileName)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  const layoutRegex = /<Layout(?!(\s|.)*pageTitle=)/;
  if (!layoutRegex.test(content)) return;

  const title = pageTitleFromFilename(fileName.replace('.tsx', ''));
  const updated = content.replace(/<Layout/g, `<Layout pageTitle="${title}"`);

  const exportRegex = /export\s+default\s+([A-Za-z0-9_]+)/;
  const match = updated.match(exportRegex);
  if (!match || updated.includes(`${match[1]}.pageTitle =`)) return;

  console.log(`\n🔍 Preview: ${filePath}`);
  console.log(`--------------------------------------`);
  console.log(`Will add: pageTitle="${title}"`);
  console.log(`Will append:\n${match[1]}.pageTitle = '${title}';\nexport default ${match[1]};`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      previewChanges(fullPath);
    }
  }
}

walkDir(pagesDir);
