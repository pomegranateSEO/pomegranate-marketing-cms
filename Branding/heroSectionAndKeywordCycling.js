# Hero + Keyword Cycling Context

## Intent

- The hero scroll animation is the visual container for `landmarks` names.
- The section directly below is the keyword typewriter/cycling component for `keywords`.
- Local service pages should use **both** components together.
- Other pages should use **only** the keyword cycling component.

## Scope Rules For Another Agent

- **Local service pages:** render Hero (landmarks animation) + Keyword Cycling section.
- **Non-local pages:** render Keyword Cycling section only.
- Keep the current motion language unless explicitly asked to redesign (scroll-based transforms in hero, typewriter + subtle scroll scale/fade below).

## Current Source of Truth

- `src/components/Hero.tsx`
- `src/components/TypewriterSection.tsx`
- `src/components/InteractiveBackground.tsx` (Hero dependency)

## Hero Component (current base)

```tsx
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import InteractiveBackground from './InteractiveBackground';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Wild transformations
  const scale1 = useTransform(scrollYProgress, [0, 0.2], [1, 5]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -500]);

  const scale2 = useTransform(scrollYProgress, [0.1, 0.3], [0.5, 3]);
  const opacity2 = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const x2 = useTransform(scrollYProgress, [0.1, 0.3], [-500, 500]);

  const scale3 = useTransform(scrollYProgress, [0.2, 0.4], [0.5, 1]);
  const opacity3 = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.5], [0, 1, 1, 0]);
  const rotate3 = useTransform(scrollYProgress, [0.2, 0.4], [-45, 0]);

  const opacity4 = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const scale4 = useTransform(scrollYProgress, [0.4, 0.5], [0.5, 1]);
  const y4 = useTransform(scrollYProgress, [0.4, 0.5], [200, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[var(--color-bg-dark)] text-[var(--color-text-dark)]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        <InteractiveBackground />

        {/* Text 1 */}
        <motion.h1
          className="absolute text-[15vw] font-disp font-bold uppercase tracking-tighter z-10"
          style={{ scale: scale1, opacity: opacity1, y: y1 }}
        >
          Search
        </motion.h1>

        {/* Text 2 */}
        <motion.h1
          className="absolute text-[12vw] font-disp font-bold uppercase tracking-tighter z-10 text-[var(--color-accent-dark)]"
          style={{ scale: scale2, opacity: opacity2, x: x2 }}
        >
          Rankings
        </motion.h1>

        {/* Text 3 */}
        <motion.h1
          className="absolute text-[10vw] font-disp font-bold uppercase tracking-tighter z-10"
          style={{ scale: scale3, opacity: opacity3, rotate: rotate3 }}
        >
          That Drive
        </motion.h1>

        {/* Text 4 */}
        <motion.div
          className="absolute flex flex-col items-center z-10 px-6"
          style={{ opacity: opacity4, scale: scale4, y: y4 }}
        >
          <h1 className="text-[15vw] md:text-[18vw] leading-none font-disp font-bold uppercase tracking-tighter text-[var(--color-accent-dark)]">
            Revenue
          </h1>
          <p className="mt-8 text-xl md:text-4xl max-w-3xl text-center font-medium">
            Aura is a strategic SEO agency helping the world's most innovative companies dominate search and scale growth.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          aria-hidden="true"
        >
          <span className="text-sm uppercase tracking-widest font-bold mb-2">(Scroll)</span>
          <div className="w-[1px] h-12 bg-white/50" />
        </motion.div>
      </div>
    </section>
  );
}
```

## Keyword Cycling Component (current base)

```tsx
import { motion, useScroll, useTransform } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

const phrases = [
  "search engine optimisation agency",
  "seo agency",
  "seo company",
  "growth partner",
  "digital performance team"
];

export default function TypewriterSection() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.2, 0.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-32 md:py-60 px-6 md:px-12 bg-[var(--color-bg-dark)] text-[var(--color-text-dark)] overflow-hidden flex items-center justify-center min-h-[60vh]">
      <motion.div
        style={{ scale, opacity }}
        className="text-center w-full max-w-7xl mx-auto"
      >
        <h2 className="text-3xl md:text-6xl lg:text-7xl font-disp font-bold uppercase tracking-tighter leading-tight flex flex-col items-center justify-center" aria-live="polite">
          <span className="mb-4 text-gray-400">We are a</span>
          <span className="text-[var(--color-accent-dark)] h-[2.5em] md:h-[1.5em] flex items-center text-center">
            {text}<span className="animate-pulse font-sans font-light" aria-hidden="true">|</span>
          </span>
        </h2>
      </motion.div>
    </section>
  );
}
```

## Adaptation Notes

- Replace the static hero words (`Search`, `Rankings`, `That Drive`, `Revenue`) with a `landmarks`-driven sequence for local service pages.
- Replace `phrases` with page-provided `keywords` on both local and non-local pages.
- Keep this section ordering on local pages: Hero landmarks animation first, keyword cycling section second.
