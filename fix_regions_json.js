import { readFileSync, writeFileSync } from 'fs';
const path = 'data/regions.json';

try {
  let content = readFileSync(path, 'utf8');

  // Find the first { and the last }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Could not find GeoJSON object boundaries.');
  }

  content = content.substring(firstBrace, lastBrace + 1);

  // Still use eval to handle potential JS-isms like unquoted keys or trailing commas safely
  const regionsObj = eval('(' + content + ')');

  // Stringify to standard JSON format
  const jsonContent = JSON.stringify(regionsObj, null, 2);

  writeFileSync(path, jsonContent);
  console.log('Successfully converted regions.json to valid JSON.');
} catch (error) {
  console.error('Error processing regions.json:', error);
  process.exit(1);
}
