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
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.sql')).map(f => path.join(rootDir, f));
const allFiles = [...files, ...rootFiles];

const tables = {}; // tableName -> { rlsEnabled: false, policies: [] }

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Find created tables
    const createTableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
    let match;
    while ((match = createTableRegex.exec(content)) !== null) {
        const tableName = match[1].toLowerCase();
        if (!tables[tableName]) {
            tables[tableName] = { rlsEnabled: false, policies: [], file: path.basename(file) };
        }
    }

    // Find RLS enabled tables
    const rlsRegex = /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+enable\s+row\s+level\s+security/gi;
    while ((match = rlsRegex.exec(content)) !== null) {
        const tableName = match[1].toLowerCase();
        if (tables[tableName]) {
            tables[tableName].rlsEnabled = true;
        } else {
            // Table might be created in another file or implicitly
            tables[tableName] = { rlsEnabled: true, policies: [], file: path.basename(file) };
        }
    }

    // Find policies
    const policyRegex = /create\s+policy\s+"([^"]+)"\s+on\s+(?:public\.)?([a-zA-Z0-9_]+)\s+(?:for\s+([a-z]+)\s+)?(?:to\s+([a-z0-9_, ]+)\s+)?(?:using\s*\(([^)]+)\))?(?:\s*with\s+check\s*\(([^)]+)\))?/gi;
    while ((match = policyRegex.exec(content)) !== null) {
        const policyName = match[1];
        const tableName = match[2].toLowerCase();
        const command = match[3] || 'ALL'; // SELECT, INSERT, UPDATE, DELETE, ALL
        const roles = match[4] || 'public'; // public, authenticated, anon, etc.
        const using = match[5];
        const withCheck = match[6];

        if (tables[tableName]) {
            tables[tableName].policies.push({
                name: policyName,
                command,
                roles,
                using,
                withCheck,
                file: path.basename(file)
            });
        }
    }
});

console.log('--- Analysis Results ---');

// 1. Tables without RLS enabled
const noRls = Object.keys(tables).filter(t => !tables[t].rlsEnabled);
if (noRls.length > 0) {
    console.log('\n[CRITICAL] Tables without RLS enabled:');
    noRls.forEach(t => console.log(`- ${t} (found in ${tables[t].file})`));
} else {
    console.log('\n[OK] All identified tables have RLS enabled.');
}

// 2. Tables with RLS enabled but NO policies (Default Deny - might be intended, but worth checking)
const rlsNoPolicies = Object.keys(tables).filter(t => tables[t].rlsEnabled && tables[t].policies.length === 0);
if (rlsNoPolicies.length > 0) {
    console.log('\n[WARNING] Tables with RLS enabled but NO policies (Default Deny):');
    rlsNoPolicies.forEach(t => console.log(`- ${t}`));
}

// 3. Permissive Policies (Public Write Access)
console.log('\n[WARNING] Potentially permissive policies (Public Write Access):');
Object.keys(tables).forEach(t => {
    tables[t].policies.forEach(p => {
        const isPublic = p.roles.includes('public') || p.roles.includes('anon');
        const isWrite = ['INSERT', 'UPDATE', 'DELETE', 'ALL'].includes(p.command.toUpperCase());

        if (isPublic && isWrite) {
            // Check if it's truly open (e.g. using true)
            // But even if it has conditions, public write is risky.
            console.log(`- Table: ${t}, Policy: "${p.name}", Command: ${p.command}, Roles: ${p.roles}`);
        }
    });
});
