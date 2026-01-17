import { useState, useRef, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import type { User as UserType } from './AppShell'

export interface UserMenuProps {
  user: UserType
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
            <User size={14} className="text-lime-600 dark:text-lime-400" />
          </div>
        )}
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300 hidden sm:inline">
          {user.name}
        </span>
        <ChevronDown
          size={16}
          className={`text-stone-500 dark:text-stone-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800">
            <div className="text-sm font-medium text-stone-900 dark:text-white">
              {user.name}
            </div>
            {user.email && (
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {user.email}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                // Handle profile navigation
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                // Handle settings navigation
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-stone-200 dark:border-stone-800 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout?.()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
