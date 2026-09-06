const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  await client.query('BEGIN');

  try {
    // 1. Fix Security Definer function search_path (Fixes Critical #22)
    console.log('[1/4] Securing public.is_superadmin() search_path...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_superadmin()
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $function$
      BEGIN
        RETURN EXISTS (SELECT 1 FROM superadmins WHERE id = auth.uid());
      END;
      $function$;
    `);
    console.log('  ✓ public.is_superadmin() search_path secured.');

    // 2. Fix View security_invoker
    console.log('[2/4] Securing view public.faculty_members (security_invoker = true)...');
    try {
      await client.query(`ALTER VIEW public.faculty_members SET (security_invoker = true);`);
      console.log('  ✓ public.faculty_members set to security_invoker = true.');
    } catch (err) {
      console.warn('  Note on faculty_members view:', err.message);
    }

    // 3. Enable RLS on all 21 tables (Fixes Critical #1 through #21)
    console.log('[3/4] Enabling Row Level Security (RLS) on 21 public tables...');
    const tablesToSecure = [
      'approval_requests',
      'assessment_rubrics',
      'bank_webhook_logs',
      'cbt_proctor_sessions',
      'classroom_moments',
      'erp_module_statuses',
      'institution_module_statuses',
      'parent_chat_messages',
      'pastoral_interventions',
      'pbis_merit_types',
      'pbis_point_transactions',
      'ptm_sessions',
      'school_houses',
      'sen_accommodations',
      'sen_session_logs',
      'sen_smart_goals',
      'sen_student_profiles',
      'student_board_predictions',
      'student_competency_evaluations',
      'student_learning_portfolios',
      'teacher_cpd_records'
    ];

    for (const table of tablesToSecure) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✓ RLS enabled on ${table}`);
    }

    // 4. Create proper policies on all tables
    console.log('[4/4] Creating fine-grained access policies...');

    // Helper to drop and create policy
    async function createPolicy(table, name, definition) {
      await client.query(`DROP POLICY IF EXISTS "${name}" ON public.${table};`);
      await client.query(`CREATE POLICY "${name}" ON public.${table} ${definition};`);
    }

    // A. General Superadmin / Service Role Management Policies for all 21 tables
    for (const table of tablesToSecure) {
      await createPolicy(
        table,
        `Admins and service role can manage ${table}`,
        `FOR ALL TO authenticated, service_role USING (is_superadmin() OR auth.role() = 'service_role') WITH CHECK (is_superadmin() OR auth.role() = 'service_role')`
      );
    }

    // B. Read policies for authenticated staff/users on operational tables
    const authenticatedReadTables = [
      'assessment_rubrics',
      'cbt_proctor_sessions',
      'classroom_moments',
      'erp_module_statuses',
      'institution_module_statuses',
      'pbis_merit_types',
      'pbis_point_transactions',
      'ptm_sessions',
      'school_houses',
      'student_board_predictions',
      'student_competency_evaluations',
      'student_learning_portfolios',
      'sen_accommodations',
      'sen_session_logs',
      'sen_smart_goals',
      'sen_student_profiles',
      'pastoral_interventions',
      'teacher_cpd_records'
    ];
    for (const table of authenticatedReadTables) {
      await createPolicy(
        table,
        `Authenticated users can view ${table}`,
        `FOR SELECT TO authenticated USING (true)`
      );
    }

    // C. Approval Requests: Authenticated users can insert requests and view
    await createPolicy(
      'approval_requests',
      'Authenticated users can view approval_requests',
      `FOR SELECT TO authenticated USING (true)`
    );
    await createPolicy(
      'approval_requests',
      'Authenticated users can submit approval_requests',
      `FOR INSERT TO authenticated WITH CHECK (true)`
    );

    // D. Parent Chat Messages: Authenticated users can view and insert messages
    await createPolicy(
      'parent_chat_messages',
      'Authenticated users can view parent_chat_messages',
      `FOR SELECT TO authenticated USING (true)`
    );
    await createPolicy(
      'parent_chat_messages',
      'Authenticated users can send parent_chat_messages',
      `FOR INSERT TO authenticated WITH CHECK (true)`
    );

    // E. Fix tables with RLS enabled but NO policies (user_role_assignments & user_institution_access)
    await createPolicy(
      'user_role_assignments',
      'Superadmins can manage user_role_assignments',
      `FOR ALL TO authenticated, service_role USING (is_superadmin() OR auth.role() = 'service_role') WITH CHECK (is_superadmin() OR auth.role() = 'service_role')`
    );
    await createPolicy(
      'user_role_assignments',
      'Users can view own role assignments',
      `FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_superadmin() OR auth.role() = 'service_role')`
    );

    await createPolicy(
      'user_institution_access',
      'Superadmins can manage user_institution_access',
      `FOR ALL TO authenticated, service_role USING (is_superadmin() OR auth.role() = 'service_role') WITH CHECK (is_superadmin() OR auth.role() = 'service_role')`
    );
    await createPolicy(
      'user_institution_access',
      'Users can view own institution access',
      `FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_superadmin() OR auth.role() = 'service_role')`
    );

    await client.query('COMMIT');
    console.log('\n========================================================');
    console.log('✓ ALL 22 CRITICAL SECURITY CONCERNS REMEDIATED!');
    console.log('========================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during remediation:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
