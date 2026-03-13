export type VideoSlot = 'ochtend' | 'lunch' | 'middag' | 'avond' | 'nacht'

export function getVideoSlot(date: Date, timezone: string): VideoSlot {
  const hour = parseInt(
    new Intl.DateTimeFormat('nl-NL', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).format(date),
    10
  )

  if (hour >= 6 && hour < 11) return 'ochtend'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'middag'
  if (hour >= 17 && hour < 22) return 'avond'
  return 'nacht'
}
