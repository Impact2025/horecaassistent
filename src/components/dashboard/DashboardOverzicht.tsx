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
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
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

function statusColor(status: Order['status']): string {
  const colors: Record<Order['status'], string> = {
    pending: 'bg-[#fff3e0] text-[#e65100]',
    confirmed: 'bg-[#e3f2fd] text-[#1565c0]',
    preparing: 'bg-[#fff8e1] text-[#f57f17]',
    ready: 'bg-[#e8f5e9] text-[#2e7d32]',
    delivered: 'bg-[#f3e5f5] text-[#6a1b9a]',
    cancelled: 'bg-[#fce4ec] text-[#880e4f]',
  }
  return colors[status]
}

function greeting(name: string | null | undefined): string {
  const hour = new Date().getHours()
  const prefix =
    hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond'
  return name ? `${prefix}, ${name.split(' ')[0]}` : prefix
}

const DAY_NAMES = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

interface StatCardProps {
  icon: string
  label: string
  value: string
  iconColor: string
}

function StatCard({ icon, label, value, iconColor }: StatCardProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
      </div>
    </div>
  )
}

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
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            {greeting(userName)}
          </h1>
          <p className="text-on-surface-variant mt-1">{restaurantName}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold capitalize">
          <span className="material-symbols-outlined text-[14px]">
            workspace_premium
          </span>
          {plan}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="euro"
          label="Omzet vandaag"
          value={formatEuro(omzetVandaag)}
          iconColor="bg-primary-container text-on-primary-container"
        />
        <StatCard
          icon="calendar_week"
          label="Omzet week"
          value={formatEuro(omzetWeek)}
          iconColor="bg-secondary-container text-primary"
        />
        <StatCard
          icon="receipt"
          label="Gem. order"
          value={formatEuro(gemiddeldeOrder)}
          iconColor="bg-[#fff3e0] text-[#e65100]"
        />
        <StatCard
          icon="trending_up"
          label="Upsell conversie"
          value={`${upsellConversie.toFixed(1)}%`}
          iconColor="bg-[#e8f5e9] text-[#2e7d32]"
        />
      </div>

      {/* Bar chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-6">
          <h2 className="font-heading font-semibold text-on-surface mb-6">
            Omzet afgelopen 7 dagen
          </h2>
          <div className="flex items-end gap-3 h-40">
            {omzetPerDag.map((day, i) => {
              const pct = (day.totalCents / maxRevenue) * 100
              const date = new Date(day.date)
              const dayName = DAY_NAMES[date.getDay()]
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="w-full relative flex items-end justify-center h-32">
                    <div
                      className="w-full rounded-t-md bg-primary opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={formatEuro(day.totalCents)}
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant capitalize">
                    {dayName}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-on-surface-variant">
              {formatEuro(0)}
            </span>
            <span className="text-xs text-on-surface-variant">
              {formatEuro(maxRevenue)}
            </span>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-6">
          <h2 className="font-heading font-semibold text-on-surface mb-4">
            Recente bestellingen
          </h2>
          <div className="space-y-3">
            {recenteOrders.length === 0 && (
              <p className="text-sm text-on-surface-variant">
                Nog geen bestellingen vandaag.
              </p>
            )}
            {recenteOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 py-2 border-b border-outline-variant last:border-0"
              >
                <div className="flex-none w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
                  <span className="text-sm font-bold text-on-primary-container">
                    {order.tableNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    Tafel {order.tableNumber} · {order.itemCount} item
                    {order.itemCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-none text-right">
                  <p className="text-sm font-semibold text-on-surface">
                    {formatEuro(order.totalCents)}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(
                      order.status
                    )}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month summary */}
      <div className="bg-surface-container-low rounded-xl p-6">
        <h2 className="font-heading font-semibold text-on-surface mb-2">
          Maandoverzicht
        </h2>
        <p className="text-3xl font-bold text-primary">
          {formatEuro(omzetMaand)}
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          Totale omzet afgelopen 30 dagen
        </p>
      </div>
    </div>
  )
}
