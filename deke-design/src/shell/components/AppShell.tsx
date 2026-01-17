import React from 'react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface User {
  name: string
  email?: string
  avatarUrl?: string
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  isAuthenticated?: boolean
  user?: User
  onNavigate?: (href: string) => void
  onLogin?: () => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  isAuthenticated = false,
  user,
  onNavigate,
  onLogin,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + User Menu (if authenticated) */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.(isAuthenticated ? '/dashboard' : '/')}
                className="text-xl font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Coach OS
              </button>
              {isAuthenticated && user && (
                <UserMenu user={user} onLogout={onLogout} />
              )}
            </div>

            {/* Right: Navigation */}
            <MainNav
              navigationItems={navigationItems}
              isAuthenticated={isAuthenticated}
              onNavigate={onNavigate}
              onLogin={onLogin}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
