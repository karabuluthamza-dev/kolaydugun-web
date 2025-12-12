const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\ok\\Downloads\\google';
const supabaseDir = path.join(rootDir, 'supabase');
const migrationsDir = path.join(supabaseDir, 'migrations');

function getSqlFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getSqlFiles(file));
        } else {
            if (file.endsWith('.sql')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getSqlFiles(supabaseDir);
// Also include root level sql files just in case
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.sql')).map(f => path.join(rootDir, f));
const allFiles = [...files, ...rootFiles];

const createdTables = new Set();
const rlsEnabledTables = new Set();
const permissivePolicies = [];

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Find created tables
    const createTableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
    let match;
    while ((match = createTableRegex.exec(content)) !== null) {
        createdTables.add(match[1].toLowerCase());
    }

    // Find RLS enabled tables
    const rlsRegex = /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+enable\s+row\s+level\s+security/gi;
    while ((match = rlsRegex.exec(content)) !== null) {
        rlsEnabledTables.add(match[1].toLowerCase());
    }

    // Find permissive policies
    const policyRegex = /create\s+policy\s+"([^"]+)"\s+on\s+(?:public\.)?([a-zA-Z0-9_]+)(?:[^;]+)(?:using\s*\(([^)]+)\))?(?:\s*with\s+check\s*\(([^)]+)\))?/gi;
    while ((match = policyRegex.exec(content)) !== null) {
        const policyName = match[1];
        const tableName = match[2];
        const using = match[3];
        const withCheck = match[4];

        if ((using && (using.trim() === 'true' || using.trim() === '1=1')) ||
            (withCheck && (withCheck.trim() === 'true' || withCheck.trim() === '1=1'))) {
            permissivePolicies.push({
                file: path.basename(file),
                table: tableName,
                policy: policyName,
                using,
                withCheck
            });
        }
    }
});

const tablesWithoutRLS = [...createdTables].filter(t => !rlsEnabledTables.has(t));

console.log('Tables without RLS enabled:');
tablesWithoutRLS.forEach(t => console.log(`- ${t}`));

console.log('\nPermissive Policies (potential security risks):');
permissivePolicies.forEach(p => {
    console.log(`- Table: ${p.table}, Policy: "${p.policy}" in ${p.file}`);
    if (p.using) console.log(`  USING: ${p.using}`);
    if (p.withCheck) console.log(`  WITH CHECK: ${p.withCheck}`);
});
