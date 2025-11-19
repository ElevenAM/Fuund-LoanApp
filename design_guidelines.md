# Commercial Real Estate Loan Platform - Design Guidelines

## Design Approach
**System-Based Approach** drawing from Stripe's financial clarity, Linear's modern form design, and Material Design's component structure. This application prioritizes trust, efficiency, and data clarity over visual flourishes.

## Key Design Principles
1. **Professional Trust**: Clean, uncluttered interfaces that convey credibility and security
2. **Progressive Clarity**: Each step reveals only necessary information without overwhelming
3. **Data Transparency**: Auto-calculated metrics displayed prominently with clear visual hierarchy
4. **Efficient Completion**: Minimize friction in form completion while maintaining thoroughness

## Typography System
- **Primary Font**: Inter or similar geometric sans-serif (Google Fonts)
- **Headings**: Semi-bold (600) for section titles, Medium (500) for subsections
- **Body Text**: Regular (400) for form labels and descriptions
- **Data/Numbers**: Tabular figures, Medium (500) weight for emphasis on calculated values
- **Sizes**: Use clear hierarchy - h1 (text-3xl), h2 (text-2xl), h3 (text-xl), body (text-base), small (text-sm)

## Layout & Spacing System
**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6 or p-8
- Section spacing: mb-8 or mb-12
- Form field gaps: gap-6
- Card/container spacing: p-8

**Application Layout Structure**:
- Fixed top navigation bar (authentication status, save indicator, progress tracking)
- Centered content area with max-w-4xl for optimal form readability
- Sidebar for multi-step progress indicator (desktop) or top progress bar (mobile/tablet)
- Full-width footer with support information

## Component Library

### Navigation & Progress
- **Top Bar**: Fixed header with logo, application save status ("All changes saved"), user menu
- **Progress Stepper**: Vertical sidebar (desktop) or horizontal top bar showing 7 steps with completion indicators
- **Step Indicators**: Completed (checkmark), Current (highlighted), Upcoming (outlined)

### Forms & Inputs
- **Text Inputs**: Large touch targets (h-12), clear labels above fields, helper text below when needed
- **Dropdowns**: Custom styled selects with clear visual hierarchy
- **Currency Inputs**: Dollar sign prefix, formatted with commas, right-aligned text
- **File Uploads**: Drag-and-drop zones with clear file type indicators, upload progress bars, thumbnail previews
- **Conditional Fields**: Smooth reveal/hide animations (duration-200), connected with subtle visual indicators
- **Required Fields**: Asterisk indicator, validation messaging inline

### Cards & Containers
- **Form Sections**: Bordered cards with subtle shadow (shadow-sm), rounded corners (rounded-lg)
- **Metric Cards**: Display auto-calculated values (LTV, DSCR) with large numbers, clear labels, and contextual indicators
- **Document Cards**: List uploaded files with file type icons, remove/replace actions, "Upload Later" badges
- **Summary Cards**: Review screen showing completed sections with edit capabilities

### Buttons & Actions
- **Primary CTA**: Large (h-12), full-width on mobile, "Continue" or "Submit for Term Sheet"
- **Secondary Actions**: "Save & Exit", "Back", outlined style
- **Tertiary**: "Upload Later", "Skip This Section" text-only links
- **Upload Triggers**: Dashed border zones with icon and descriptive text

### Data Display
- **Auto-Calculated Metrics**: Prominent display with large text (text-4xl for values), labels in smaller text
- **Loan Type Cards**: Radio-button style selection with descriptive icons and subtitle text
- **Status Dashboard**: Timeline view showing application stages with completion percentages
- **Missing Documents List**: Warning-style cards with action items clearly listed

### Feedback & Validation
- **Success Messages**: Checkmark icon with clear confirmation text
- **Error States**: Inline validation below fields, error summary at top of forms
- **Loading States**: Skeleton loaders for auto-calculations, progress indicators for file uploads
- **Auto-Save Indicator**: Subtle notification "Saving..." → "Saved" in top bar

## Animations
**Minimal and Purposeful Only**:
- Form field focus: subtle scale or shadow change (duration-200)
- Conditional field reveals: slide-down with fade (duration-300)
- Step transitions: smooth fade between screens (duration-300)
- Auto-save indicator: gentle fade in/out
- No decorative animations or scroll effects

## Images
**No Traditional Hero**: This is an application interface, not a marketing site. Focus on functional clarity.

**Where to Use Images**:
- **Loan Type Selection Screen**: Small illustrative icons representing each loan type (building icons, construction symbols)
- **Empty States**: Illustration for "No applications yet" dashboard state
- **Document Upload Zones**: Icon-based visual cues (PDF, spreadsheet, image file type indicators)
- **Confirmation/Success Screen**: Subtle illustration confirming submission

All images should be simple, icon-style illustrations that support functionality without creating visual noise.

## Application-Specific Patterns

### Multi-Step Wizard Flow
- Clear linear progression with ability to go back
- Each step fits in viewport without excessive scrolling
- Progress saved automatically on field blur
- Exit points clearly marked with save confirmation

### Quick Start Screen (Screen 1)
- Minimal 3-question layout, centered, large form fields
- Clear value proposition text: "Get your commercial loan term sheet in 7-10 minutes"
- Loan amount, property location, loan type as prominent selections

### Form Density
- Balance between completion speed and readability
- Group related fields in visual sections
- Use 2-column layouts on desktop for compact related fields (e.g., City/State)
- Single column for complex inputs requiring focus

### Review & Submit Screen
- Two-column summary layout showing all entered information
- Edit links for each section
- Auto-calculated metrics displayed in prominent metric cards
- Missing documents listed with clear "Upload Later" vs "Required Now" distinction
- Large, confident "Submit for Term Sheet" button

### Dashboard (Post-Submission)
- Status timeline showing: Draft → Submitted → Term Sheet → Underwriting → Closing
- Application summary card with key details
- Action items section for pending document uploads
- Lender-ordered reports section (view-only, informational)

This design prioritizes efficient form completion, clear data presentation, and professional trust throughout the loan application journey.