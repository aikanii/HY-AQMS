tconst fs = require('fs');
const path = require('path');

const applyReplacements = (content) => {
  let res = content;

  // Text colors
  res = res.replace(/color: 'white'/g, "color: 'var(--text)'");
  res = res.replace(/color: '#fff'/g, "color: 'var(--text)'");
  res = res.replace(/color: '#ffffff'/gi, "color: 'var(--text)'");
  res = res.replace(/color: "white"/g, "color: 'var(--text)'");
  res = res.replace(/color:\s*'rgba\(255,\s*255,\s*255,\s*0\.[34567]\)'/g, "color: 'var(--text-dim)'");
  res = res.replace(/color:\s*`rgba\(255,255,255,\s*\$\{.*?\}`/g, "color: 'var(--text-dim)'"); // simplified

  // Backgrounds with white or black alpha
  res = res.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.0[345]\)'/g, "background: 'var(--overlay-bg)'");
  res = res.replace(/background:\s*'rgba\(255,\s*255,\s*255,\s*0\.1[025]?\)'/g, "background: 'var(--overlay-bg-hover)'");
  res = res.replace(/background:\s*'rgba\(0,\s*0,\s*0,\s*0\.[245]\)'/g, "background: 'var(--panel)'");

  // Borders
  res = res.replace(/border(Top|Bottom|Left|Right)?:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.[01][0-9]?\)'/g, "border$1: '1px solid var(--border)'");
  res = res.replace(/border(Top|Bottom|Left|Right)?:\s*'1px solid rgba\(0,\s*0,\s*0,\s*[0-9.]+\)'/g, "border$1: '1px solid var(--border)'");

  // Box shadows
  res = res.replace(/boxShadow:\s*'[^']*rgba\(0,\s*0,\s*0,\s*[0-9.]+\)'/g, "boxShadow: '0 4px 15px var(--shadow)'");

  return res;
}

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/user/Documents/HY-AQMS/frontend/src/components');
files.push('c:/Users/user/Documents/HY-AQMS/frontend/src/App.jsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = applyReplacements(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Replaced in ${file}`);
  }
}
