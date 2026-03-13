import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8700'
  const videoUrl = `${appUrl}/HorecaAS1.mp4`

  // Update alle video scripts van restaurant 'demo' naar deze video
  const result = await sql`
    UPDATE video_scripts
    SET video_url = ${videoUrl}, is_active = true
    WHERE restaurant_id = (
      SELECT id FROM restaurants WHERE slug = 'demo'
    )
  `

  console.log(`Video URL ingesteld op: ${videoUrl}`)
  console.log(`${result.length} script(s) bijgewerkt`)
}

main()
