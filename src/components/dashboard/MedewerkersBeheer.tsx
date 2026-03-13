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

const ROLE_BADGE_CLASSES: Record<MemberRole, string> = {
  owner: 'bg-primary text-white',
  manager: 'bg-secondary-container text-on-surface',
  keuken: 'bg-tertiary-container text-on-tertiary-container',
  kelner: 'bg-surface-container-high text-on-surface',
}

function InitialsAvatar({ name, email }: { name: string | null; email: string }) {
  const letter = (name ?? email)[0]?.toUpperCase() ?? '?'
  const colors = [
    'bg-primary-container text-on-primary-container',
    'bg-secondary-container text-on-surface',
    'bg-tertiary-container text-on-tertiary-container',
  ]
  const colorClass = colors[email.charCodeAt(0) % colors.length] ?? colors[0]
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-none ${colorClass}`}
    >
      {letter}
    </div>
  )
}

interface MedewerkersProps {
  members: MemberRow[]
  currentUserId: string
}

export default function MedewerkersBeheer({
  members: initialMembers,
  currentUserId,
}: MedewerkersProps) {
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
        // Refresh by reloading — server component will re-fetch
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">Team</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {members.length} {members.length === 1 ? 'medewerker' : 'medewerkers'}
          </p>
        </div>
        <button
          onClick={() => setShowInviteDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Uitnodiging sturen
        </button>
      </div>

      {globalError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        {members.map((member, idx) => {
          const isCurrentUser = member.userId === currentUserId
          const canRemove =
            !isCurrentUser &&
            !(member.role === 'owner' && ownerCount <= 1)

          return (
            <div
              key={member.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                idx !== members.length - 1 ? 'border-b border-outline-variant' : ''
              }`}
            >
              <InitialsAvatar name={member.userName} email={member.userEmail} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">
                  {member.userName ?? member.userEmail}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-on-surface-variant">(jij)</span>
                  )}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {member.userEmail}
                </p>
              </div>

              <span
                className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE_CLASSES[member.role]}`}
              >
                {ROLE_LABELS[member.role]}
              </span>

              {!isCurrentUser && (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                  className="text-sm border border-outline-variant rounded-lg px-2 py-1.5 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Rol van ${member.userName ?? member.userEmail}`}
                >
                  <option value="owner">Eigenaar</option>
                  <option value="manager">Manager</option>
                  <option value="keuken">Keuken</option>
                  <option value="kelner">Kelner</option>
                </select>
              )}

              {canRemove ? (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label={`${member.userName ?? member.userEmail} verwijderen`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    person_remove
                  </span>
                </button>
              ) : (
                <div className="w-9" />
              )}
            </div>
          )
        })}
      </div>

      {/* Invite dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowInviteDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-heading text-lg font-bold text-on-surface mb-4">
              Uitnodiging sturen
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-on-surface mb-1"
                >
                  E-mailadres
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="medewerker@restaurant.nl"
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-role"
                  className="block text-sm font-medium text-on-surface mb-1"
                >
                  Rol
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteDialog(false)}
                className="flex-1 px-4 py-2.5 border border-outline-variant text-sm font-medium text-on-surface rounded-xl hover:bg-surface-container transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleInvite}
                disabled={invitePending || !inviteEmail}
                className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {invitePending ? 'Uitnodiging sturen...' : 'Uitnodiging sturen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
