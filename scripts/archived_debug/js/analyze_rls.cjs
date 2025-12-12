const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\ok\\Downloads\\google';
const supabaseDir = path.join(rootDir, 'supabase');

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
// Also include root level sql files
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.sql')).map(f => path.join(rootDir, f));
const allFiles = [...files, ...rootFiles];

const createdTables = new Set();
const rlsEnabledTables = new Set();
const permissivePolicies = [];

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Find created tables
    // Improved regex to handle various casing and spacing
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
    // Look for policies that explicitly allow everything
    const policyRegex = /create\s+policy\s+"([^"]+)"\s+on\s+(?:public\.)?([a-zA-Z0-9_]+)(?:[^;]+)(?:using\s*\(([^)]+)\))?(?:\s*with\s+check\s*\(([^)]+)\))?/gi;
    while ((match = policyRegex.exec(content)) !== null) {
        const policyName = match[1];
        const tableName = match[2];
        const using = match[3];
        const withCheck = match[4];

        // Check for true, 1=1, or 'true' (string)
        const isPermissive = (val) => {
            if (!val) return false;
            const v = val.trim().toLowerCase();
            return v === 'true' || v === '1=1' || v === "'true'";
        };

        if (isPermissive(using) || isPermissive(withCheck)) {
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
