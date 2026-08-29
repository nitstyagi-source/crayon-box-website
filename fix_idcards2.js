const fs = require('fs');

// Fix StudentIDCard
let studentCode = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/StudentIDCard.tsx', 'utf8');
studentCode = studentCode.replace(/<StudentQRCode payload=\{idNo\} size=\{65\} color="#000000" \/>/g, "<StudentQRCode payload={idNo} size={65} />");
fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/StudentIDCard.tsx', studentCode);

// Fix TeacherIDCard
let teacherCode = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/TeacherIDCard.tsx', 'utf8');
teacherCode = teacherCode.replace(/export function TeacherIDCard\(\{ t, schoolInfo = \{\}, isBack = false \}: TeacherIDCardProps\) \{/g, "export function TeacherIDCard({ teacher, faculty, schoolInfo = {}, isBack = false, layoutMode }: TeacherIDCardProps) {");
// Ensure it has faculty in destructuring
teacherCode = teacherCode.replace(/\{ teacher, schoolInfo = \{\}, isBack = false \}/g, "{ teacher, faculty, schoolInfo = {}, isBack = false }");

fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/src/components/id-cards/TeacherIDCard.tsx', teacherCode);

console.log("ID Cards fixed 2");
