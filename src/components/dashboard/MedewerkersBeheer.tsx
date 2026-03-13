'use client'

import { useState, useTransition } from 'react'
import {
  inviteMember,
  updateMemberRole,
  removeMember,
} from '@/app/dashboard/medewerkers/actions'

type MemberRole = 'owner' | 'manager' | 'keuken' | 'kelner'

interface MemberRow {
  id: string
  restaurantId: string
  userId: string
  role: MemberRole
  createdAt: Date
  userName: string | null
  userEmail: string
}

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Eigenaar',
  manager: 'Manager',
  keuken: 'Keuken',
  kelner: 'Kelner',
}

const ROLE_COLORS: Record<MemberRole, { bg: string; color: string }> = {
  owner:   { bg: '#003422', color: '#fff' },
  manager: { bg: '#e8f5ee', color: '#003422' },
  keuken:  { bg: '#fff3e0', color: '#e65100' },
  kelner:  { bg: '#efeeeb', color: '#404943' },
}

const AVATAR_COLORS = [
  { bg: '#e8f5ee', color: '#003422' },
  { bg: '#e3f2fd', color: '#0d47a1' },
  { bg: '#fce4ec', color: '#880e4f' },
]

function InitialsAvatar({ name, email }: { name: string | null; email: string }) {
  const letter = (name ?? email)[0]?.toUpperCase() ?? '?'
  const colorIdx = email.charCodeAt(0) % AVATAR_COLORS.length
  const colors = AVATAR_COLORS[colorIdx] ?? AVATAR_COLORS[0]
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-none"
      style={{ background: colors.bg, color: colors.color }}
    >
      {letter}
    </div>
  )
}

interface MedewerkersProps {
  members: MemberRow[]
  currentUserId: string
}

export default function MedewerkersBeheer({ members: initialMembers, currentUserId }: MedewerkersProps) {
  const [members, setMembers] = useState<MemberRow[]>(initialMembers)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('kelner')
  const [invitePending, startInvite] = useTransition()
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const ownerCount = members.filter((m) => m.role === 'owner').length

  function handleInvite() {
    setInviteError(null)
    startInvite(async () => {
      try {
        await inviteMember(inviteEmail, inviteRole)
        setShowInviteDialog(false)
        setInviteEmail('')
        setInviteRole('kelner')
        window.location.reload()
      } catch (e) {
        setInviteError(e instanceof Error ? e.message : 'Uitnodiging mislukt')
      }
    })
  }

  function handleRoleChange(memberId: string, role: MemberRole) {
    setGlobalError(null)
    startInvite(async () => {
      try {
        const updated = await updateMemberRole(memberId, role)
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: updated.role as MemberRole } : m))
        )
      } catch (e) {
        setGlobalError(e instanceof Error ? e.message : 'Rol wijzigen mislukt')
      }
    })
  }

  function handleRemove(memberId: string) {
    setGlobalError(null)
    startInvite(async () => {
      try {
        await removeMember(memberId)
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
      } catch (e) {
        setGlobalError(e instanceof Error ? e.message : 'Verwijderen mislukt')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
            Medewerkers
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Beheer je team en rollen
          </p>
        </div>
        <button
          onClick={() => setShowInviteDialog(true)}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: '#003422' }}
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Uitnodiging sturen
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totaal', value: String(members.length), icon: 'group' },
          { label: 'Eigenaren', value: String(ownerCount), icon: 'admin_panel_settings' },
          { label: 'Keukenteam', value: String(members.filter((m) => m.role === 'keuken').length), icon: 'restaurant' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ background: '#efeeeb' }}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="font-heading text-xl font-extrabold text-on-surface leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {globalError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #f48fb1' }}>
          {globalError}
        </div>
      )}

      {/* Members list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {members.map((member, idx) => {
          const isCurrentUser = member.userId === currentUserId
          const canRemove = !isCurrentUser && !(member.role === 'owner' && ownerCount <= 1)
          const roleColors = ROLE_COLORS[member.role]

          return (
            <div
              key={member.id}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf8f5]"
              style={idx !== members.length - 1 ? { borderBottom: '1px solid rgba(192,201,193,0.2)' } : {}}
            >
              <InitialsAvatar name={member.userName} email={member.userEmail} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {member.userName ?? member.userEmail}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-on-surface-variant font-normal">(jij)</span>
                  )}
                </p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                  {member.userEmail}
                </p>
              </div>

              {/* Role badge */}
              <span
                className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold flex-none"
                style={{ background: roleColors.bg, color: roleColors.color }}
              >
                {ROLE_LABELS[member.role]}
              </span>

              {/* Role select */}
              {!isCurrentUser && (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                  className="text-sm rounded-xl px-3 py-1.5 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                  aria-label={`Rol van ${member.userName ?? member.userEmail}`}
                >
                  <option value="owner">Eigenaar</option>
                  <option value="manager">Manager</option>
                  <option value="keuken">Keuken</option>
                  <option value="kelner">Kelner</option>
                </select>
              )}

              {/* Remove */}
              {canRemove ? (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`${member.userName ?? member.userEmail} verwijderen`}
                >
                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>
          )
        })}

        {members.length === 0 && (
          <div className="py-16 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#efeeeb' }}
            >
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant/40">group</span>
            </div>
            <p className="font-heading font-bold text-on-surface">Nog geen medewerkers</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-5">
              Stuur een uitnodiging om je eerste teamlid toe te voegen.
            </p>
            <button
              onClick={() => setShowInviteDialog(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: '#003422' }}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Uitnodiging sturen
            </button>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowInviteDialog(true)}
        className="sm:hidden fixed z-20 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full text-sm font-bold text-white active:scale-95 transition-transform"
        style={{
          background: '#003422',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
          right: '1rem',
          boxShadow: '0 8px 28px rgba(0,52,34,0.35)',
        }}
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        Uitnodiging sturen
      </button>

      {/* Invite modal */}
      {showInviteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="relative bg-white rounded-2xl w-full max-w-md"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}
            >
              <h2 className="font-heading text-lg font-bold text-on-surface">Uitnodiging sturen</h2>
              <button
                onClick={() => setShowInviteDialog(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f3f0] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="invite-email" className="block text-sm font-semibold text-on-surface mb-1.5">
                  E-mailadres
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="medewerker@restaurant.nl"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                />
              </div>

              <div>
                <label htmlFor="invite-role" className="block text-sm font-semibold text-on-surface mb-1.5">
                  Rol
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                >
                  <option value="owner">Eigenaar</option>
                  <option value="manager">Manager</option>
                  <option value="keuken">Keuken</option>
                  <option value="kelner">Kelner</option>
                </select>
              </div>

              {inviteError && (
                <p className="text-sm text-red-600">{inviteError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowInviteDialog(false)}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant transition-colors hover:bg-[#f5f3f0]"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleInvite}
                  disabled={invitePending || !inviteEmail}
                  className="flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#003422' }}
                >
                  {invitePending ? 'Versturen...' : 'Uitnodiging sturen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
