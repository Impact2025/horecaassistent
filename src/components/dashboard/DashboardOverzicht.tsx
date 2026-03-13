import type { Order } from '@/lib/db/schema'

interface DailyRevenue {
  date: string
  totalCents: number
}

interface RecentOrder {
  id: string
  tableNumber: string
  itemCount: number
  totalCents: number
  status: Order['status']
  createdAt: Date | string
}

interface DashboardOverzichtProps {
  userName: string | null | undefined
  restaurantName: string
  plan: string
  omzetVandaag: number
  omzetWeek: number
  omzetMaand: number
  gemiddeldeOrder: number
  upsellConversie: number
  recenteOrders: RecentOrder[]
  omzetPerDag: DailyRevenue[]
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function statusLabel(status: Order['status']): string {
  const labels: Record<Order['status'], string> = {
    pending: 'In afwachting',
    confirmed: 'Bevestigd',
    preparing: 'In bereiding',
    ready: 'Klaar',
    delivered: 'Afgeleverd',
    cancelled: 'Geannuleerd',
  }
  return labels[status]
}

function statusDot(status: Order['status']): string {
  const colors: Record<Order['status'], string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#501d00',
    ready: '#003422',
    delivered: '#707973',
    cancelled: '#ba1a1a',
  }
  return colors[status]
}

function greeting(name: string | null | undefined): string {
  const hour = new Date().getHours()
  const prefix = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond'
  return name ? `${prefix}, ${name.split(' ')[0]}` : prefix
}

function timeAgo(createdAt: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (diff < 1) return 'Zojuist'
  if (diff < 60) return `${diff} min geleden`
  return `${Math.floor(diff / 60)} uur geleden`
}

const DAY_NAMES = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

// ─── Components ──────────────────────────────────────────────────────────────

function HeroStatCard({
  label,
  value,
  sub,
  badge,
  dark,
}: {
  label: string
  value: string
  sub: string
  badge?: string
  dark?: boolean
}) {
  if (dark) {
    return (
      <div
        className="p-8 rounded-2xl flex flex-col justify-between min-h-[200px] relative overflow-hidden group"
        style={{ background: '#003422' }}
      >
        {/* Glow blob */}
        <div
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-transform duration-500 group-hover:scale-125"
          style={{ background: '#0f4c35' }}
        />
        <div className="flex justify-between items-start z-10">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#99d3b4' }}>
            {label}
          </span>
          {badge && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: '#0f4c35', color: '#b4f0d0' }}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="z-10 mt-auto">
          <div className="font-heading text-5xl font-extrabold text-white tracking-tighter">{value}</div>
          <p className="font-sans text-sm mt-2" style={{ color: '#99d3b4' }}>{sub}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="p-8 rounded-2xl flex flex-col justify-between min-h-[200px]"
      style={{ background: '#e4e2df' }}
    >
      <div className="flex justify-between items-start">
        <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
          {label}
        </span>
        {badge && (
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#d6e7db', color: '#59685f' }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-auto">
        <div className="font-heading text-5xl font-extrabold text-on-surface tracking-tighter">{value}</div>
        <p className="font-sans text-sm text-on-surface-variant mt-2">{sub}</p>
      </div>
    </div>
  )
}

function UpsellCard({ pct }: { pct: number }) {
  return (
    <div
      className="p-8 rounded-2xl flex flex-col justify-between min-h-[200px]"
      style={{ background: '#f5f3f0' }}
    >
      <div className="flex justify-between items-start">
        <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
          Upsell conversie
        </span>
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          trending_up
        </span>
      </div>
      <div className="mt-auto">
        <div className="font-heading text-5xl font-extrabold text-on-surface tracking-tighter">
          {pct.toFixed(1)}%
        </div>
        <div className="w-full rounded-full mt-4 overflow-hidden h-2" style={{ background: '#e4e2df' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(pct, 100)}%`, background: '#003422' }}
          />
        </div>
        <p className="font-sans text-sm text-on-surface-variant mt-2">
          Van bestellingen met upsell
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardOverzicht({
  userName,
  restaurantName,
  plan,
  omzetVandaag,
  omzetWeek,
  omzetMaand,
  gemiddeldeOrder,
  upsellConversie,
  recenteOrders,
  omzetPerDag,
}: DashboardOverzichtProps) {
  const maxRevenue = Math.max(...omzetPerDag.map((d) => d.totalCents), 1)

  return (
    <div className="space-y-10 max-w-7xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
            {greeting(userName)}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">{restaurantName}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
          style={{ background: '#d6e7db', color: '#003422' }}
        >
          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          {plan}
        </span>
      </div>

      {/* ── Hero stat cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeroStatCard
          label="Omzet vandaag"
          value={formatEuro(omzetVandaag)}
          sub={`Omzet deze week: ${formatEuro(omzetWeek)}`}
          badge="+12.5%"
          dark
        />
        <HeroStatCard
          label="Gem. orderwaarde"
          value={formatEuro(gemiddeldeOrder)}
          sub="Gemiddeld per bestelling"
          badge="+4.2%"
        />
        <UpsellCard pct={upsellConversie} />
      </section>

      {/* ── Main 2-col section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Bar chart */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
                Omzet afgelopen 7 dagen
              </h3>
              <p className="text-on-surface-variant text-sm">Dagelijkse omzet dit restaurant</p>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Bars */}
            <div className="flex items-end gap-2.5 h-52">
              {omzetPerDag.map((day, i) => {
                const pct = (day.totalCents / maxRevenue) * 100
                const date = new Date(day.date)
                const dayName = DAY_NAMES[date.getDay()]
                const isToday = i === omzetPerDag.length - 1
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                    <div className="w-full relative flex items-end justify-center h-44">
                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
                        style={{ background: '#003422' }}
                      >
                        {formatEuro(day.totalCents)}
                      </div>
                      <div
                        className="w-full rounded-t-lg transition-all duration-200"
                        style={{
                          height: `${Math.max(pct, 3)}%`,
                          background: isToday ? '#003422' : '#e4e2df',
                        }}
                        onMouseEnter={(e) => {
                          if (!isToday) e.currentTarget.style.background = '#c0c9c1'
                        }}
                        onMouseLeave={(e) => {
                          if (!isToday) e.currentTarget.style.background = '#e4e2df'
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: isToday ? '#003422' : '#707973' }}
                    >
                      {dayName}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Month total */}
            <div
              className="mt-5 pt-5 flex items-center justify-between"
              style={{ borderTop: '1px solid #efeeeb' }}
            >
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  Maandoverzicht
                </p>
                <p className="font-heading text-2xl font-extrabold text-on-surface mt-0.5">
                  {formatEuro(omzetMaand)}
                </p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Afgelopen 30 dagen</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: '#d6e7db' }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#003422' }}>
                  calendar_month
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI insight card */}
        <section className="space-y-5">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(214,231,219,0.45)',
              borderLeft: '4px solid #003422',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: '#003422', fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <h4 className="font-heading font-bold text-on-surface text-sm">AI Inzicht</h4>
            </div>
            <p className="font-heading text-base italic leading-relaxed" style={{ color: '#3b4a42' }}>
              &ldquo;Upsell-conversie is {upsellConversie.toFixed(1)}%. Suggestie: voeg een
              populair bijgerecht toe als standaard upsell bij uw best verkopende items.&rdquo;
            </p>
            <div className="mt-6">
              <button
                className="px-5 py-2.5 rounded-full font-sans text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: '#501d00' }}
              >
                Upsells beheren
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <h4 className="font-heading font-bold text-on-surface mb-5">Vandaag op een blik</h4>
            <div className="space-y-4">
              {[
                { label: 'Omzet deze week', value: formatEuro(omzetWeek), icon: 'date_range' },
                { label: 'Omzet deze maand', value: formatEuro(omzetMaand), icon: 'calendar_month' },
                { label: 'Openstaande orders', value: String(recenteOrders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length), icon: 'receipt_long' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#f5f3f0' }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        {row.icon}
                      </span>
                    </div>
                    <span className="text-sm text-on-surface-variant">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Recent orders table ── */}
      <section className="space-y-5 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
              Recente bestellingen
            </h3>
            <p className="text-on-surface-variant text-sm">Live tafelflow</p>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {recenteOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#f5f3f0' }}
              >
                <span className="material-symbols-outlined text-[26px] text-on-surface-variant/40">
                  receipt_long
                </span>
              </div>
              <p className="text-sm font-medium text-on-surface-variant">
                Nog geen bestellingen vandaag
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid #efeeeb' }}>
                  {['Bestelling', 'Tafel', 'Status', 'Items', 'Tijd', 'Totaal'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-sans text-[10px] uppercase tracking-widest font-bold text-on-surface-variant"
                      style={{ textAlign: h === 'Totaal' ? 'right' : 'left' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recenteOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{ borderTop: i > 0 ? '1px solid rgba(192,201,193,0.2)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f5' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td className="px-6 py-5 font-bold text-sm text-on-surface font-mono">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#efeeeb', color: '#1b1c1a' }}
                      >
                        Tafel {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-none"
                          style={{ background: statusDot(order.status) }}
                        />
                        <span className="text-xs font-medium text-on-surface">
                          {statusLabel(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {timeAgo(order.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-right font-heading font-bold text-on-surface">
                      {formatEuro(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
