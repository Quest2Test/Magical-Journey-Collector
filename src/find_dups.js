const fs = require('fs');
const content = fs.readFileSync('src/lib/franchises.ts', 'utf8');

function findDups(objName) {
    const regex = new RegExp(`const ${objName}: Record<string, string> = {([\\s\\S]+?)};`, 'g');
    const match = regex.exec(content);
    if (!match) return [];
    
    const lines = match[1].split('\n');
    const seen = new Map();
    const dups = [];
    
    lines.forEach((line, index) => {
        const keyMatch = line.match(/^\s*\"(.+?)\":/);
        if (keyMatch) {
            const key = keyMatch[1];
            if (seen.has(key)) {
                dups.push({ key, line: index + 1, prevLine: seen.get(key) });
            }
            seen.set(key, index + 1);
        }
    });
    return dups;
}

console.log('Duplicates in franchiseMap:', findDups('franchiseMap'));
console.log('Duplicates in partialMatches:', findDups('partialMatches'));
