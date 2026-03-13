# pomegranate compact AI generation spec

Status: approved derivative-generation profile (portable)
Profile id: `pomegranate-ai-compact-v2026-02-26`
Use this as the default ruleset for new visual and content asset generation in any project.

## 1) immutable constants
- `brand_name`: `pomegranate` (always lowercase)
- `service_umbrella`: `digital marketing`
- `core_service_offers`: `SEO`, `web design`, `SEO training`, `web design training`
- `signature_text`: `Serving small businesses as their digital seeds go from darkness to light and grow, if God Almighty is willing.`
- `signature_rule`: show exactly once, at the end of major material
- `audience_core`: small businesses
- `logo_wordmark_text`: `pomegranate` (exact lowercase)
- `logo_mark_motif`: dual-hexagon mark
- `button_shape_policy`: no full-pill buttons

## 2) hard visual rules
- Keep a dark-top to lighter-lower visual direction across major layouts.
- The visual direction represents a journey from darkness to light.
- Do not add gimmick labels or badges explaining that progression.
- Use abstract/minimal/futuristic visual language.
- Tree motif rule: use an abstract fractal tree as the approved growth symbol in hero or transitional backgrounds.
- Avoid photo-real stock scenes and literal lifestyle imagery.
- Keep layout clean and high-clarity; avoid visual noise and heavy texture behind body text.

## 3) colour tokens (approved)
- `--colour-dark-start`: `#0f0508`
- `--colour-dark-mid`: `#4c0519`
- `--colour-dark-rise`: `#881337`
- `--colour-accent-primary`: `#f43f5e`
- `--colour-accent-secondary`: `#be123c`
- `--colour-accent-soft`: `#fda4af`
- `--colour-accent-tint`: `#ffe4e6`
- `--colour-text-on-dark`: `#fff0f5`
- `--colour-text-primary`: `#0b0b0b`
- `--colour-bg-light`: `#fff7fa`

## 4) typography and spacing defaults
- Logo wordmark font: `Outfit` (weight `900`), lowercase only.
- Heading font: `Space Grotesk` (weights `600-700`).
- Button font: `Space Grotesk` (weights `600-700`) with uppercase tracking.
- Body font: `Inter` (weights `300-400`).
- Body size: minimum `16px` (preferred `18px` where layout allows).
- Body line height: `1.5` to `1.7`.
- Spacing rhythm: `8px` scale (`8, 16, 24, 32, 40, 48`).

## 5) canonical logo implementation (code-backed)
Use this React/Tailwind baseline when rebuilding from the approved navbar logo code.

```tsx
import { Hexagon } from 'lucide-react'

export function LogoLockup() {
  return (
    <a href="#" className="flex items-center gap-3 group relative z-50">
      <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
        <Hexagon className="absolute inset-0 w-full h-full text-pomegranate-500 transition-transform group-hover:rotate-180 duration-700 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] motion-reduce:transform-none motion-reduce:transition-none" />
        <Hexagon className="absolute inset-0 w-full h-full text-pomegranate-300 scale-50 rotate-90" />
      </div>
      <span className="text-2xl font-logo font-black tracking-tight text-white group-hover:text-pomegranate-200 transition-colors leading-none">
        pomegranate
      </span>
    </a>
  )
}
```

Implementation requirements:
- Keep the wordmark lowercase `pomegranate` and remove uppercase transforms.
- Outer hexagon rotates `180deg` on hover/focus in `700ms`; inner hexagon stays static at `90deg`.
- Keep outer glow: `drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]`.
- Keep reduced-motion support by disabling transform animation.
- If not using React/Tailwind, replicate the same geometry, colours, timing, and motion rules exactly.

## 6) accessibility and responsive gates (must pass)
- Accessibility target: WCAG 2.1 AAA intent.
- Body text contrast: `>= 7:1` in all states and sections.
- Keyboard support required.
- Visible focus states required on all interactive controls.
- Touch targets: `>= 44x44px`.
- Reduced motion support required (`prefers-reduced-motion: reduce`).
- Required responsive checks: `320`, `375`, `768`, `1024`, `1440` widths.
- No horizontal scroll at any required width.

## 7) messaging and prompt rules
- Use plain English and British English spelling.
- Write so a young teenager who can use search and social platforms can understand it.
- Do not assume a founder or business owner already understands digital marketing jargon.
- Define specialist terms in plain words the first time they appear.
- Tone: clear, calm, practical, principled.
- Keep `digital marketing` as umbrella wording and name the four core offers.
- No manipulative urgency, hype claims, or unsupported guarantees.
- Promotional prompts are optional and never required.
- If a prompt is used, keep wording plain, non-manipulative, and context-fit.
- Do not use pressure tactics or urgency gimmicks.
- Button shape rule: do not use pill buttons; use `rounded-lg` or `rounded-xl` only.

## 8) output contract for any agent
When generating an asset, return:
1. The asset content (for example HTML/CSS, design prompt, component code, or copy).
2. A brief compliance check list with pass/fail for:
   - lowercase `pomegranate`
   - service framing stays digital marketing umbrella plus four core offers
   - dark-to-light progression present
   - canonical logo implementation in section 5 followed
   - prompt policy remains optional, plain, and non-manipulative
   - no full-pill button shapes
   - single end-position signature
   - approved abstract/fractal-tree visual language
   - body contrast `>= 7:1`
   - focus visibility and `44x44` targets
   - reduced-motion support
   - first-time-reader clarity with jargon explained
   - responsive widths with no horizontal scroll

## 9) reject conditions
Regenerate if any of these occur:
- Brand appears as `Pomegranate` or any non-lowercase variant.
- Prompt language uses pressure tactics, hype urgency, or manipulation.
- Signature is repeated or moved away from the ending.
- Logo behaviour or geometry deviates from section 5.
- Full-pill button shapes are used.
- Body text contrast drops below `7:1`.
- Marketing jargon appears without plain-language explanation.
- Focus states are missing, touch targets are below `44x44`, or horizontal overflow appears.

## 10) cross-project quickstart
1. Copy `brand_guidelines_ai_compact.json` and `brand_guidelines_ai_agent_preamble.txt` into the new repo root.
2. Load the JSON profile before generation and treat it as hard constraints.
3. Install or provide equivalents for fonts (`Outfit`, `Space Grotesk`, `Inter`) and icon source (`lucide-react` Hexagon) if using React.
4. Implement logo from section 5 exactly, then verify lowercase wordmark and reduced-motion fallback.
5. Require the compliance checklist from section 8 in every generated deliverable.
