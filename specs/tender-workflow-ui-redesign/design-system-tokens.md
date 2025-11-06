# Design System Tokens - Tender Workflow UI

Extracted from reference image: `specs/step_ui.png`

## Step Progress Indicator

**Structure:**
- 5 numbered steps with labels
- Horizontal layout with connecting lines
- Step 1: "New Tender" (active - green filled)
- Step 2: "Tender Planning" (active - green filled)
- Steps 3-5: "Tender Outline", "Tender Content", "Tender Export" (inactive - gray)

**Visual Specs:**
- Active step: Green background circle, white number, green label text
- Completed: Same as active
- Inactive: Light gray background, gray number, gray label text
- Connecting lines: Green for completed segments, gray for inactive
- Circle size: ~32-40px diameter
- Font: Number bold, label regular
- Spacing: Even distribution across width

## Tab Navigation (Step 2)

**Tabs:**
1. Requirements (checklist icon)
2. Bid/No Bid (target/crosshair icon)
3. Win Strategy (trophy icon)

**Visual Style:**
- Active tab: Green underline, dark text
- Inactive tabs: No underline, muted gray text
- Background: Light gray (#F3F4F6)
- Padding: Generous vertical and horizontal spacing
- Icons: Left-aligned with label

## Colors

### Primary Palette
- **Primary Green**: #10B981 (or similar emerald green)
- **Green Hover**: #059669
- **Success/Completed**: Same as primary green

### Text Colors
- **Headings**: #111827 (gray-900 equivalent)
- **Body Text**: #374151 (gray-700)
- **Muted/Secondary**: #6B7280 (gray-500)
- **Disabled**: #9CA3AF (gray-400)

### Background Colors
- **Page Background**: #FFFFFF
- **Card Background**: #FFFFFF
- **Section Background**: #F9FAFB (gray-50)
- **Table Header**: #F3F4F6 (gray-100)
- **Hover**: #F9FAFB

### Semantic Colors
- **Destructive/Mandatory**: #EF4444 (red-500)
- **Warning**: #F59E0B (amber-500)
- **Info**: #3B82F6 (blue-500)

### Border Colors
- **Default Border**: #E5E7EB (gray-200)
- **Input Border**: #D1D5DB (gray-300)
- **Divider**: #F3F4F6 (gray-100)

## Typography

### Font Family
- **Primary**: Inter, system-ui, sans-serif (from existing design system)
- **Mono**: For code/numbers if needed

### Heading Scale
- **H1 (Page Title)**: 24px (1.5rem), bold (700)
- **H2 (Section Title)**: 18-20px (1.125-1.25rem), semibold (600)
- **H3 (Card Title)**: 16px (1rem), semibold (600)
- **H4 (Subsection)**: 14px (0.875rem), medium (500)

### Body Text
- **Large**: 16px (1rem), regular (400)
- **Base**: 14px (0.875rem), regular (400)
- **Small**: 12px (0.75rem), regular (400)
- **Tiny/Caption**: 11px (0.6875rem), regular (400)

### Line Heights
- **Tight**: 1.25 (headings)
- **Normal**: 1.5 (body text)
- **Relaxed**: 1.625 (longer paragraphs)

## Spacing

### Container/Layout
- **Max Width**: 1280px
- **Page Padding**: 32px (2rem) horizontal, 24px (1.5rem) vertical
- **Section Gap**: 24px-32px (1.5-2rem)

### Component Spacing
- **Card Padding**: 24px (1.5rem)
- **Card Gap**: 16px (1rem) between cards
- **Form Group Gap**: 16px (1rem)
- **Button Padding**: 12px horizontal, 8px vertical (default size)

### Internal Spacing
- **Stack Gap Small**: 8px (0.5rem)
- **Stack Gap Medium**: 12px (0.75rem)
- **Stack Gap Large**: 16px (1rem)
- **Inline Gap**: 8px (0.5rem)

## Components

### Buttons
- **Border Radius**: 6px (0.375rem)
- **Height Default**: 36px (h-9)
- **Height Small**: 32px (h-8)
- **Height Large**: 40px (h-10)
- **Font Weight**: 500 (medium)
- **Padding X**: 16px (px-4)
- **Shadow**: Subtle (shadow-sm)

### Cards
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 8px (0.5rem)
- **Padding**: 24px (p-6)
- **Shadow**: None or very subtle
- **Background**: White

### Badges
- **Border Radius**: 4px (rounded)
- **Padding**: 4px 8px (px-2 py-1)
- **Font Size**: 12px (text-xs)
- **Font Weight**: 500 (font-medium)
- **Variants**:
  - Default: Gray background
  - Destructive: Red background, white text
  - Success: Green background, white text
  - Secondary: Light gray background, dark text

### Table
- **Header Background**: #F9FAFB (gray-50)
- **Header Text**: #374151, semibold
- **Border**: 1px solid #E5E7EB
- **Row Padding**: 12px vertical, 16px horizontal
- **Hover**: #F9FAFB background
- **Alt Row**: Optional subtle background (#FAFAFA)

### Inputs
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 6px (rounded-md)
- **Padding**: 8px 12px (px-3 py-2)
- **Focus Border**: Primary green (#10B981)
- **Focus Ring**: 2px primary green with opacity
- **Height**: 36px (h-9)

### Tabs
- **Border Bottom**: 2px solid (active), none (inactive)
- **Active Color**: Primary green
- **Inactive Color**: #6B7280 (gray-500)
- **Padding**: 12px horizontal, 8px vertical
- **Gap**: 24px between tabs

## Assessment Parameters Table (Specific)

**Columns:**
1. Criteria (50% width) - Name + description
2. Score (15% width) - 1-5 rating with colored circle
3. Weight (15% width) - Percentage
4. Weighted Score (20% width) - Calculated value

**Row Structure:**
- **Criterion Name**: 14px semibold, dark gray
- **Description**: 12px regular, muted gray
- **Row Height**: ~60-70px (auto with padding)
- **Padding**: 16px vertical, 12px horizontal

**Score Display:**
- Colored circle (blue: 0, green-red gradient for 1-5)
- Number next to circle
- Format: "2.5 / 5"

**Total Score:**
- Prominent badge/pill at top right
- Large text: "42%" or similar
- Label: "Total Score"

## Bid Recommendation Card

**Layout:**
- Header: "AI Recommendation" + Regenerate button
- Badge: Large recommendation (Bid / No-Bid)
- Status: "Analysis Complete - NO-BID"
- Two columns: Key Strengths | Key Concerns

**Strengths:**
- Bullet list
- Green checkmark icons
- Regular text

**Concerns:**
- Bullet list in warning boxes
- Orange/red alert icons
- Red background tint (#FEF2F2)
- Border: Red subtle

## Icons

### Size Guidelines
- **Inline**: 16px (size-4)
- **Standalone**: 20px (size-5)
- **Large**: 24px (size-6)

### Common Icons
- Checklist/Check: Requirements, completed steps
- Target/Crosshair: Bid decision
- Trophy: Win strategy
- AlertCircle: Concerns/warnings
- CheckCircle: Strengths/success
- Sparkles: AI generation
- Edit: Edit actions
- Trash: Delete actions
- Plus: Add actions
- ChevronRight: Navigation forward
- ChevronLeft: Navigation back

## Responsive Breakpoints

- **Desktop Focus**: 1200px+ (primary target)
- **Tablet**: 768px-1199px (should not break)
- **Mobile**: <768px (low priority, maintain readability)

## Accessibility

- **Focus Visible**: 2px ring, primary color
- **Color Contrast**: WCAG AA minimum (4.5:1 for text)
- **Interactive States**: Clear hover, focus, active states
- **ARIA Labels**: For icons, progress indicators
- **Keyboard Navigation**: Tab order, enter/space for actions
