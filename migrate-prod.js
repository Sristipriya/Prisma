const { Client } = require('pg');

const client = new Client({
  host: 'db.zvavbkbzdkmshslbswnu.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '1912Divyanshu@',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to Supabase Postgres');

  try {
    // 1. Create profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        role TEXT NOT NULL CHECK (role IN ('employer', 'employee')),
        full_name TEXT,
        shielded_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      -- Profiles policies
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
      CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
      CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
      
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    `);
    console.log('Profiles table created/updated');

    // 2. Update payroll_streams table
    // We need to add columns safely without breaking existing data
    await client.query(`
      ALTER TABLE public.payroll_streams 
      ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.profiles(id),
      ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 2592000, -- 30 days default
      ADD COLUMN IF NOT EXISTS withdrawn_amount NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ DEFAULT NOW();
    `);
    console.log('payroll_streams updated');

    // 3. Drop and recreate policy for payroll_streams to allow both employer and employee to view
    await client.query(`
      DROP POLICY IF EXISTS "Users see own streams" ON payroll_streams;
      
      CREATE POLICY "Users see related streams" ON payroll_streams 
      FOR SELECT USING (auth.uid() = user_id OR auth.uid() = employee_id);
      
      DROP POLICY IF EXISTS "Users can insert own streams" ON payroll_streams;
      CREATE POLICY "Users can insert own streams" ON payroll_streams 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can update related streams" ON payroll_streams;
      CREATE POLICY "Users can update related streams" ON payroll_streams 
      FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = employee_id);
    `);
    console.log('payroll_streams policies updated');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
