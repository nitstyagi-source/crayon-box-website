const fs = require('fs');
const path = require('path');

const financeCorePath = '/Users/vaani/Desktop/crayon box/web/src/app/actions/finance-core.ts';
let code = fs.readFileSync(financeCorePath, 'utf8');

// 1. Replace campus_id with institution_code
code = code.replace(/campus_id/g, 'institution_code');

// 2. Replace resolveCampusId with resolveInstitutionCode
code = code.replace(/resolveCampusId/g, 'resolveInstitutionCode');

// 3. Redefine resolveInstitutionCode properly
code = code.replace(
  /async function resolveInstitutionCode\(supabase: any, institutionCode\?: string\): Promise<string> \{[\s\S]*?\n\}/m,
  `function resolveInstitutionCode(supabase: any, institutionCode?: string): string {
  return institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
}`
);

// 4. Fix any awaits on resolveInstitutionCode (since it's now synchronous)
code = code.replace(/await resolveInstitutionCode/g, 'resolveInstitutionCode');

fs.writeFileSync(financeCorePath, code);

// Now update all UI pages in /admin/finance
const uiDir = '/Users/vaani/Desktop/crayon box/web/src/app/admin/finance';
function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let uiCode = fs.readFileSync(fullPath, 'utf8');
      
      // Replace CampusContext imports with InstitutionContext
      uiCode = uiCode.replace(/import \{ useCampusContext \} from ["']@\/components\/providers\/CampusProvider["'];/g, 
        `import { useInstitution } from "@/components/providers/InstitutionContext";`);
      
      // Replace useCampusContext call
      uiCode = uiCode.replace(/const \{ activeCampusId \} = useCampusContext\(\);/g,
        `const { currentInstitution } = useInstitution();`);
        
      // Also catch if they already have useInstitution imported and we just need to add currentInstitution, 
      // but usually the simple replace works if we just do string replacement
      uiCode = uiCode.replace(/activeCampusId/g, 'currentInstitution');

      fs.writeFileSync(fullPath, uiCode);
    }
  }
}
processDir(uiDir);

console.log("Refactoring complete");
