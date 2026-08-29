const fs = require('fs');
const path = require('path');

const financeCorePath = '/Users/vaani/Desktop/crayon box/web/src/app/actions/finance-core.ts';
let code = fs.readFileSync(financeCorePath, 'utf8');

// Fix 'campusId' -> 'institutionCode' where it was missed
code = code.replace(/\bcampusId\b/g, 'institutionCode');

fs.writeFileSync(financeCorePath, code);

// Fix UI files
const uiDir = '/Users/vaani/Desktop/crayon box/web/src/app/admin/finance';
function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let uiCode = fs.readFileSync(fullPath, 'utf8');
      
      // Remove duplicate imports
      uiCode = uiCode.replace(/import \{ useInstitution \} from ["']@\/components\/providers\/InstitutionContext["'];\nimport \{ useInstitution \} from ["']@\/components\/providers\/InstitutionContext["'];/g, 
        `import { useInstitution } from "@/components/providers/InstitutionContext";`);
        
      // Replace campus_id with institution_code in payloads
      uiCode = uiCode.replace(/campus_id:/g, 'institution_code:');

      fs.writeFileSync(fullPath, uiCode);
    }
  }
}
processDir(uiDir);

// Fix test script
let testCode = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/scripts/test-single-invoice-student-selection.ts', 'utf8');
testCode = testCode.replace(/campus_id:/g, 'institution_code:');
fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/scripts/test-single-invoice-student-selection.ts', testCode);

console.log("Fixes complete");
