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
    badge: 'Creator Role',
    description: 'Full control over organization settings, billing, and tender workflows.',
    highlights: ['Billing + subscription control', 'Manage organization profile + documents', 'Invite/remove any team member'],
  },
  {
    id: 'company_admin',
    title: 'Company Admin',
    description: 'Operational leaders who manage tenders and project teams day-to-day.',
    highlights: ['Create and manage tenders', 'Assign work packages', 'Edit organization profile types'],
  },
  {
    id: 'company_user',
    title: 'Company User',
    description: 'Subject matter experts and writers contributing to assigned work packages.',
    highlights: ['Collaborate on assigned documents', 'Upload supporting evidence', 'View company knowledge base'],
  },
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
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: nextRole } : member)))
  }

  return (
    <div className="space-y-10">
      <header className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dashboard-primary-light)] text-[var(--dashboard-primary)]">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--dashboard-text-secondary)]">Team</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--dashboard-text-primary)]">Manage your workspace</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--dashboard-text-body)]">
                Manage your team, invite additional users via email, and assign roles so every proposal has the right owners.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-[var(--dashboard-primary)] px-5 text-sm font-semibold text-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary-light)]"
            >
              Export roster
            </Button>
            <Button className="h-11 rounded-xl bg-[var(--dashboard-text-primary)] px-6 text-sm font-semibold text-white shadow-none hover:bg-gray-900">
              Invite team member
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--dashboard-text-primary)]">Team members</h2>
            <p className="mt-1 text-sm text-[var(--dashboard-text-secondary)]">Search, filter, and manage access levels for everyone in your workspace.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-10 rounded-xl border border-[var(--dashboard-border-light)] bg-white px-3 text-sm font-medium text-[var(--dashboard-text-primary)] shadow-none hover:bg-[var(--dashboard-bg-gray-100)]"
            >
              <Filter className="h-4 w-4 text-[var(--dashboard-text-secondary)]" />
              Filters
            </Button>
            <Button className="h-10 rounded-xl bg-[var(--dashboard-primary)] px-4 text-sm font-semibold text-white shadow-none hover:bg-[var(--dashboard-primary-hover)]">
              Invite
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="search-input-wrapper w-full lg:max-w-sm">
            <Search className="search-icon h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input h-11 rounded-xl border border-[var(--dashboard-border-light)] bg-white text-sm text-[var(--dashboard-text-primary)] placeholder:text-[var(--dashboard-text-muted)] focus-visible:border-[var(--dashboard-primary)] focus-visible:ring-0"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--dashboard-text-secondary)]">Role</label>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | MemberRole)}>
              <SelectTrigger className="h-11 w-full rounded-xl border border-[var(--dashboard-border-light)] text-sm text-[var(--dashboard-text-primary)] focus-visible:border-[var(--dashboard-primary)] focus-visible:ring-0 sm:w-48">
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--dashboard-border)]">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Member</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[var(--dashboard-text-secondary)]">
                    No team members match that search. Clear filters to see everyone in your workspace.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="rounded-full bg-[var(--dashboard-primary-light)] text-sm font-semibold text-[var(--dashboard-primary)]">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-[var(--dashboard-text-primary)]">{member.name}</p>
                        <p className="text-sm text-[var(--dashboard-text-secondary)]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-[var(--dashboard-text-body)]">{member.joined}</td>
                  <td>
                    <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value as MemberRole)}>
                      <SelectTrigger className="h-10 w-44 rounded-xl border border-[var(--dashboard-border-light)] text-sm text-[var(--dashboard-text-primary)]">
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
                  <td>
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-gray-100)]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border border-[var(--dashboard-border)]">
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

      <section className="space-y-6 rounded-2xl border border-[var(--dashboard-border)] bg-white p-8 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--dashboard-text-primary)]">Organisation roles</h2>
          <p className="mt-1 text-sm text-[var(--dashboard-text-secondary)]">Snapshot of what each permission tier can do across TenderCreator.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {roleCards.map((role) => (
            <article key={role.id} className="flex h-full flex-col rounded-2xl border border-[var(--dashboard-border)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--dashboard-text-primary)]">{role.title}</h3>
                  {role.badge && (
                    <span className="badge badge-primary mt-2 inline-flex items-center gap-2 bg-[var(--dashboard-primary)] text-[11px] font-semibold uppercase tracking-wide text-white">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {role.badge}
                    </span>
                  )}
                </div>
                <Badge className="rounded-full bg-[var(--dashboard-bg-gray-100)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--dashboard-text-secondary)]">
                  {role.title}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-[var(--dashboard-text-body)]">{role.description}</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--dashboard-text-primary)]">
                {role.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--dashboard-primary)]" />
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
    return <span className="badge badge-muted rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-800">Pending invite</span>
  }
  return <span className="badge badge-green rounded-full bg-[var(--dashboard-primary-light)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--dashboard-primary)]">Active</span>
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
