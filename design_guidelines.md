{
  "scope": {
    "applies_to": "ONLY /app/frontend/src/figma_home/components/frame-component18.jsx + frame-component18.module.css",
    "do_not_change": [
      "Global CSS variables in /src/index.css",
      "Other homepage sections",
      "SplitText component behavior (keep per-character reveal, 28ms stagger, in-view timing philosophy)",
      "Filter funnel logic (Brand → Model → Year → CTA navigates to /catalog with params)"
    ]
  },
  "brand_attributes": [
    "boutique import service",
    "quietly confident",
    "paper-beige editorial",
    "trustworthy (navy structure)",
    "selective gold accent (CTA/highlights only)",
    "restraint over spectacle"
  ],
  "design_tokens_local_to_hero": {
    "note": "Do NOT edit global tokens. Define hero-local CSS variables inside .heroContentWrapper or .heroContent in the module.",
    "css_vars": {
      "--hero-bg": "var(--bibi-beige)",
      "--hero-surface": "var(--bibi-beige-3)",
      "--hero-ink": "var(--bibi-ink)",
      "--hero-ink-2": "var(--bibi-ink-2)",
      "--hero-line": "var(--bibi-line)",
      "--hero-navy": "var(--bibi-blue)",
      "--hero-gold": "var(--bibi-yellow)",
      "--hero-gold-2": "var(--bibi-yellow-2)",
      "--hero-shadow": "0 18px 50px rgba(23,32,42,0.10)",
      "--hero-shadow-tight": "0 10px 26px rgba(23,32,42,0.10)",
      "--hero-radius-lg": "20px",
      "--hero-radius-md": "14px",
      "--hero-radius-sm": "12px",
      "--hero-pad-x": "clamp(1rem, 3vw, 4rem)",
      "--hero-pad-y": "clamp(1.25rem, 3.5vw, 3.75rem)",
      "--hero-max": "1200px"
    }
  },
  "typography": {
    "font_family": "Mazzard (already loaded)",
    "hero_eyebrow": {
      "size": "0.875rem",
      "tracking": "0.14em",
      "weight": 500,
      "transform": "uppercase",
      "color": "var(--hero-ink-2)"
    },
    "hero_h1_lines": {
      "note": "Keep existing SplitText per-line structure; only restyle classes.",
      "size_desktop": "clamp(2.25rem, 4.6vw, 6.25rem)",
      "size_mobile": "clamp(1.75rem, 8vw, 2.5rem)",
      "weight": 700,
      "transform": "uppercase",
      "line_height": 1.0,
      "letter_spacing": "-0.02em"
    },
    "kpi_straplines": {
      "size": "0.95rem (desktop), 0.875rem (mobile)",
      "weight": 500,
      "color": "var(--hero-ink-2)",
      "prefix_style": "Keep leading '/' but render it in navy at 60% opacity for a premium 'rule' feel."
    }
  },
  "hero_layout_options": {
    "option_A_editorial_photo_window": {
      "name": "Editorial ‘Photo Window’ + Navy Rule",
      "what_changes": [
        "Remove the left-shadow/right-clean split entirely.",
        "Hero becomes a beige editorial canvas with a framed photo window on the right.",
        "Text sits on the left as a clean column; image is cropped like a magazine ad.",
        "Filter bar becomes a floating surface card anchored near bottom, centered."
      ],
      "grid": {
        "desktop": "12-col grid inside max-width container; left text spans cols 1–6, image spans cols 7–12.",
        "mobile": "Single column: eyebrow + headline + KPIs, then image window, then filter bar."
      },
      "dominant_decor": [
        "A thin vertical navy rule between text and image (2px) with a small gold notch (8px) near the headline baseline.",
        "Optional: subtle paper-noise overlay via CSS background-image (very low opacity)."
      ],
      "image_treatment": {
        "container": "Rounded rectangle ‘window’ with 1px line border and soft shadow.",
        "crop": "object-position: 60% center (keeps car readable).",
        "overlay": "No dark overlay. If needed for legibility, use a tiny top vignette INSIDE the image only (rgba(22,46,81,0.06) at top 20%)."
      },
      "splittext_integration": "Headline remains left; the navy rule visually ‘catches’ the diagonal character cascade.",
      "filter_bar": "Centered floating card with segmented fields; CTA in gold."
    },
    "option_B_offset_photo_plate": {
      "name": "Offset Photo ‘Plate’ + Corner Stamp",
      "what_changes": [
        "Image becomes an offset ‘plate’ that slightly overlaps the beige hero background (like a printed photo on paper).",
        "Text sits above-left; KPIs become a 3-row list with small navy bullets.",
        "Filter bar docks to the bottom edge of the hero container (still inside hero), spanning max-width."
      ],
      "dominant_decor": [
        "A small ‘stamp’ chip near the image corner: navy outline pill with gold dot (8px).",
        "A faint oversized watermark ‘BIBI’ in navy ghost behind the image (opacity 0.06)."
      ],
      "image_treatment": {
        "frame": "Double-layer frame: outer beige-3 border + inner 1px navy line.",
        "shadow": "Soft, directional shadow to imply paper elevation (no blur-heavy filters)."
      },
      "splittext_integration": "Headline sits on clean beige; the cascade reads more premium without competing with photography.",
      "filter_bar": "Docked bar with rounded corners; on mobile becomes stacked cards."
    },
    "option_C_bento_hero_card": {
      "name": "Bento Hero: Text Card + Image Card + Filter Card",
      "what_changes": [
        "Hero becomes a 2×2 bento grid on desktop: large text card, image card, KPI card, filter card.",
        "No full-bleed photo; everything sits on beige with white-ish surfaces.",
        "Feels ‘boutique service brochure’ rather than ‘car classifieds’."
      ],
      "dominant_decor": [
        "Navy hairline borders and generous padding.",
        "Gold used only for CTA + tiny separators."
      ],
      "splittext_integration": "SplitText headline lives inside the main text card; animation remains identical.",
      "filter_bar": "Becomes its own card (still same funnel), visually stronger and more ‘product’."
    }
  },
  "recommended_pick_for_coherence": {
    "pick": "option_A_editorial_photo_window",
    "why": [
      "Closest to current structure (text + image + filter) but removes the tired split overlay.",
      "Keeps photography present without making the page photography-led.",
      "Easy to implement by editing only the hero module CSS + minimal JSX wrappers."
    ]
  },
  "implementation_blueprint_for_pick_A": {
    "jsx_structure_changes": {
      "file": "/app/frontend/src/figma_home/components/frame-component18.jsx",
      "instructions": [
        "Add data-testid attributes to: hero section, eyebrow, each headline line, each KPI, each dropdown trigger button, each dropdown search input, each dropdown option button, and the CTA button.",
        "Wrap image in a new div for the ‘photo window’ (e.g., <div className={styles.photoWindow}>).",
        "Add a new divider element between text and image (e.g., <div className={styles.navyRule} aria-hidden />).",
        "Keep existing SplitText props (baseDelay/stepMs/charClass/innerClass) unchanged."
      ],
      "data_testid_map": {
        "hero": "home-hero",
        "eyebrow": "home-hero-eyebrow",
        "headline_line1": "home-hero-headline-line-1",
        "headline_line2": "home-hero-headline-line-2",
        "headline_line3": "home-hero-headline-line-3",
        "kpi_1": "home-hero-kpi-1",
        "kpi_2": "home-hero-kpi-2",
        "kpi_3": "home-hero-kpi-3",
        "filter_bar": "home-hero-filter-bar",
        "brand_trigger": "home-hero-filter-brand-trigger",
        "model_trigger": "home-hero-filter-model-trigger",
        "year_trigger": "home-hero-filter-year-trigger",
        "brand_search": "home-hero-filter-brand-search",
        "model_search": "home-hero-filter-model-search",
        "year_search": "home-hero-filter-year-search",
        "cta": "home-hero-filter-submit"
      }
    },
    "css_module_structure": {
      "file": "/app/frontend/src/figma_home/components/frame-component18.module.css",
      "remove_or_disable": [
        ".leftMirrorClip (delete or set display:none)",
        "Any rules that assume white text on dark hero (switch to ink/navy)"
      ],
      "new_blocks": {
        ".heroContent": "Switch from full-bleed photo background to beige background with contained grid.",
        ".heroGrid": "New inner max-width grid container.",
        ".heroTextStack": "Now sits on beige; set max-width and spacing.",
        ".navyRule": "2px vertical rule with gold notch pseudo-element.",
        ".photoWindow": "Framed image container.",
        ".filterControls": "Restyle as elevated surface card; keep dropdown panels above."
      }
    },
    "layout_measurements": {
      "desktop": {
        "hero_min_height": "min(760px, 92vh)",
        "container_max_width": "var(--hero-max)",
        "grid_gap": "clamp(1.25rem, 3vw, 3rem)",
        "photo_window_height": "clamp(360px, 46vh, 520px)",
        "filter_bar_height": "68px (keep), but allow wrap at <=925px"
      },
      "mobile_<=640": {
        "padding": "24px 16px 18px",
        "headline_size": "clamp(1.75rem, 8vw, 2.5rem)",
        "photo_window_height": "240px–300px",
        "filter_bar": "stacked: 3 triggers full-width + CTA full-width"
      }
    },
    "dropdown_states": {
      "trigger": {
        "default": "bg: transparent; text: ink;",
        "hover": "bg: rgba(22,46,81,0.06)",
        "open": "bg: rgba(22,46,81,0.10); border-color: rgba(22,46,81,0.22)",
        "focus_visible": "box-shadow: 0 0 0 4px var(--focus-ring)"
      },
      "panel": {
        "surface": "var(--hero-surface)",
        "border": "1px solid var(--hero-line)",
        "shadow": "var(--hero-shadow-tight)",
        "max_height": "380px",
        "animation": "keep dropdownIn but reduce translate to -4px for subtlety"
      },
      "item": {
        "hover": "bg: rgba(22,46,81,0.08); color: var(--hero-navy)",
        "active": "bg: rgba(254,174,0,0.14); color: var(--hero-navy)",
        "unavailable": "opacity: 0.55; hover bg stays subtle (no gold fill)"
      }
    },
    "cta_button": {
      "style": "Gold fill, navy text, rounded 12px, uppercase.",
      "hover": "background-color: var(--bibi-yellow-hover)",
      "active": "transform: translateY(1px) (only on button); background slightly darker",
      "focus_visible": "box-shadow: 0 0 0 4px var(--focus-ring)",
      "disabled": "opacity: 0.55; cursor: not-allowed"
    },
    "motion_microinteractions": {
      "keep": [
        "SplitText per-character reveal",
        "Filter bar fade-up"
      ],
      "add": [
        "Photo window subtle entrance: opacity 0 → 1 + translateY(10px) over 520ms, delayed to start after headline (e.g., 900–1100ms).",
        "Navy rule notch: tiny scale-in (transform: scaleY(0.6) → 1) synced with headline."
      ],
      "performance": "Only transform/opacity; no backdrop-filter; no heavy blur filters."
    },
    "accessibility": {
      "contrast": "All text on beige uses ink/navy; avoid white text entirely in hero.",
      "keyboard": [
        "Dropdown triggers are buttons (already). Ensure :focus-visible styles are present.",
        "Dropdown panel role=listbox exists; option buttons should have aria-selected when active (recommended improvement).",
        "Escape closes menus (already)."
      ],
      "reduced_motion": "Keep existing prefers-reduced-motion block; extend to new photo entrance animation."
    }
  },
  "component_path": {
    "note": "Hero currently uses custom dropdown; do NOT replace with shadcn Select unless requested. If later refactor is desired, use these.",
    "shadcn_optional": {
      "select": "/app/frontend/src/components/ui/select.jsx",
      "popover": "/app/frontend/src/components/ui/popover.jsx",
      "command": "/app/frontend/src/components/ui/command.jsx",
      "button": "/app/frontend/src/components/ui/button.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx"
    }
  },
  "image_urls": {
    "hero_image": [
      {
        "category": "hero",
        "description": "Use existing CMS-driven hero image; treat it as a framed photo window (not full-bleed).",
        "url": "/figma/image-60@2x.webp"
      }
    ],
    "decorative": [
      {
        "category": "texture",
        "description": "Optional subtle paper grain overlay via CSS (no external image required).",
        "url": "CSS-only (repeating-radial-gradient noise)"
      }
    ]
  },
  "instructions_to_main_agent": [
    "Implement ONE of the proposed hero options; recommended is option_A_editorial_photo_window.",
    "Edit only frame-component18.jsx and frame-component18.module.css.",
    "Remove the left-half overlay rectangle approach; do not darken half the photo.",
    "Keep palette exactly as defined in .public-theme variables; reference them via var(--bibi-...).",
    "Keep SplitText timings and stepMs=28; do not change animation philosophy.",
    "Add data-testid attributes to all interactive elements and key text elements per map.",
    "Ensure hero remains light: beige background, ink/navy text, gold only for CTA/highlights.",
    "Do not use gradients beyond tiny decorative accents; no gradient should cover >20% viewport.",
    "Ensure dropdown panels have high z-index and remain within viewport on mobile (use max-height + scroll)."
  ],
  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
