'use client'

import {
  CheckCircle2,
  Filter,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  Users2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type MemberRole = 'admin' | 'company_admin' | 'company_user'
type MemberStatus = 'active' | 'pending'

type TeamMember = {
  id: string
  name: string
  email: string
  joined: string
  role: MemberRole
  status: MemberStatus
}

const initialMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Amelia Chen',
    email: 'amelia.chen@northwindinfra.com',
    joined: 'Mar 04, 2024',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Marcus Hall',
    email: 'marcus.hall@northwindinfra.com',
    joined: 'May 12, 2024',
    role: 'company_admin',
    status: 'active',
  },
  {
    id: '3',
    name: 'Priya Kapoor',
    email: 'priya.kapoor@northwindinfra.com',
    joined: 'Jun 18, 2024',
    role: 'company_user',
    status: 'active',
  },
  {
    id: '4',
    name: 'Oliver Grant',
    email: 'oliver.grant@northwindinfra.com',
    joined: 'Aug 02, 2024',
    role: 'company_user',
    status: 'pending',
  },
]

const roleLabels: Record<MemberRole, string> = {
  admin: 'Admin',
  company_admin: 'Company Admin',
  company_user: 'Company User',
}

const roleCards = [
  {
    id: 'admin',
    title: 'Admin',
    badge: 'Creator role',
    description: 'Full control over organization settings, billing, and tender workflows.',
    highlights: [
      'Billing + subscription control',
      'Manage organization profile + documents',
      'Invite or remove any team member',
    ],
  },
  {
    id: 'company_admin',
    title: 'Company Admin',
    description: 'Operational leaders who run tenders and project teams day-to-day.',
    highlights: ['Create and manage tenders', 'Assign work packages', 'Edit organization profile types'],
  },
  {
    id: 'company_user',
    title: 'Company User',
    description: 'Subject matter experts and writers contributing to assigned documents.',
    highlights: ['Collaborate on assigned docs', 'Upload supporting evidence', 'View company knowledge base'],
  },
]

const inviteActions = [
  { label: 'Export roster', variant: 'outline' as const },
  { label: 'Invite teammate', variant: 'default' as const },
]

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | MemberRole>('all')

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesQuery =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [members, searchQuery, roleFilter])

  const handleRoleChange = (memberId: string, nextRole: MemberRole) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, role: nextRole } : member))
    )
  }

  const stats = [
    { label: 'Active seats', value: members.filter((m) => m.status === 'active').length },
    { label: 'Pending invites', value: members.filter((m) => m.status === 'pending').length },
    { label: 'Roles in use', value: new Set(members.map((m) => m.role)).size },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/60 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-100/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              <Users2 className="h-4 w-4 text-emerald-600" />
              Team
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Manage your workspace</h1>
              <p className="mt-3 max-w-3xl text-base text-slate-500">
                Invite collaborators, assign the right permissions, and keep every tender staffed with the exact mix of admins,
                operators, and contributors.
              </p>
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-emerald-100/70 bg-white/80 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">{stat.label}</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3 sm:w-60">
            {inviteActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className={
                  action.variant === 'outline'
                    ? 'h-12 rounded-2xl border-emerald-500 text-emerald-700 hover:bg-emerald-50/60'
                    : 'h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800'
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Team members</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter, and manage access levels for everyone in your workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-none hover:bg-slate-50"
            >
              <Filter className="h-4 w-4 text-slate-400" />
              Filters
            </Button>
            <Button className="h-11 rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:bg-emerald-500/90">
              Invite
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white pl-12 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-0"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Role</label>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | MemberRole)}>
              <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-200 text-sm text-slate-700 focus-visible:border-emerald-400 focus-visible:ring-0 sm:w-48">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
                <SelectItem value="company_user">Company User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                    No team members match that search. Clear filters to see everyone in your workspace.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="bg-white/90 hover:bg-slate-50/80">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="rounded-2xl bg-emerald-50 text-base font-semibold text-emerald-600">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base font-semibold text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{member.joined}</td>
                    <td className="px-6 py-5">
                      <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value as MemberRole)}>
                        <SelectTrigger className="h-11 w-48 rounded-2xl border border-slate-200 text-sm text-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 rounded-full text-slate-400 hover:bg-slate-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border border-slate-200 shadow-xl">
                          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> Resend invite
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update permissions</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Remove from team</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.06)]">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Organisation roles</h2>
          <p className="mt-1 text-sm text-slate-500">Snapshot of what each permission tier unlocks across TenderCreator.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {roleCards.map((role) => (
            <article
              key={role.id}
              className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Role</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{role.title}</h3>
                  {role.badge && (
                    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      {role.badge}
                    </span>
                  )}
                </div>
                <Badge className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {role.title}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-slate-600">{role.description}</p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-700">
                {role.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/80 px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatusBadge({ status }: { status: MemberStatus }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Pending invite
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Active
    </span>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
