const patterns = [
  /('|"|;|--|\/\*)\s*(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXECUTE|EXEC)\b/gi,
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXECUTE|EXEC)\b\s*('|"|;|--|\/\*|\()/gi,
  /(-{2,}|\/\*[\s\S]*?\*\/)/g,
  /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
  /;\s*(DROP|DELETE|UPDATE|INSERT)\b/gi,
  /\bUNION\b\s+(ALL\s+)?\bSELECT\b/gi,
  /\b(xp_|sp_)\w+/gi,
];
function test(v) { return patterns.some(p => p.test(v)); }

const cases = [
  ['Tours and Adventures', false],
  ['Select your favorite destination', false],
  ['Where the mountains meet the sea', false],
  ['Adventure & Wildlife Tours', false],
  ["' OR 1=1--", true],
  ["'; DROP TABLE users;--", true],
  ['1 UNION SELECT username, password FROM users', true],
  ['1 UNION ALL SELECT username FROM users', true],
  ['Beach Tours', false],
  ['Delicious food and drink guide', false],
  ['Create your own adventure', false],
  ["It's a beautiful and adventurous trip", false],
  ['Union Square walking tour', false],
  ['A Select few destinations we recommend', false],
];

let allPass = true;
for (const [input, expected] of cases) {
  const result = test(input);
  const status = result === expected ? 'PASS' : 'FAIL';
  if (status === 'FAIL') allPass = false;
  console.log(status, JSON.stringify(input), '-> blocked:', result);
}
console.log(allPass ? '\nALL PASS' : '\nSOME FAILED');
