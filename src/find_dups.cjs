const fs = require('fs');
const content = fs.readFileSync('src/lib/franchises.ts', 'utf8');

function checkObject(name, startRegex, endRegex) {
    const match = content.match(new RegExp(startRegex + '([\\s\\S]+?)' + endRegex));
    if (!match) return;
    const body = match[1];
    const keys = body.match(/\"[^\"]+\"(?=:)/g) || [];
    const seen = new Set();
    const dups = [];
    keys.forEach(k => {
        if (seen.has(k)) dups.push(k);
        seen.add(k);
    });
    console.log(`Duplicates in ${name}:`, dups);
}

checkObject('franchiseMap', 'const franchiseMap: Record<string, string> = \\{', '\\};');
checkObject('partialMatches', 'const partialMatches: Record<string, string> = \\{', '\\};');
