import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`
    SELECT slot, video_url, is_active
    FROM video_scripts
    WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'demo')
  `
  console.log(JSON.stringify(rows, null, 2))
}

main()
