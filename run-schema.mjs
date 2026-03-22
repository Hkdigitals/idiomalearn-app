import pg from 'pg';
import fs from 'fs';

// Connection string: postgresql://postgres:password@host:port/database
// We need to encode the password due to special characters.
// Password is likely "@V4etiv#PbWy_3i" based on user input (ignoring the erroneous space).
const pw = encodeURIComponent("@V4etiv#PbWy_3i");
const connectionString = `postgresql://postgres:${pw}@db.oavtuhxptjvmkcxuimcl.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");
    
    let sql = fs.readFileSync('supabase-schema.sql', 'utf8');
    console.log("Read supabase-schema.sql. Executing queries...");
    
    // Some schemas might need to be split, but pg can execute multiple queries 
    // in one go if they don't contain conflicting transactions or syntax errors
    await client.query(sql);
    
    console.log("Successfully executed supabase-schema.sql!");
  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

run();
