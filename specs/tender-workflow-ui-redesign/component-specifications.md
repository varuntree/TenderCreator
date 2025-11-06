# Component Specifications - Tender Workflow UI Redesign

## 1. Step Progress Indicator

### Visual Design
Based on reference image (specs/step_ui.png):

```
[1] ──────── [2] ──────── [3] ──────── [4] ──────── [5]
New Tender  Tender      Tender      Tender      Tender
           Planning    Outline     Content     Export
```

**Active/Completed Steps (1, 2):**
- Circle: Green background (#10B981)
- Number: White text, bold
- Label: Green text (#10B981), medium weight
- Line to next: Green (#10B981)

**Inactive Steps (3, 4, 5):**
- Circle: Light gray background (#E5E7EB)
- Number: Gray text (#9CA3AF)
- Label: Gray text (#9CA3AF), regular weight
- Line to next: Light gray (#E5E7EB)

### Component Props
```typescript
interface StepProgressIndicatorProps {
  currentStep: number // 1-5
  completedSteps: number[] // [1, 2, etc.]
  steps: Array<{
    id: number
    label: string
  }>
  className?: string
}
```

### Implementation Notes
- Use flexbox for even distribution
- Connecting lines via pseudo-elements or border
- Circle: 36px diameter, flex center content
- Font size: Number 14px bold, Label 13px
- Gap between steps: flex-1 for even spacing

---

## 2. Tab Navigation (Step 2)

### Visual Design
```
┌─────────────┬──────────────┬────────────────┐
│ Requirements│ 🎯 Bid/No Bid│ 🏆 Win Strategy│
└─────────────┴──────────────┴────────────────┘
      │             (active - green underline)
```

**Active Tab:**
- Text: Dark gray (#111827), medium weight
- Underline: 2px solid green (#10B981)
- Icon: Green tint
- Background: White

**Inactive Tab:**
- Text: Muted gray (#6B7280), regular weight
- No underline
- Icon: Gray
- Background: White
- Hover: Light gray background (#F9FAFB)

### Icons
- Requirements: `ListTodo` or `ClipboardList`
- Bid/No Bid: `Target`
- Win Strategy: `Trophy` or `Award`

### Component Usage
Use shadcn/ui `Tabs` component with custom styling.

---

## 3. Assessment Parameters Table

### Table Structure

| Criteria | Score (1-5) | Weight | Weighted Score |
|----------|-------------|--------|----------------|
| **Customer Relationship**<br/><small>Existing relationship, past performance, access to decision makers</small> | 0 / 5 | 16.7% | 0 |
| **Strategic Alignment**<br/><small>Alignment with business strategy, market priorities, growth objectives</small> | 5 / 5 | 16.7% | 0.17 |
| **Competitive Positioning**<br/><small>Competitive landscape, differentiating strengths, prime vs sub positioning</small> | 2.5 / 5 | 16.7% | 0.08 |
| **Solution Capability**<br/><small>Requirements coverage, expertise availability, similar experience</small> | 2.5 / 5 | 16.7% | 0.08 |
| **Resource Availability**<br/><small>Staff availability, project size fit, external resource needs</small> | 1.7 / 5 | 16.7% | 0.06 |
| **Profitability Potential**<br/><small>Profit margin expectations, payment terms, future opportunities</small> | 2.5 / 5 | 16.7% | 0.08 |

**Total Score: 42%** (displayed in badge at top right)

### Visual Specs
- **Header Row**: Light gray background (#F9FAFB), semibold text
- **Criteria Column**:
  - Title: 14px semibold, dark gray
  - Description: 12px regular, muted gray (#6B7280)
- **Score Column**:
  - Format: "X / 5"
  - Color: Blue (#3B82F6) for display
  - Font: 14px medium
- **Weight Column**: "16.7%" format, 14px regular
- **Weighted Score Column**: Decimal format (0.17), 14px medium
- **Row Padding**: 16px vertical, 12px horizontal
- **Borders**: 1px solid #E5E7EB between rows
- **Expandable**: Dropdown icon on right for each row (optional)

### Component Props
```typescript
interface AssessmentCriterion {
  id: string
  name: string
  description: string
  score: number // 0-5
  weight: number // percentage as decimal (0.167 = 16.7%)
  weightedScore: number // calculated
}

interface AssessmentParametersTableProps {
  criteria: AssessmentCriterion[]
  totalScore: number // 0-100 percentage
  incumbentStatus?: 'unknown' | 'known' | 'we-are-incumbent'
  onIncumbentStatusChange?: (status: string) => void
  className?: string
}
```

### Mock Data (for MVP)
```typescript
const MOCK_CRITERIA: AssessmentCriterion[] = [
  {
    id: '1',
    name: 'Customer Relationship',
    description: 'Existing relationship, past performance, access to decision makers',
    score: 0,
    weight: 0.167,
    weightedScore: 0
  },
  {
    id: '2',
    name: 'Strategic Alignment',
    description: 'Alignment with business strategy, market priorities, growth objectives',
    score: 5,
    weight: 0.167,
    weightedScore: 0.17
  },
  // ... etc
]
```

---

## 4. Bid Recommendation Card

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ AI Recommendation          [Regenerate Recommendation] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚠️ Not Recommended to Bid                          │
│  Analysis Complete - NO-BID                         │
│                                                     │
├──────────────────────────┬──────────────────────────┤
│ Key Strengths            │ Key Concerns             │
│                          │                          │
│ • Atomic Technology      │ ⚠️ The company profile   │
│   Services has 16 years  │    lacks critical...     │
│   of established ops...  │                          │
│                          │ ⚠️ With a calculated     │
│ • This company has       │    score of 0.42...      │
│   national presence...   │                          │
│                          │ ⚠️ The profile provides  │
│ • Atomic Technology      │    no information...     │
│   Services supports...   │                          │
└──────────────────────────┴──────────────────────────┘
```

### Visual Specs

**Header:**
- "AI Recommendation" - 16px semibold
- Regenerate button - outlined, green, small size, with sparkles icon

**Recommendation Badge:**
- Large badge/alert component
- "Not Recommended to Bid": Red background (#FEE2E2), red text (#DC2626), red border
- "Recommended to Bid": Green background (#D1FAE5), green text (#059669), green border
- Padding: 16px
- Border radius: 8px
- Icon: AlertCircle (red) or CheckCircle (green)

**Status Text:**
- "Analysis Complete - NO-BID/BID"
- 12px regular, muted gray
- Below recommendation badge

**Two Columns:**
- 50/50 split on desktop
- Stack on mobile

**Key Strengths:**
- Bulleted list
- Each item prefixed with green checkmark icon
- Text: 14px regular, dark gray
- Spacing: 12px between items

**Key Concerns:**
- Each concern in warning box:
  - Light red background (#FEF2F2)
  - Red border (#FEE2E2)
  - Padding: 12px
  - Border radius: 6px
  - Alert triangle icon (orange/red)
- Spacing: 8px between concern boxes
- Text: 14px regular, dark red (#991B1B)

### Component Props
```typescript
interface BidRecommendationCardProps {
  recommendation: 'bid' | 'no-bid'
  reasoning?: string
  strengths: string[]
  concerns: string[]
  isGenerating?: boolean
  onRegenerate?: () => void
  className?: string
}
```

### States
- **Loading**: Show skeleton or spinner
- **Generated**: Display full content
- **Error**: Show error message with retry button

---

## 5. Requirements View (Redesigned)

### Layout Changes

**Before:**
```
[Document Type]
[Description]

Mandatory Requirements
  [Card] Requirement 1
  [Card] Requirement 2

Optional Requirements
  [Card] Requirement 3
```

**After:**
```
┌─────────────────────────────────────────┐
│ [Document Type]          [X Requirements] │
│ [Description]                            │
└─────────────────────────────────────────┘

Mandatory Requirements

  ┌─────────────────────────────────────┐
  │ MANDATORY  Requirement text here... │
  │ Source: Section 3.2, Page 12        │
  └─────────────────────────────────────┘

  [more cards with better spacing...]

Optional Requirements

  [similar improved card layout...]
```

### Visual Improvements
- **Header**: Flex between document info and count badge
- **Count Badge**: Larger (16px text), outlined style, green border
- **Section Headers**: 18px semibold, margin-top: 24px
- **Cards**:
  - Padding: 16px (was 12px)
  - Gap between cards: 12px (was 8px)
  - Border: Subtle (#E5E7EB)
  - Shadow: None (flat design)
- **Badges**:
  - Mandatory: Destructive variant (red)
  - Optional: Secondary variant (gray)
  - Font size: 11px
  - Padding: 4px 10px
- **Source Text**:
  - Font size: 12px (was 11px)
  - Color: #9CA3AF (lighter muted)
  - Margin-top: 6px

---

## 6. Win Strategy Tab (Redesigned)

### Layout

```
Win Themes
Identify 3-5 key messages that differentiate your proposal

┌────────────────────────────────────────┐
│ • Theme 1 text...            [Edit] [×]│
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ • Theme 2 text...            [Edit] [×]│
└────────────────────────────────────────┘

[+ Add Win Theme]       [✨ Regenerate All]
```

### Visual Changes
- **Header**: 18px semibold + description text (13px muted)
- **Theme Cards**:
  - Padding: 16px
  - Border: 1px solid #E5E7EB
  - Border radius: 8px
  - Gap: 10px between cards
- **Bullet Icon**: Green dot or checkmark
- **Action Buttons**:
  - Edit: Ghost variant, small, icon size-4
  - Delete: Ghost variant, small, text-destructive
- **Add Button**: Full width, outlined, green border, plus icon
- **Regenerate Button**: Outlined, green, sparkles icon

---

## Component File Structure

```
components/workflow-steps/
├── step-progress-indicator.tsx (new)
├── assessment-parameters-table.tsx (new)
├── bid-recommendation-card.tsx (new)
├── workflow-tabs.tsx (modify)
├── requirements-view.tsx (modify)
└── strategy-generation-screen.tsx (major modify)
```

## CSS Utilities Needed

```css
/* Add to globals.css if needed */
.score-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.score-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.concern-box {
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  border-radius: 0.375rem;
  padding: 0.75rem;
}
```

## Accessibility Checklist

- [ ] All icons have aria-labels
- [ ] Step progress has role="navigation" and aria-label
- [ ] Table has proper thead/tbody structure
- [ ] Interactive elements have focus visible states
- [ ] Color is not the only indicator (use icons + text)
- [ ] Keyboard navigation works for all tabs
- [ ] Screen reader announces step changes
- [ ] ARIA live regions for loading/generation states
