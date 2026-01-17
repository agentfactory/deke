import { useState } from 'react'
import { AppShell } from './components/AppShell'

export default function ShellPreview() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Public navigation items
  const publicNavItems = [
    { label: 'Home', href: '/', isActive: true },
    { label: 'Find a Singing Group', href: '/find-group', isActive: false },
    { label: 'Service Offerings', href: '/services', isActive: false },
  ]

  // Authenticated navigation items
  const authenticatedNavItems = [
    { label: 'Dashboard', href: '/dashboard', isActive: true },
    { label: 'Campaigns', href: '/campaigns', isActive: false },
    { label: 'Outreach', href: '/outreach', isActive: false },
  ]

  const user = {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: undefined,
  }

  return (
    <div className="min-h-screen">
      <AppShell
        navigationItems={isAuthenticated ? authenticatedNavItems : publicNavItems}
        isAuthenticated={isAuthenticated}
        user={isAuthenticated ? user : undefined}
        onNavigate={(href) => console.log('Navigate to:', href)}
        onLogin={() => {
          console.log('Login clicked')
          setIsAuthenticated(true)
        }}
        onLogout={() => {
          console.log('Logout clicked')
          setIsAuthenticated(false)
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              {isAuthenticated ? 'Dashboard' : 'Welcome to Coach OS'}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
              {isAuthenticated
                ? 'Manage your trips, discover leads, and automate outreach.'
                : 'The modern platform for traveling coaches and their communities.'}
            </p>

            {/* Toggle for preview purposes */}
            <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 p-6">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">
                Shell Preview Controls
              </h2>
              <button
                onClick={() => setIsAuthenticated(!isAuthenticated)}
                className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-600 transition-colors"
              >
                Toggle to {isAuthenticated ? 'Public' : 'Authenticated'} View
              </button>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
                Current state: <span className="font-semibold">{isAuthenticated ? 'Authenticated' : 'Public'}</span>
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-6">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
                  Shell Features
                </h3>
                <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                  <li>• Adaptive navigation (public/authenticated)</li>
                  <li>• Context-aware logo behavior</li>
                  <li>• User menu with dropdown (authenticated)</li>
                  <li>• Mobile responsive with hamburger menu</li>
                  <li>• Light and dark mode support</li>
                  <li>• Stone/lime design tokens applied</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  )
}
