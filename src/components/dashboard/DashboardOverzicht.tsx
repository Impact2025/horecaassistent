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
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    preparing: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    ready: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    delivered: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  }
  return colors[status]
}

function greeting(name: string | null | undefined): string {
  const hour = new Date().getHours()
  const prefix =
    hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond'
  return name ? `${prefix}, ${name.split(' ')[0]}` : prefix
}

const DAY_NAMES = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

interface StatCardProps {
  icon: string
  label: string
  value: string
  iconBg: string
  iconColor: string
  accent: string
}

function StatCard({ icon, label, value, iconBg, iconColor, accent }: StatCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${accent} -translate-y-6 translate-x-6`} />
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className={`material-symbols-outlined text-[22px] ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
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
    <div className="space-y-8 max-w-7xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 tracking-tight">
            {greeting(userName)}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{restaurantName}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold capitalize shadow-sm">
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
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          accent="bg-emerald-400"
        />
        <StatCard
          icon="date_range"
          label="Omzet week"
          value={formatEuro(omzetWeek)}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          accent="bg-blue-400"
        />
        <StatCard
          icon="receipt_long"
          label="Gem. order"
          value={formatEuro(gemiddeldeOrder)}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          accent="bg-orange-400"
        />
        <StatCard
          icon="trending_up"
          label="Upsell conversie"
          value={`${upsellConversie.toFixed(1)}%`}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          accent="bg-purple-400"
        />
      </div>

      {/* Bar chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-gray-900">
              Omzet afgelopen 7 dagen
            </h2>
            <span className="text-xs text-gray-400 font-medium">Per dag</span>
          </div>

          {/* Grid lines */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((pct) => (
                <div key={pct} className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-gray-300 w-10 text-right flex-none">
                    {pct > 0 ? formatEuro((maxRevenue * pct) / 100) : '€ 0'}
                  </span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2 h-44 pl-14">
              {omzetPerDag.map((day, i) => {
                const pct = (day.totalCents / maxRevenue) * 100
                const date = new Date(day.date)
                const dayName = DAY_NAMES[date.getDay()]
                const isToday = i === omzetPerDag.length - 1
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1.5 group/bar"
                  >
                    <div className="w-full relative flex items-end justify-center h-36">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isToday
                            ? 'bg-emerald-500 group-hover/bar:bg-emerald-400'
                            : 'bg-gray-200 group-hover/bar:bg-gray-300'
                        }`}
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {formatEuro(day.totalCents)}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {dayName}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-gray-900">
              Recente bestellingen
            </h2>
            {recenteOrders.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">
                {recenteOrders.length} orders
              </span>
            )}
          </div>
          <div className="space-y-1">
            {recenteOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[24px] text-gray-300">
                    receipt_long
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-400">
                  Nog geen bestellingen vandaag
                </p>
              </div>
            )}
            {recenteOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-none w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="text-sm font-bold text-on-primary-container">
                    {order.tableNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Tafel {order.tableNumber}{' '}
                    <span className="font-normal text-gray-400">
                      · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-none text-right space-y-1">
                  <p className="text-sm font-bold text-gray-900">
                    {formatEuro(order.totalCents)}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-none">
            <span className="material-symbols-outlined text-[24px] text-emerald-600">
              calendar_month
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Maandoverzicht
            </p>
            <p className="text-3xl font-bold text-gray-900 leading-none">
              {formatEuro(omzetMaand)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Totale omzet afgelopen 30 dagen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
