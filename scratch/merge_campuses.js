const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function mergeCampuses() {
  await client.connect();

  const c1 = 'c3d782a9-a50b-4708-a3fc-6b146f456662'; // Primary Campus with 303 students & 29 staff
  const c2 = '7d27e40f-9f5d-4b36-a2d1-50e735a93b51'; // Duplicate Campus

  console.log('Merging duplicate campus references from', c2, 'to', c1);

  // Update any potential references in classes, students, staff, enquiries
  await client.query(`UPDATE public.classes SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);
  await client.query(`UPDATE public.students SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);
  await client.query(`UPDATE public.staff SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);
  await client.query(`UPDATE public.enquiries SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);
  await client.query(`UPDATE public.staff_attendance_logs SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);
  await client.query(`UPDATE public.student_attendance_records SET campus_id = $1 WHERE campus_id = $2`, [c1, c2]);

  // Remove the duplicate campus row so only 1 single unified campus exists in the entire system!
  await client.query(`DELETE FROM public.campuses WHERE id = $1`, [c2]);

  // Ensure primary campus has full official details
  await client.query(`
    UPDATE public.campuses 
    SET name = 'Crayon Box School (Main Campus)',
        address = 'Burari, Sant Nagar, North Delhi - 110084',
        contact_email = 'director@crayonboxschool.com',
        contact_phone = '+919810081008'
    WHERE id = $1
  `, [c1]);

  console.log('Successfully consolidated into 1 unified campus!');
  await client.end();
}

mergeCampuses();
