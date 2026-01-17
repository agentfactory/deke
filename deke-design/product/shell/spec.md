# Application Shell Specification

## Overview
Coach OS uses a minimal header design that adapts based on authentication state. The shell provides a clean, modern navigation experience for both public visitors and authenticated users.

## Navigation Structure

### Public Navigation (Not Logged In)
- Home → Landing page
- Find a Singing Group → Group finder service
- Service Offerings → Services showcase
- Login/Sign Up → Authentication

### Authenticated Navigation (Logged In)
- Dashboard → Dashboard & Trip Management
- Campaigns → Campaign & Lead Discovery
- Outreach → Outreach & Automation

## User Menu
- **Location:** Left side, near logo (when authenticated)
- **Contents:** Avatar/name with dropdown containing logout, settings, profile

## Layout Pattern
Minimal header with context-aware navigation:
- **Logo behavior:** Links to landing page when public, Dashboard when authenticated
- **Navigation placement:** Center/right aligned horizontal nav items
- **User menu placement:** Left side, adjacent to logo (authenticated only)
- **Authentication CTA:** Login/Sign Up button in top right (public only)

## Responsive Behavior
- **Desktop:** Full horizontal header with all items visible
- **Tablet:** Horizontal header, may condense spacing
- **Mobile:** Hamburger menu for navigation items, logo and menu toggle visible

## Design Notes
- Minimal aesthetic with subtle border-bottom
- Violet (primary) for active nav items and CTAs
- Cyan (secondary) for hover states and highlights
- Slate (neutral) for backgrounds, borders, text
- DM Sans typography throughout
- Light and dark mode support
- Mobile-optimized for on-the-go coaching
