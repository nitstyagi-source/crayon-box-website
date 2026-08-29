const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const DATABASE_URL = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function deployAuthSchema() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('🔗 Connected to PostgreSQL for Schema Deployment...');

  try {
    // 1. Core Auth & RBAC Tables
    console.log('📦 Creating Auth & RBAC Schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        full_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'SUSPENDED', 'DISABLED')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.roles (
        code VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS public.permissions (
        code VARCHAR(100) PRIMARY KEY,
        description TEXT,
        module VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS public.role_permissions (
        role_code VARCHAR(50) REFERENCES public.roles(code) ON DELETE CASCADE,
        permission_code VARCHAR(100) REFERENCES public.permissions(code) ON DELETE CASCADE,
        PRIMARY KEY (role_code, permission_code)
      );

      CREATE TABLE IF NOT EXISTS public.user_role_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
        role_code VARCHAR(50) REFERENCES public.roles(code) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, role_code)
      );

      CREATE TABLE IF NOT EXISTS public.user_institution_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
        institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
        granted_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, institution_id)
      );

      CREATE TABLE IF NOT EXISTS public.login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        device_info TEXT,
        ip_address VARCHAR(45),
        login_time TIMESTAMPTZ DEFAULT NOW(),
        status VARCHAR(20)
      );
    `);

    // 2. Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await client.query(`
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_institution_access ENABLE ROW LEVEL SECURITY;

      -- Create generic policies (Admins see all, users see themselves)
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
          CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = id);
        END IF;
      END $$;
    `);

    // 3. Create Super Admin User via Supabase Auth
    console.log('👤 Creating Super Admin User in Supabase Auth...');
    const { data: adminAuth, error: authError } = await supabase.auth.admin.createUser({
      email: 'nits.tyagi@gmail.com',
      password: 'CrayonBoxAdmin@2026!',
      email_confirm: true,
      user_metadata: { full_name: 'Nitin Tyagi' }
    });

    if (authError && authError.message !== 'A user with this email address has already been registered') {
      throw authError;
    }

    let adminId;
    if (authError && authError.message === 'A user with this email address has already been registered') {
       console.log('User already exists, fetching via SQL...');
       const res = await client.query(`SELECT id FROM auth.users WHERE email = 'nits.tyagi@gmail.com'`);
       adminId = res.rows[0].id;

    } else {
       adminId = adminAuth.user.id;
    }

    // 4. Seed Initial Roles & Permissions
    console.log('🔑 Seeding Roles & Super Admin Assignment...');
    await client.query(`
      INSERT INTO public.roles (code, name, description, is_system)
      VALUES 
        ('SUPER_ADMIN', 'Super Admin', 'Full system access', true),
        ('TRUST_ADMIN', 'Trust Admin', 'Trust level management', true),
        ('PRINCIPAL', 'Principal', 'Institution head', true),
        ('TEACHER', 'Teacher', 'Faculty member', true),
        ('PARENT', 'Parent', 'Student guardian', true),
        ('STUDENT', 'Student', 'Enrolled student', true),
        ('DRIVER', 'Driver', 'Transport staff', true)
      ON CONFLICT (code) DO NOTHING;
    `);
    
    await client.query(`
      INSERT INTO public.user_profiles (id, email, full_name)
      VALUES ($1, 'nits.tyagi@gmail.com', 'Nitin Tyagi')
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
    `, [adminId]);

    await client.query(`
      INSERT INTO public.user_role_assignments (user_id, role_code)
      VALUES ($1, 'SUPER_ADMIN')
      ON CONFLICT (user_id, role_code) DO NOTHING;
    `, [adminId]);

    // Give Super Admin access to ALL institutions
    await client.query(`
      INSERT INTO public.user_institution_access (user_id, institution_id)
      SELECT $1, id FROM public.institutions
      ON CONFLICT (user_id, institution_id) DO NOTHING;
    `, [adminId]);

    console.log('✅ Deployment Complete! Super Admin account provisioned.');
  } catch (err) {
    console.error('❌ Error during schema deployment:', err);
  } finally {
    await client.end();
  }
}

deployAuthSchema();
