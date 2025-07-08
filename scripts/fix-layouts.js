const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'pages/usage.tsx', title: 'Usage Report', exportName: 'UsagePage' },
  { file: 'pages/dashboard.tsx', title: 'Dashboard', exportName: 'Dashboard' },
  { file: 'pages/admin/users.tsx', title: 'ManageUsersPage', exportName: 'ManageUsersPage' },
];

for (const { file, title, exportName } of targets) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`❌ File not found: ${file}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let updated = false;

  // Fix Layout usage: add pageTitle prop if missing
  content = content.replace(/<Layout\s*>/g, `<Layout pageTitle="${title}">`);

  // Add pageTitle assignment if missing
  const pageTitleRegex = new RegExp(`${exportName}\\.pageTitle\\s*=`);
  if (!pageTitleRegex.test(content)) {
    content += `\n\n${exportName}.pageTitle = '${title}';\n`;
    updated = true;
  }

  // Add export default if missing
  const exportRegex = new RegExp(`export default\\s+${exportName}`);
  if (!exportRegex.test(content)) {
    // Look for function declaration or const assignment for exportName
    const funcDeclRegex = new RegExp(`function\\s+${exportName}\\s*\\(`);
    const constDeclRegex = new RegExp(`const\\s+${exportName}\\s*=`);
    if (funcDeclRegex.test(content) || constDeclRegex.test(content)) {
      content += `\nexport default ${exportName};\n`;
      updated = true;
    } else {
      console.warn(`❌ Could not find function or const declaration for ${exportName} in ${file}`);
    }
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`ℹ️ No update needed: ${file}`);
  }
}
