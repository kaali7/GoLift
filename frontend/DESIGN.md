# Design System: GoLift
**Project ID:** 7394634232384313618

## 1. Visual Theme & Atmosphere
GoLift embodies a **Premium Athletic** atmosphere. It is clean, high-contrast, and energetic, focusing on clarity and motivation. The aesthetic mixes minimalist light backgrounds with vibrant, electric purple accents and subtle glassmorphism to create a state-of-the-art feel.

## 2. Color Palette & Roles
* **Vibrant Brand Purple (#8B5CF6):** Used for primary call-to-action buttons, active navigation states, and key highlights.
* **Deep Primary Purple (#6D28D9):** Used for secondary highlights and deep accent text.
* **Soft Air Background (#FAFAFA):** The primary page background, providing a clean and airy canvas.
* **Pure Crystal White (#FFFFFF):** Used for card surfaces to make them "pop" against the soft background.
* **Midnight Surface (#111827):** Used for cards and surfaces in Dark Mode.
* **Lush Success Green (#10B981):** Used for "Warmup" indicators, completed workout states, and positive progress.
* **Deep Muted Gray (#6B7280):** Used for secondary labels and less prominent information.
* **Electric Red (#EF4444):** Used for destructive actions like account deletion or logout.

## 3. Typography Rules
* **Headings:** **Space Grotesk** is used for all titles. It is styled with bold or black weights, tracking-tight, and often in italics for an "in-motion" athletic feel.
* **Body:** **Inter** is the primary body font, chosen for its extreme legibility at small sizes.
* **Hierarchy:** Large, bold headings contrast sharply with clean, weighted body text to establish a clear information hierarchy.

## 4. Component Stylings
* **Buttons:** 
    * **Shape:** Pill-shaped (fully rounded) or generously rounded corners (1rem).
    * **Style:** High-contrast backgrounds (Vibrant Purple) with whisper-soft shadows.
    * **Behavior:** Subtle scale-up or shadow intensification on hover.
* **Cards/Containers:** 
    * **Shape:** Generously rounded corners (16px / 1rem radius).
    * **Surface:** Backdrop-blur (glassmorphism) with 80% opacity on backgrounds.
    * **Shadow:** Soft, diffused purple-tinted shadows (rgba(109, 40, 217, 0.04)) to create depth without clutter.
* **Inputs/Forms:** 
    * **Style:** Pill-shaped or rounded-2xl.
    * **Stroke:** Border-less or very thin soft gray borders.
    * **Background:** Muted, light gray backgrounds (oklch(0.94 0.02 270)) that darken slightly on focus.

* **Navigation**: 
    - **Structure**: A simplified 3-tab navigation system.
    - **Tabs**: **Insights**, **Training**, and **Profile**.
    - **Style**: Text links in the desktop header; persistent icon-based bottom nav for mobile.
    - **Active State**: Primary Purple (#8B5CF6) font or icon color with a subtle indicator bar.

## 5. Layout Principles
* **Whitespace:** Generous whitespace is used to reduce cognitive load and keep the focus on the user's progress.
* **Margins:** 1rem (16px) or 2rem (32px) standard padding for containers.
* **Grid:** A responsive 12-column grid for desktop, collapsing to a single-column stacked layout for mobile.
