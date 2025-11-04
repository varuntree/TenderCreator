# Coding Patterns & Rules

This document defines code style and structure patterns. For system architecture, data schema, and integration patterns, see `/architecture` folder.

**Architecture References:**
- System design, layers, data flow → `/architecture/system-architecture.md`
- Database schema, tables, RLS → `/architecture/data-schema.sql`
- API contracts, AI integration, file uploads → `/architecture/integration-contracts.md`

## 📋 Table of Contents

1. [🎨 Design System Pattern](#-design-system-pattern)
2. [🎨 Component Pattern](#-component-pattern)
3. [🚫 Prohibited Patterns](#-prohibited-patterns)
4. [✅ Code Review Checklist](#-code-review-checklist)

---

## 🎨 Design System Pattern

### ✅ REQUIRED: Use CSS Variables for All Design Tokens

**All design values must use CSS variables.** Never hard-code spacing, colors, or sizes.

#### Design Token Structure:
```css
/* ✅ CORRECT - In globals.css */
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  
  /* Colors (HSL format) */
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
}
```

#### Usage in Components:
```typescript
// ✅ CORRECT - Using design tokens
<div className="p-4 text-sm rounded-lg">
  {/* p-4 uses var(--space-4) */}
  {/* text-sm uses var(--font-size-sm) */}
  {/* rounded-lg uses var(--radius-lg) */}
</div>

// ❌ WRONG - Hard-coded values
<div style={{ padding: '16px', fontSize: '14px' }}>
```

#### Adding shadcn/ui Components:
```bash
# ✅ CORRECT - Use shadcn CLI
npx shadcn@latest add button

# Components automatically use CSS variables
```

#### Updating Design System:
When design specifications arrive:
1. Update values in `/app/globals.css`
2. Components automatically use new values
3. No component code changes needed

---

## 🎨 Component Pattern

### ✅ Component Structure Rules

**Fixed Decision**: Tailwind CSS + shadcn/ui only (per `development-decisions.md`)

#### File Organization:
```typescript
// ✅ CORRECT - Component structure
export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className="tailwind-classes">
      {/* UI using shadcn/ui components */}
    </div>
  )
}

interface ComponentNameProps {
  prop1: string
  prop2?: number
}
```

#### Repository Usage in Components:
```typescript
// ✅ CORRECT - Repository in component
import { authRepository } from '@/libs/repositories/authRepository'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    authRepository.getUser().then(setUser)
  }, [])
  
  return <div>Dashboard content</div>
}
```

#### Naming Conventions:
- **Components**: PascalCase (`ButtonCheckout.tsx`)
- **Props Interface**: `ComponentNameProps`
- **Hooks**: camelCase starting with `use` (`useFileUpload.ts`)

---

## 🚫 Prohibited Patterns

### ❌ Class-Based Repositories:
```typescript
// NEVER DO THIS
class AuthRepository extends BaseRepository {
  async getUser() { /* ... */ }
}
```

### ❌ Auto-Detection Patterns:
```typescript
// NEVER DO THIS  
if (typeof window === 'undefined') {
  return serverClient()
} else {
  return browserClient()
}
```

### ❌ Raw API Routes:
```typescript
// NEVER DO THIS
export async function POST(req: NextRequest) {
  try {
    // Raw implementation
  } catch (error) {
    // Manual error handling
  }
}
```

### ❌ Client Components Using Repositories:
```typescript
// NEVER DO THIS - Client component importing server repositories
import { getUser } from '@/libs/repositories/auth'
// Use direct client instead in client components
```

### ❌ Non-Standard UI:
```typescript
// NEVER DO THIS - Wrong UI framework
import { Button } from 'react-bootstrap'
import { Spinner } from 'antd'

// NEVER DO THIS - DaisyUI classes (removed)
<button className="btn btn-primary">

// NEVER DO THIS - Hard-coded design values
<div style={{ padding: '16px', margin: '8px' }}>
```

---

## ✅ Code Review Checklist

**Before committing, verify:**

### Architecture Compliance:
- [ ] Read `/architecture/system-architecture.md` for this phase
- [ ] Followed data schema in `/architecture/data-schema.sql`
- [ ] Followed API/AI contracts in `/architecture/integration-contracts.md`
- [ ] No architectural deviations without user approval

### Code Style:
- [ ] Uses only Tailwind + shadcn/ui (no other UI libraries)
- [ ] All spacing/colors use CSS variables (design tokens)
- [ ] Proper TypeScript interfaces
- [ ] Consistent naming conventions (PascalCase components, camelCase functions)

### Prohibited Patterns:
- [ ] No class-based repositories
- [ ] No auto-detection patterns (typeof window checks)
- [ ] No raw API routes (always use wrappers)
- [ ] No hard-coded design values
- [ ] No non-standard UI frameworks

### Best Practices:
- [ ] Components contain only UI logic (business logic in `/libs`)
- [ ] Server Components for data fetching, Client Components for interactivity
- [ ] No unnecessary complexity (keep MVP simple)
- [ ] Clear, concise code (avoid over-engineering)

---

**Remember**: Read architecture files before each phase. Keep code lean, functional, and aligned with system design.