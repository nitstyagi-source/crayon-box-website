const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initBirthdayDb() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS birthday_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
      enable_student_birthdays BOOLEAN DEFAULT true,
      enable_teacher_birthdays BOOLEAN DEFAULT true,
      show_on_dashboard BOOLEAN DEFAULT true,
      show_in_calendar BOOLEAN DEFAULT true,
      allow_birthday_wishes BOOLEAN DEFAULT true,
      allow_classmates_to_wish BOOLEAN DEFAULT false,
      allow_parents_to_wish BOOLEAN DEFAULT true,
      enable_whatsapp_wishes BOOLEAN DEFAULT true,
      enable_app_notifications BOOLEAN DEFAULT true,
      hide_dob_from_users BOOLEAN DEFAULT true,
      custom_student_message TEXT DEFAULT '🎂 Happy Birthday, {NAME}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉',
      custom_teacher_message TEXT DEFAULT '🎉 Wishing our esteemed educator {NAME} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School!',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_campus_birthday_settings UNIQUE (campus_id)
    );

    CREATE TABLE IF NOT EXISTS birthday_wishes_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
      recipient_type VARCHAR(50) NOT NULL,
      recipient_id UUID NOT NULL,
      recipient_name VARCHAR(150) NOT NULL,
      recipient_class VARCHAR(100),
      sender_id UUID,
      sender_name VARCHAR(150) NOT NULL,
      sender_role VARCHAR(50) NOT NULL,
      wish_message TEXT NOT NULL,
      channel VARCHAR(50) DEFAULT 'App',
      sent_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bday_wish_rec ON birthday_wishes_log(recipient_id, sent_at);
  `);

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  if (campusId) {
    await client.query(`
      INSERT INTO birthday_settings (campus_id, enable_student_birthdays, enable_teacher_birthdays)
      VALUES ($1, true, true)
      ON CONFLICT (campus_id) DO NOTHING;
    `, [campusId]);
  }

  console.log('✅ Created birthday_settings and birthday_wishes_log tables successfully!');
  await client.end();
}

initBirthdayDb().catch(console.error);
