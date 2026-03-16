# Pomegranate CMS - UI/UX Design Mockups

**Visual Reference for Implementation**

---

## Design 1: Toast Notification System

### BEFORE (Browser Alert)
```
┌─────────────────────────────────────┐
│  ⚠️ Alert                           │
│                                     │
│  Failed to delete business          │
│                                     │
│            [OK]                     │
└─────────────────────────────────────┘
```

**Problems:**
- Blocks entire UI
- Ugly native styling
- No context preservation
- Jarring user experience

---

### AFTER (Sonner Toast Notifications)

#### Success Toast
```
┌─────────────────────────────────────────────────────┐
│ ✓ Business deleted successfully               ✕  │
└─────────────────────────────────────────────────────┘
   ↑ Position: Top-right
   ↑ Duration: 4 seconds
   ↑ Auto-dismiss with animation
   ↑ Rich colors (green background)
```

#### Error Toast
```
┌─────────────────────────────────────────────────────┐
│ ✕ Failed to save business                     ✕  │
│   Database connection timeout                      │
└─────────────────────────────────────────────────────┘
   ↑ Shows error title + description
   ↑ Red styling
   ↑ Longer duration (6 seconds)
```

#### Loading Toast
```
┌─────────────────────────────────────────────────────┐
│ ⏳ Saving business...                              │
└─────────────────────────────────────────────────────┘
   ↑ Spinner animation
   ↑ Programmatically dismissed after success/error
```

---

## Design 2: Confirmation Dialog

### BEFORE (Browser Confirm)
```
┌─────────────────────────────────────┐
│  Confirm                            │
│                                     │
│  Are you sure you want to delete    │
│  this service?                      │
│                                     │
│         [Cancel]  [OK]              │
└─────────────────────────────────────┘
```

---

### AFTER (Custom Styled Dialog)

#### Destructive Action
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⚠️                                                        │
│                                                             │
│   Delete Service?                                           │
│   ─────────────────                                         │
│   This will permanently remove this service and all         │
│   its related pages. This action cannot be undone.          │
│                                                             │
│                                    [Cancel]  [Delete]       │
│                                           ↑ Red button      │
└─────────────────────────────────────────────────────────────┘
   ↑ Backdrop blur
   ↑ Centered modal
   ↑ Warning icon
   ↑ Clear action buttons
   ↑ Click outside to cancel
   ↑ Escape key to cancel
```

#### Standard Action
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Confirm Action                                            │
│   ─────────────────                                         │
│   Are you sure you want to publish this page?               │
│                                                             │
│                                    [Cancel]  [Publish]      │
│                                           ↑ Primary color   │
└─────────────────────────────────────────────────────────────┘
```

---

## Design 3: Skeleton Loading Screens

### BEFORE (Spinner)
```
                    Page Content
                         ↓
            ┌─────────────────────┐
            │                     │
            │        ↻            │  ← Centered spinner
            │                     │     Blocks ALL content
            │                     │
            └─────────────────────┘
```

---

### AFTER (Skeleton Screens)

#### Table Skeleton
```
┌─────────────────────────────────────────────────────────────────────┐
│ Services                                                    [+ Add] │ ← Header skeleton
├─────────────────────────────────────────────────────────────────────┤
│ ████████              ████████              ████████                │ ← Column headers
├─────────────────────────────────────────────────────────────────────┤
│ ████████████████      ████████              ████████  [⚫] [⚫]      │ ← Row 1
│ ████████████████      ████████              ████████  [⚫] [⚫]      │ ← Row 2
│ ████████████████      ████████              ████████  [⚫] [⚫]      │ ← Row 3
│ ████████████████      ████████              ████████  [⚫] [⚫]      │ ← Row 4
│ ████████████████      ████████              ████████  [⚫] [⚫]      │ ← Row 5
└─────────────────────────────────────────────────────────────────────┘
   ↑ Gray pulsing bars
   ↑ Layout matches actual content
   ↑ Reduces perceived load time
```

#### Card Grid Skeleton
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ ████████████████    │  │ ████████████████    │  │ ████████████████    │
│ ████████            │  │ ████████            │  │ ████████            │
│                     │  │                     │  │                     │
│ ████████████████████│  │ ████████████████████│  │ ████████████████████│
│ ████████████████████│  │ ████████████████████│  │ ████████████████████│
│ ████████████████    │  │ ████████████████    │  │ ████████████████    │
│                     │  │                     │  │                     │
│             [████]  │  │             [████]  │  │             [████]  │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

#### Form Skeleton
```
Edit Service                           ← Page title

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Service Name *                                                     │
│  ████████████████████████████████████████████████████████████████   │ ← Input skeleton
│                                                                     │
│  Slug                                                               │
│  ████████████████████████████████████████████████████████████████   │
│                                                                     │
│  Description                                                        │
│  ████████████████████████████████████████████████████████████████   │
│  ████████████████████████████████████████████████████████████████   │
│  ████████████████████████████████████████████████████████████████   │
│                                                                     │
│                                                      [████████████] │ ← Button skeleton
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design 4: Button States & Accessibility

### BEFORE (Current)
```
Normal:  [Save Changes]     ← Default styling
Hover:   [Save Changes]     ← Subtle color change (hard to see)
Focus:   [Save Changes]     ← No visible ring
Loading: [Save Changes]     ← No visual change (just disabled)
```

---

### AFTER (Enhanced)

#### Primary Button States
```
Normal:  ┌────────────────┐
         │ Save Changes   │     ← bg-primary text-white
         └────────────────┘

Hover:   ┌────────────────┐
         │ Save Changes   │     ← Slightly darker background
         └────────────────┘
                 ↑

Focus:   ┌────────────────┐
         │ Save Changes   │     ← Blue ring (2px) with offset
         └────────────────┘
               ▓▓▓▓▓▓▓▓▓▓
                  ↑ Ring

Active:  ┌────────────────┐
         │ Save Changes   │     ← Slightly inset/pressed
         └────────────────┘

Loading: ┌────────────────┐
         │ ↻ Saving...    │     ← Spinner + disabled state
         └────────────────┘

Disabled: ┌────────────────┐
          │ Save Changes   │     ← 50% opacity
          └────────────────┘
```

#### Icon Button with ARIA
```
Normal:  [⚫]                 ← Just icon (no label)
         ↑
     aria-label="Edit Service"

Hover:   [⚫]
         ↑ Blue background

Focus:   [⚫]
         ↑ Blue ring visible

Screen reader: "Edit Service, button"
```

---

## Design 5: Form Validation

### BEFORE (No Validation)
```
┌─────────────────────────────────────────────────────────────────────┐
│ Edit Business                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Business Name                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │ ← Empty
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ not-an-email                                                │    │ ← Invalid but no error
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                                            [Save Changes]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

User clicks Save → Alert("Failed to save business")
```

---

### AFTER (Real-time Validation)

#### Initial State
```
┌─────────────────────────────────────────────────────────────────────┐
│ Edit Business                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Business Name *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                                            [Save Changes]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
   ↑ * indicates required
```

#### After Blur (Empty Required Field)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Business Name *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │ ← Red border
│  └─────────────────────────────────────────────────────────────┘    │
│  ⚠ Business name is required                                        │ ← Error message
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### After Typing Invalid Email
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ not-an-email                                                │    │ ← Red border
│  └─────────────────────────────────────────────────────────────┘    │
│  ⚠ Please enter a valid email address                               │ ← Error message
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Valid State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Business Name *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ My Business                                                 │    │ ← Green border
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Email                                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ contact@business.com                                        │    │ ← Green border
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                                            [Save Changes]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Submit with Errors
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ⚠ Please fix the following errors:                                 │ ← Error summary
│     • Business name is required                                     │
│     • Please enter a valid email address                            │
│                                                                     │
│  Business Name *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │ ← Focused with error
│  └─────────────────────────────────────────────────────────────┘    │
│  ⚠ Business name is required                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design 6: Improved Empty States

### BEFORE
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                           📦                                        │
│                                                                     │
│                   No services yet                                   │
│                                                                     │
│              Create your first service to                           │
│                   begin Phase 2.                                    │
│                                                                     │
│                   [Create Service]                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
   ↑ Boring
   ↑ Generic icon
   ↑ No personality
```

---

### AFTER (Enhanced with Context)

#### Services Empty State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌─────────────────┐                              │
│                    │   🎯            │                              │
│                    │  Services are   │  ← Illustration/Graphic
│                    │  the foundation │     of your pSEO strategy
│                    │   of pSEO       │
│                    └─────────────────┘                              │
│                                                                     │
│              No services configured yet                             │
│                                                                     │
│    Services are the "80%" of your pSEO content. Define your core    │
│    offerings here to generate location-specific service pages.      │
│                                                                     │
│        [Create Your First Service]  [Learn More →]                  │
│                                                                     │
│     ───────────────────────────────────────────────────────────     │
│     💡 Tip: Start with your top 3-5 services for best results       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Blog Topics Empty State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌─────────────────┐                              │
│                    │    🗺️            │                              │
│                    │  Build your     │  ← Mindmap illustration
│                    │  topical map    │
│                    │                 │
│                    └─────────────────┘                              │
│                                                                     │
│              No topic roadmap generated                             │
│                                                                     │
│    Generate an AI-powered topical authority roadmap to plan your    │
│    blog content strategy. This creates a semantic mindmap of        │
│    pillar pages, clusters, and supporting content.                  │
│                                                                     │
│              [Generate Initial Roadmap]                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design 7: Sidebar Navigation Improvements

### BEFORE
```
┌────────────────────────────────────┐
│ Pomegranate v2                     │
│ Production Build                   │
├────────────────────────────────────┤
│                                    │
│ CORE DATA                          │
│ • Dashboard                        │
│ • Identity & Brand                 │
│ • Services                         │
│ • Locations                        │
│ • Knowledge Graph                  │
│ • People / Authors                 │
│                                    │
│ CONTENT MANAGEMENT                 │ ← Too many items!
│ • Blog Topic Hubs                  │
│ • Media Library                    │
│ • Pages                            │
│ • Blog Posts                       │
│ • Industries                       │
│ • Case Studies                     │
│ • Reviews                          │
│ • Partner Orgs                     │
│ • Downloads                        │
│ • Free Tools                       │
│                                    │
│ CONTENT BUILDING                   │
│ • Batch Generation                 │
│                                    │
├────────────────────────────────────┤
│ user@email.com              [↪]    │
└────────────────────────────────────┘
```

---

### AFTER (Grouped & Collapsible)

```
┌────────────────────────────────────┐
│ Pomegranate v2            [☀/🌙]   │ ← Dark mode toggle
│ Production Build                   │
├────────────────────────────────────┤
│                                    │
│ ▼ CORE DATA                    [3] │ ← Collapsible with count
│ ✓ Dashboard                        │
│ ✓ Identity & Brand                 │
│ ✓ Services                         │
│ ✓ Locations                        │
│ ✓ Knowledge Graph                  │
│ ✓ People / Authors                 │
│                                    │
│ ▼ CONTENT                      [5] │ ← Grouped
│ ✓ Pages                            │
│ ✓ Blog Posts                       │
│ ✓ Media Library                    │
│ ✓ Blog Topic Hubs                  │
│                                    │
│ ▼ MARKETING                    [4] │
│ ✓ Industries                       │
│ ✓ Case Studies                     │
│ ✓ Reviews                          │
│ ✓ Free Tools                       │
│                                    │
│ ▼ RESOURCES                    [2] │
│ ✓ Partner Orgs                     │
│ ✓ Downloads                        │
│                                    │
│ ▼ GENERATION                   [1] │
│ • Batch Generation        ← Active │
│                                    │
├────────────────────────────────────┤
│ ⌨️ Keyboard Shortcuts (?)          │ ← Quick help
├────────────────────────────────────┤
│ user@email.com           [⚙] [↪]   │ ← Settings + Sign out
└────────────────────────────────────┘
```

---

## Design 8: Dashboard Improvements

### BEFORE
```
┌─────────────────────────────────────────────────────────────────────┐
│ Pomegranate Dashboard                                               │
│ Welcome to the Knowledge Graph CMS...                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────────┐  ┌───────────────────────────────────────────┐   │
│ │ Current Phase  │  │ Site Architecture                         │   │
│ │ Phase 1: Setup │  │ ┌───┐ ┌───┐ ┌───┐ ┌─────┐ ┌───────────┐  │   │
│ │                │  │ │ 1 │ │ 3 │ │ 5 │ │  0  │ │     0     │  │   │
│ │ [Continue...]  │  │ │ B │ │ S │ │ L │ │ Blog│ │  Generated│  │   │
│ └────────────────┘  │ └───┘ └───┘ └───┘ └─────┘ └───────────┘  │   │
│                     └───────────────────────────────────────────┘   │
│                                                                     │
│ Build Progress                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 1  Business & Brand                    [Start Phase]            │ │
│ │ 2  Services                            [Pending]                │ │
│ │ 3  Target Locations                    [Pending]                │ │
│ │ 4  Knowledge Entities                  [Pending]                │ │
│ │ 5  Select Service Pages                [Pending]                │ │
│ │ 6  Generate Blog Topics                [Pending]                │ │
│ │ 7  Generate Site                       [Pending]                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### AFTER (Interactive Dashboard)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard                                                    [?]    │ ← Help button
│ Welcome back! Here's your pSEO progress                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────────┐  ┌───────────────────────────────────────────┐   │
│ │ 🎯 Next Action │  │ 📊 Site Architecture              [View →]│   │ ← Clickable
│ │                │  │                                           │   │
│ │ Add your first │  │ ┌───┐ ┌───┐ ┌───┐ ┌─────┐ ┌───────────┐  │   │
│ │ service to     │  │ │ 1 │ │ 3 │ │ 5 │ │  0  │ │     0     │  │   │
│ │ begin Phase 2  │  │ │ B │ │ S │ │ L │ │Blog │ │  Generated│  │   │
│ │                │  │ └───┘ └───┘ └───┘ └─────┘ └───────────┘  │   │
│ │ [Add Service]  │  │                                           │   │
│ └────────────────┘  └───────────────────────────────────────────┘   │
│                                                                     │
│ Build Progress                                          [Expand ▼]  │ ← Collapsible
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │ ✓ Business & Brand                                    Completed │ │ ← Checkmark
│ │   └─ Set up 15 minutes ago                                      │ │
│ │                                                                 │ │
│ │ → Services (Current)                                  [Resume]  │ │ ← Active
│ │   └─ 3 of 5 steps complete                                      │ │
│ │       ○ Service Overview                                        │ │
│ │       ● SEO Strategy     ← In Progress                          │ │
│ │       ○ Content Blocks                                          │ │
│ │                                                                 │ │
│ │ ○ Target Locations                                    [Start]   │ │ ← Pending
│ │ ○ Knowledge Entities                                  [Start]   │ │
│ │ ○ Select Service Pages                                [Start]   │ │
│ │ ○ Generate Blog Topics                                [Start]   │ │
│ │ ○ Generate Site                                       [Start]   │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Quick Stats                                                  │ │
│ │                                                                 │ │
│ │ Recent Activity:                                                │ │
│ │ • 2 services added yesterday                                    │ │
│ │ • 5 pages generated this week                                   │ │
│ │ • 1 page published                                              │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design 9: Dark Mode

### Light Mode (Current)
```
Background: #f8fafc (slate-50)
Cards: #ffffff
Text: #0f172a (slate-900)
Primary: Current primary color
```

---

### Dark Mode

```
Background: #0f172a (slate-900)
Cards: #1e293b (slate-800)
Border: #334155 (slate-700)
Text Primary: #f8fafc (slate-50)
Text Secondary: #94a3b8 (slate-400)
Primary: Same hue, adjusted saturation
Success: #22c55e (green-500)
Error: #ef4444 (red-500)
Warning: #f59e0b (amber-500)
```

#### Sidebar Dark
```
┌────────────────────────────────────┐
│ Pomegranate v2            [☀️]     │
├────────────────────────────────────┤
│                                    │
│ CORE DATA                          │
│ • Dashboard                        │
│ • Identity & Brand                 │
│ ...                                │
│                                    │
│ All items:                         │
│ Background: #0f172a                │
│ Text: #94a3b8                      │
│ Active: bg-primary/20              │
│         text-primary               │
│         border-r-primary           │
└────────────────────────────────────┘
```

---

## Color Reference

### Light Mode Palette
```
Primary:         #3b82f6 (blue-500)
Primary Hover:   #2563eb (blue-600)
Success:         #22c55e (green-500)
Success Light:   #dcfce7 (green-100)
Warning:         #f59e0b (amber-500)
Warning Light:   #fef3c7 (amber-100)
Error:           #ef4444 (red-500)
Error Light:     #fee2e2 (red-100)
Background:      #f8fafc (slate-50)
Card:            #ffffff
Text Primary:    #0f172a (slate-900)
Text Secondary:  #64748b (slate-500)
Border:          #e2e8f0 (slate-200)
```

### Dark Mode Palette
```
Primary:         #60a5fa (blue-400)      ← Lighter for dark bg
Primary Hover:   #3b82f6 (blue-500)
Success:         #4ade80 (green-400)
Success Light:   #14532d (green-900)
Warning:         #fbbf24 (amber-400)
Warning Light:   #78350f (amber-900)
Error:           #f87171 (red-400)
Error Light:     #7f1d1d (red-900)
Background:      #0f172a (slate-900)
Card:            #1e293b (slate-800)
Text Primary:    #f8fafc (slate-50)
Text Secondary:  #94a3b8 (slate-400)
Border:          #334155 (slate-700)
```

---

## Spacing & Layout Guidelines

### Container Sizes
```
Small Form:  max-w-3xl (48rem / 768px)
Medium Page: max-w-5xl (64rem / 1024px)
Large Page:  max-w-7xl (80rem / 1280px)
Full Width:  max-w-none
```

### Spacing Scale
```
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
2xl: 2.5rem  (40px)
```

### Component Spacing
```
Card Padding:        p-6 (24px)
Section Gap:         gap-6 (24px)
Form Field Gap:      space-y-4 (16px)
Button Padding:      px-4 py-2 (16px x 8px)
Table Cell Padding:  px-6 py-4 (24px x 16px)
```

---

## Animation Specifications

### Toast Animations
```
Enter:  slide-in-right + fade-in (300ms, ease-out)
Exit:   slide-out-right + fade-out (200ms, ease-in)
```

### Modal Animations
```
Backdrop: fade-in (200ms)
Content:  scale-in + fade-in (300ms, cubic-bezier(0.16, 1, 0.3, 1))
Exit:     reverse (200ms)
```

### Skeleton Pulse
```
Animation: pulse (2s, ease-in-out, infinite)
Opacity:   1 → 0.5 → 1
```

### Button Hover
```
Duration: 150ms
Easing:   ease-in-out
Property: background-color, transform
```

### Focus Ring
```
Width:    2px
Offset:   2px
Color:    primary color
Duration: 0ms (instant)
```

---

**Last Updated:** March 16, 2026
