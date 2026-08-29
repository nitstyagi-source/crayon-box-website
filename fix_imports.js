const fs = require('fs');

function removeDuplicateImport(file) {
  let code = fs.readFileSync(file, 'utf8');
  let count = 0;
  code = code.replace(/import \{ useInstitution \} from ["']@\/components\/providers\/InstitutionContext["'];/g, (match) => {
    count++;
    if (count > 1) return '';
    return match;
  });
  fs.writeFileSync(file, code);
}

removeDuplicateImport('/Users/vaani/Desktop/crayon box/web/src/app/admin/finance/generate/page.tsx');
removeDuplicateImport('/Users/vaani/Desktop/crayon box/web/src/app/admin/finance/receipts/page.tsx');
