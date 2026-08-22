const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://zvavbkbzdkmshslbswnu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YXZia2J6ZGttc2hzbGJzd251Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM2OTc4MywiZXhwIjoyMTAyOTQ1NzgzfQ.rOFcoRrEynq7Cq79rOljZ8Hg21ECoPdmyp3KHX1awGQ'
);

async function run() {
  // Use direct REST endpoint for DDL via pg functions
  const sql = [
    "CREATE TABLE IF NOT EXISTS vendor_invoices (",
    "  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,",
    "  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,",
    "  invoice_id text NOT NULL DEFAULT '',",
    "  vendor_name text NOT NULL DEFAULT '',",
    "  vendor_address text NOT NULL DEFAULT '',",
    "  amount numeric NOT NULL DEFAULT 0,",
    "  status text NOT NULL DEFAULT 'Confirmed',",
    "  proof_hash text,",
    "  contract_address text,",
    "  created_at timestamptz DEFAULT now()",
    ");"
  ].join('\n');

  // Try to insert a dummy to test if table exists
  const { error: testError } = await sb.from('vendor_invoices').select('id').limit(1);
  if (!testError) {
    console.log('vendor_invoices table already exists — OK');
    return;
  }

  console.log('Table does not exist, attempting to create...');
  const pg = require('pg');
  const pool = new pg.Pool({
    host: 'db.zvavbkbzdkmshslbswnu.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '1912Divyanshu@',
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    await client.query(sql);
    await client.query(`ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      CREATE POLICY "Users see own invoices" ON vendor_invoices
        FOR ALL USING (auth.uid() = user_id);
    `);
    console.log('vendor_invoices table created with RLS!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
