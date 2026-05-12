import postgres from 'postgres';
const sql = postgres('postgresql://postgres:Swathireddy@218@db.sxmtcytfvulqevyzfjbz.supabase.co:5432/postgres');
async function run() {
  const docs = await sql`SELECT id, name, file_url FROM documents LIMIT 5`;
  console.log(docs);
  process.exit(0);
}
run();
