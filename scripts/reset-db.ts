import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!)
  await sql`DROP SCHEMA public CASCADE`
  await sql`CREATE SCHEMA public`
  await sql`GRANT ALL ON SCHEMA public TO neondb_owner`
  await sql`GRANT ALL ON SCHEMA public TO public`
  console.log('Database reset done.')
}

main()
