const fs = require('fs');
try {
  const content = fs.readFileSync('data/regions.js', 'utf8');
  // Assuming the file looks like `const regions = { ... };`
  // We'll strip the prefix `const regions = ` and suffix `;` or similar.
  // Using a regex to maximize robustness
  const jsonStr = content.replace(/^const\s+\w+\s*=\s*/, '').replace(/;?\s*$/, '');
  
  // Using eval as it might contain JS objects (keys without quotes)
  const regions = eval('(' + jsonStr + ')');
  
  if (regions.features) {
    console.log(`Region Count: ${regions.features.length}`);
    regions.features.forEach((f, i) => {
        console.log(`Region ${i}: ${f.properties.name || f.properties.ADM1_EN || 'Unknown'}`);
    });
  } else {
    console.log('No features found.');
  }

} catch (e) {
  console.error(e);
}
