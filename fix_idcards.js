const fs = require('fs');

// Fix StudentIDCard
let studentCode = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/StudentIDCard.tsx', 'utf8');
studentCode = studentCode.replace(/import \{ User, Calendar,/g, "import { User, Calendar, Globe,");
studentCode = studentCode.replace(/value=\{idNo\}/g, "payload={idNo}");
studentCode = studentCode.replace(/schoolInfo\?: any;\n  isBack\?: boolean;/g, 'schoolInfo?: any;\n  isBack?: boolean;\n  layoutMode?: any;');
fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/StudentIDCard.tsx', studentCode);

// Fix TeacherIDCard
let teacherCode = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/TeacherIDCard.tsx', 'utf8');
teacherCode = teacherCode.replace(/import \{ User, Briefcase,/g, "import { User, Briefcase, Globe,");
teacherCode = teacherCode.replace(/value=\{idNo\}/g, "payload={idNo}");
teacherCode = teacherCode.replace(/teacher: any;/g, 'teacher?: any;\n  faculty?: any;\n  layoutMode?: any;');
teacherCode = teacherCode.replace(/const name = \`\$\{teacher\.first_name/g, 'const t = teacher || faculty || {};\n  const name = `${t.first_name');
teacherCode = teacherCode.replace(/teacher\./g, 't.');
fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/TeacherIDCard.tsx', teacherCode);

console.log("ID Cards fixed");
