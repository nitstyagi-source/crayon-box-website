const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function resetEntireErpToPureZero() {
  console.log('================================================================================');
  console.log(' 🚨 EXECUTING COMPLETE SYSTEM RESET: OPTION B (PURE ZERO)');
  console.log('================================================================================\n');

  await client.connect();

  console.log('Step 1: Disabling foreign key constraints temporarily...');
  await client.query("SET session_replication_role = 'replica';");

  // Fetch list of all user tables in public schema
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const allPublicTables = tablesRes.rows.map(r => r.table_name);
  console.log(`Found ${allPublicTables.length} total public tables.`);

  // Tables that should NOT be fully truncated (we keep Super Admin in staff)
  const preservedTables = ['staff'];

  console.log('\nStep 2: Truncating all public database tables...');
  let truncatedCount = 0;
  for (const tableName of allPublicTables) {
    if (preservedTables.includes(tableName)) continue;
    try {
      await client.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      truncatedCount++;
    } catch (err) {
      try {
        await client.query(`DELETE FROM "${tableName}";`);
        truncatedCount++;
      } catch (e) {
        console.log(`  Could not truncate ${tableName}: ${e.message}`);
      }
    }
  }
  console.log(`✓ Truncated ${truncatedCount} public tables.`);

  console.log('\nStep 3: Resetting Staff table to preserve ONLY Super Admin...');
  // Delete all staff EXCEPT Nitin Tyagi
  await client.query(`
    DELETE FROM staff 
    WHERE email != 'nits.tyagi@gmail.com' 
      AND official_email != 'chairman@crayonboxschool.com' 
      AND phone_number != '9911102027' 
      AND id != 'a96ca895-7773-48e1-9181-e5fe36551627';
  `);

  // Ensure Nitin Tyagi has clean Super Admin status and campus_id is null
  await client.query(`
    UPDATE staff 
    SET campus_id = NULL,
        role = 'SUPER_ADMIN',
        designation = 'Chairman & Managing Trustee',
        emergency_login_pin = '100800',
        phone_number = '9911102027',
        official_email = 'chairman@crayonboxschool.com',
        email = 'nits.tyagi@gmail.com',
        first_name = 'Nitin',
        last_name = 'Tyagi'
    WHERE email = 'nits.tyagi@gmail.com' 
       OR official_email = 'chairman@crayonboxschool.com'
       OR phone_number = '9911102027';
  `);
  console.log('✓ Staff table cleaned. Exactly 1 Super Admin preserved with PIN: 100800.');

  console.log('\nStep 4: Cleaning auth.users in Supabase auth schema...');
  try {
    const authDeleteRes = await client.query(`
      DELETE FROM auth.users 
      WHERE email != 'nits.tyagi@gmail.com' 
        AND id != '3e7a6538-17db-4cb4-8ffe-1a2ebb022091';
    `);
    console.log(`✓ Purged mock users from auth.users. Preserved Super Admin Nitin Tyagi.`);
  } catch (e) {
    console.log(`  auth.users notice: ${e.message}`);
  }

  console.log('\nStep 5: Re-enabling foreign key constraints...');
  await client.query("SET session_replication_role = 'default';");

  console.log('\nStep 6: Running VACUUM ANALYZE to optimize storage...');
  try {
    await client.query("VACUUM ANALYZE;");
  } catch (e) {
    // Vacuum in transaction block or pooler might be ignored
  }

  console.log('\n================================================================================');
  console.log(' ✅ PURE ZERO ERP RESET COMPLETE');
  console.log('================================================================================\n');

  // Verify Super Admin
  const finalStaff = await client.query('SELECT id, first_name, last_name, role, designation, phone_number, email, emergency_login_pin, campus_id FROM staff;');
  console.log('Remaining Staff:', finalStaff.rows);

  const finalAuth = await client.query('SELECT id, email, phone FROM auth.users;');
  console.log('Remaining Auth Users:', finalAuth.rows);

  const finalInstitutions = await client.query('SELECT COUNT(*) FROM institutions;');
  console.log('Institutions count:', finalInstitutions.rows[0].count);

  const finalCampuses = await client.query('SELECT COUNT(*) FROM campuses;');
  console.log('Campuses count:', finalCampuses.rows[0].count);

  const finalStudents = await client.query('SELECT COUNT(*) FROM students;');
  console.log('Students count:', finalStudents.rows[0].count);

  const finalCameras = await client.query('SELECT COUNT(*) FROM cameras;');
  console.log('Cameras count:', finalCameras.rows[0].count);

  const finalInvoices = await client.query('SELECT COUNT(*) FROM student_invoices;');
  console.log('Student Invoices count:', finalInvoices.rows[0].count);

  await client.end();
}

resetEntireErpToPureZero().catch(err => {
  console.error('Fatal reset error:', err);
  process.exit(1);
});
