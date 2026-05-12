import postgres from 'postgres';
import fs from 'fs';

const sql = postgres('postgresql://postgres:Swathireddy@218@db.sxmtcytfvulqevyzfjbz.supabase.co:5432/postgres', {
  ssl: 'require',
  max: 1
});

async function run() {
  try {
    const schema = fs.readFileSync('db/schema.sql', 'utf8');
    await sql.unsafe(schema);
    console.log('Schema executed successfully.');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await sql.end();
  }
}

run();
