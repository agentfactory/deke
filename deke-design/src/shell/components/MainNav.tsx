import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { NavigationItem } from './AppShell'

export interface MainNavProps {
  navigationItems: NavigationItem[]
  isAuthenticated?: boolean
  onNavigate?: (href: string) => void
  onLogin?: () => void
}

export function MainNav({
  navigationItems,
  isAuthenticated = false,
  onNavigate,
  onLogin,
}: MainNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="flex items-center gap-6">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {navigationItems.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={`text-sm font-medium transition-colors ${
              item.isActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400'
            }`}
          >
            {item.label}
          </button>
        ))}
        {!isAuthenticated && (
          <button
            onClick={onLogin}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 transition-colors"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 md:hidden z-50">
          <div className="px-4 py-4 space-y-3">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  onNavigate?.(item.href)
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  onLogin?.()
                  setMobileMenuOpen(false)
                }}
                className="block w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
