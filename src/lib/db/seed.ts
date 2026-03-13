import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import {
  users,
  restaurants,
  restaurantMembers,
  menuCategories,
  menuItems,
  tables,
  videoScripts,
} from './schema'
import bcrypt from 'bcryptjs'

neonConfig.fetchConnectionCache = true
const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

export async function main() {
  console.log('Seeding database...')

  // 1. Create restaurant
  const restaurantRows = await db
    .insert(restaurants)
    .values({
      slug: 'demo',
      name: 'Café De Bron',
      tagline: 'Vers & gezellig in het hart van de stad',
      primaryColor: '#003422',
      isOpen: true,
      timezone: 'Europe/Amsterdam',
      plan: 'starter',
    })
    .returning()

  const restaurant = restaurantRows[0]
  if (!restaurant) throw new Error('Restaurant insert mislukt')
  console.log('Restaurant created:', restaurant.id)

  // 2. Create user
  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  const userRows = await db
    .insert(users)
    .values({
      name: 'Demo Eigenaar',
      email: 'demo@horecaai.nl',
      passwordHash,
    })
    .returning()

  const user = userRows[0]
  if (!user) throw new Error('User insert mislukt')
  console.log('User created:', user.id)

  // 3. Create restaurant member (owner)
  const memberRows = await db
    .insert(restaurantMembers)
    .values({
      restaurantId: restaurant.id,
      userId: user.id,
      role: 'owner',
    })
    .returning()

  const member = memberRows[0]
  if (!member) throw new Error('Member insert mislukt')
  console.log('Membership created:', member.id)

  // 4. Create categories
  const categoryRows = await db
    .insert(menuCategories)
    .values([
      { restaurantId: restaurant.id, name: 'Koffie', sortOrder: 1, isVisible: true },
      { restaurantId: restaurant.id, name: 'Frisdrank', sortOrder: 2, isVisible: true },
      { restaurantId: restaurant.id, name: 'Snacks', sortOrder: 3, isVisible: true },
    ])
    .returning()

  const koffie = categoryRows[0]
  const frisdrank = categoryRows[1]
  const snacks = categoryRows[2]
  if (!koffie || !frisdrank || !snacks) throw new Error('Categories insert mislukt')
  console.log('Categories created:', koffie.id, frisdrank.id, snacks.id)

  // 5. Create menu items
  const cappuccinoRows = await db
    .insert(menuItems)
    .values({
      restaurantId: restaurant.id,
      categoryId: koffie.id,
      name: 'Cappuccino',
      description: 'Romige espresso met opgeklopte melk',
      priceCents: 350,
      vatRate: '0.09',
      allergens: ['melk'],
      isAvailable: true,
      sortOrder: 1,
      variants: [
        {
          group: 'Melk',
          required: false,
          multiSelect: false,
          options: [
            { name: 'Oat milk', priceOffsetCents: 50 },
            { name: 'Soy milk', priceOffsetCents: 50 },
          ],
        },
      ],
    })
    .returning()

  const cappuccino = cappuccinoRows[0]
  if (!cappuccino) throw new Error('Cappuccino insert mislukt')

  const otherItems = await db
    .insert(menuItems)
    .values([
      {
        restaurantId: restaurant.id,
        categoryId: koffie.id,
        name: 'Latte Macchiato',
        description: 'Gelaagde koffie met warme melk en een shot espresso',
        priceCents: 380,
        vatRate: '0.09',
        allergens: ['melk'],
        isAvailable: true,
        sortOrder: 2,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: koffie.id,
        name: 'Espresso',
        description: 'Klassieke sterke koffie',
        priceCents: 250,
        vatRate: '0.09',
        allergens: [],
        isAvailable: true,
        sortOrder: 3,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: koffie.id,
        name: 'Americano',
        description: 'Espresso met heet water verlengd',
        priceCents: 300,
        vatRate: '0.09',
        allergens: [],
        isAvailable: true,
        sortOrder: 4,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: frisdrank.id,
        name: 'Cola',
        description: 'Gekoeld, fris en bruisend',
        priceCents: 275,
        vatRate: '0.21',
        allergens: [],
        isAvailable: true,
        sortOrder: 1,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: frisdrank.id,
        name: 'Spa Rood',
        description: 'Bruisend mineraalwater',
        priceCents: 225,
        vatRate: '0.21',
        allergens: [],
        isAvailable: true,
        sortOrder: 2,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: snacks.id,
        name: 'Bitterballen (6 stuks)',
        description: 'Knapperige bitterballen met mosterd',
        priceCents: 650,
        vatRate: '0.09',
        allergens: ['gluten', 'melk', 'mosterd'],
        isAvailable: true,
        sortOrder: 1,
        variants: [],
      },
      {
        restaurantId: restaurant.id,
        categoryId: snacks.id,
        name: 'Kaasplankje',
        description: 'Selectie van drie Nederlandse kazen met crackers en chutney',
        priceCents: 1150,
        vatRate: '0.09',
        allergens: ['melk', 'gluten'],
        isAvailable: true,
        sortOrder: 2,
        variants: [],
      },
    ])
    .returning()

  console.log('Menu items created:', cappuccino.id, ...otherItems.map((i) => i.id))

  // 6. Create tables
  const createdTables = await db
    .insert(tables)
    .values([
      { restaurantId: restaurant.id, tableNumber: '1', isActive: true },
      { restaurantId: restaurant.id, tableNumber: '2', isActive: true },
      { restaurantId: restaurant.id, tableNumber: '3', isActive: true },
      { restaurantId: restaurant.id, tableNumber: '4', isActive: true },
      { restaurantId: restaurant.id, tableNumber: 'Terras', isActive: true },
    ])
    .returning()

  console.log('Tables created:', createdTables.map((t) => t.tableNumber).join(', '))

  // 7. Create video scripts
  const createdScripts = await db
    .insert(videoScripts)
    .values([
      {
        restaurantId: restaurant.id,
        slot: 'ochtend',
        language: 'nl',
        scriptText:
          'Goedemorgen! Welkom bij Café De Bron. Ik ben blij u te mogen verwelkomen voor een heerlijk ontbijt of een kopje koffie. Bekijk ons menu en bestel eenvoudig via uw telefoon. Eet smakelijk!',
        isActive: false,
      },
      {
        restaurantId: restaurant.id,
        slot: 'lunch',
        language: 'nl',
        scriptText:
          'Welkom bij Café De Bron! Perfect moment voor een heerlijke lunch. Ontdek onze verse gerechten en snacks. U kunt eenvoudig bestellen via het menu hieronder. Geniet van uw bezoek!',
        isActive: false,
      },
      {
        restaurantId: restaurant.id,
        slot: 'avond',
        language: 'nl',
        scriptText:
          'Goedenavond en welkom bij Café De Bron! Wat fijn dat u er bent. Neem uw tijd om ons avondmenu te ontdekken. Een drankje of een hapje? Bestel eenvoudig via uw tafel. Geniet ervan!',
        isActive: false,
      },
    ])
    .returning()

  console.log('Video scripts created:', createdScripts.map((s) => s.slot).join(', '))

  console.log('\nSeed voltooid!')
  console.log('Login: demo@horecaai.nl / Demo1234!')
  console.log('Restaurant slug: demo')
}

main().catch((err) => {
  console.error('Seed mislukt:', err)
  process.exit(1)
})
