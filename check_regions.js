const fs = require('fs');
try {
  const content = fs.readFileSync('data/regions.js', 'utf8');
  // It starts with "const regions = ", strip it.
  const jsonStr = content.replace('const regions = ', '').trim();
  // removing trailing semicolon if present
  const cleanJson = jsonStr.replace(/;$/, '');
  
  // Use Function to avoid syntax errors if it's not pure JSON (though it looks like it)
  // But wait, if it's a JS file with `const regions = {...}`, JSON.parse might fail if keys aren't quoted or if there are trailing commas.
  // Safer to use eval or Function but that's risky.
  // Actually, let's just use `eval`.
  
  const regions = eval(cleanJson);
  console.log(JSON.stringify(regions.features.map(f => f.properties.name), null, 2));
} catch (e) {
  console.error(e);
}
