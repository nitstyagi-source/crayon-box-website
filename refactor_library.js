const fs = require('fs');
const path = require('path');

const libFile = '/Users/vaani/Desktop/crayon box/web/src/app/actions/library.ts';
let code = fs.readFileSync(libFile, 'utf8');

// Replace campus_id with institution_code
code = code.replace(/campus_id/g, 'institution_code');

// Replace campusId parameter with institutionCode
code = code.replace(/\bcampusId\b/g, 'institutionCode');

// In queries where we had `campus_id = $1 OR $1 IS NULL`, now it's `institution_code = $1 OR $1 = 'ALL'`
code = code.replace(/institution_code = \$1 OR \$1 IS NULL/g, "institution_code = $1 OR $1 = 'ALL'");

fs.writeFileSync(libFile, code);

// Now update all UI pages in /admin/library
const uiDir = '/Users/vaani/Desktop/crayon box/web/src/app/admin/library';
function processDir(dir) {
  if (!fs.existsSync(dir)) return;
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
        
      uiCode = uiCode.replace(/activeCampusId/g, 'currentInstitution');
      
      uiCode = uiCode.replace(/campus_id:/g, 'institution_code:');

      fs.writeFileSync(fullPath, uiCode);
    }
  }
}
processDir(uiDir);

// Fix duplicate imports
function removeDuplicateImport(file) {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  let count = 0;
  code = code.replace(/import \{ useInstitution \} from ["']@\/components\/providers\/InstitutionContext["'];/g, (match) => {
    count++;
    if (count > 1) return '';
    return match;
  });
  fs.writeFileSync(file, code);
}
if(fs.existsSync(uiDir)) {
  const files = fs.readdirSync(uiDir);
  for(const f of files) {
    if(f.endsWith('.tsx')) {
       removeDuplicateImport(path.join(uiDir, f));
    }
  }
}
console.log("Library refactoring complete");
