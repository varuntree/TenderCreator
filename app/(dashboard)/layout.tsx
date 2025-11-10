import '@/app/(dashboard)/globals-dashboard.css'

import type { CSSProperties } from 'react'

import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMP: Disable auth check for UI iteration
  // const supabase = await createClient()

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/signin')
  // }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
          <section
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.14)]"
            style={{ '--dashboard-rail': '5rem', '--dashboard-rail-gap': '1.5rem' } as CSSProperties}
          >
            <div className="relative border-b border-slate-100 px-6 py-6 sm:px-10 sm:py-8 [padding-left:calc(var(--dashboard-rail)+var(--dashboard-rail-gap))]">
              <Navbar />
            </div>

            <div className="relative flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-10 [padding-left:calc(var(--dashboard-rail)+var(--dashboard-rail-gap))]">
              {children}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
