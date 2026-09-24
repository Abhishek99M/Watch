# Premium classic watch — consolidated experience brief

Status: requirements only. No website implementation, repository edits, branch changes, commits, pushes, or deployment are requested in this step.
Prepared: 21 September 2026.

## The exact request
Create a professional luxury watch website with the cinematic, scroll-controlled product storytelling of the supplied elevator website. Use a premium CLASSIC watch; the Rolex images, Franck Muller/Smurfette template, and Sony headphone documents are references, not a confirmed brand or mandatory product design. The next requested demonstration is an HTML file showing a convincing, slow, detailed watch disassembly and reassembly controlled by scrolling.

The immediate instruction is to save the combined requirements in ONE temporary file and explain the intent simply. This file fulfils that brief-saving step; it is not the working HTML demonstration.

## Core experience and motion
- Begin with a fully assembled classic watch in a premium hero pose.
- Reveal the case, crown, bezel, crystal, hands, dial, movement, bridges, gears, caseback and strap/bracelet as appropriate to the actual selected model.
- Slowly separate parts in deliberate stages before reaching the full exploded view. Do not make a violent burst or randomly scatter components.
- Show a horizontal presentation of the watch with its components separated into aligned, legible layers. Choose a camera angle that clearly exposes the internal construction.
- Hold the exploded composition long enough to study it; use restrained, synchronized explanations of the visible parts.
- Reassemble precisely into the same watch. Scrolling backward must reverse the sequence reliably.
- Proposed storytelling allocation: assembled hero 0–15%; opening/separation 15–40%; internal mechanism reveal 40–65%; detail/fully exploded hold 65–85%; reassembly and final CTA 85–100%. Refine these values against the actual animation.
- The scene stays pinned while scroll advances the animation. Smooth interpolation and sufficient scroll distance produce slow, deliberate motion. There must be no independent playback fighting the user's scroll position.
- Preserve the same geometry, proportions, materials, dial, hands, crown and strap throughout. Avoid morphing, disappearing parts and invented internal mechanics.

## Visual direction
Dark, premium, cinematic and restrained. Deep black or near-black page and frame backgrounds should match seamlessly, without visible rectangular image edges. Prefer classic metal finishes, a refined dial and tasteful gold accents; the final watch selection remains open.
Full-bleed product imagery, strong editorial typography, generous space, readable short copy, subtle transitions and controlled reflections. No distracting environment, wrists or lifestyle imagery unless subsequently requested.
The source visual pack specifies pure black backgrounds and one cold white directional studio light. Other pasted examples allow soft gradient falloff, rim light and warmer gold accents. Treat these as alternate references: keep one coherent art direction across the chosen watch sequence instead of mixing contradictory lighting setups.
Photorealistic quality is a target, not something supplied automatically by animation code. Source imagery/rendering must resolve the dial, metal, glass, crown, strap texture and internal components clearly. Prefer high-resolution masters; deliver optimized sizes for each device.

## How the HTML demonstration can work
Preferred fit for the cinematic reference: an HTML5 canvas displays a rendered image sequence, with scroll controlling the frame index. This does not require a GLB to load in the browser. A matching assembled-to-exploded-to-reassembled animation must first exist or be produced.
Alternative: a separated, licensed GLB model rendered in real time, with explicit component mappings and scripted disassembly. This enables interactive camera movement and configuration, but photorealistic quality still depends on model detail, materials and lighting.
Two still images alone are not a complete, mechanically consistent animation. AI start/end interpolation can invent or deform parts and needs careful review. A controlled 3D animation render offers stronger continuity.
The existing project's `model: null` means no approved real model is configured; its placeholder is not the target visual quality. A separate image-sequence demonstration is a different rendering route and does not complete the existing Phase 6 GLB deliverables.
A single HTML entry file can reference external assets. A truly one-file offline demonstration would have to embed its assets and dependencies, increasing file size. Do not describe a CDN-dependent HTML file as offline/self-contained.

## Homepage structure retained from the pasted watch template
1. Fixed premium navigation: collection, heritage, craftsmanship, centered brand, reservation CTA. Subtle background; optionally hide on downward scroll and reveal upward. Accessible mobile menu and keyboard controls.
2. Full-height sticky hero: cinematic muted looping video or matching product visual, restrained oversized background typography, headline/tagline, edition detail and exploration CTA. Gentle entrance and scroll parallax.
3. Product reveal: large watch, dramatic close-up background, specifications and secondary CTA. Controlled rotation/scale rather than distracting motion.
4. Heritage: full-bleed visual, readable editorial copy, divider, verified facts and optional statistics.
5. Collection: two variants where actual assets exist, animated product transition and cross-fading matching backgrounds. Variants must represent the same watch design consistently.
6. Craftsmanship: pinned canvas, gradual disassembly, internal details, full exploded hold and reassembly. Text must not obstruct the product.
7. Final showcase: strongest assembled watch composition, concise statement and CTA.
8. Footer: brand, collection/maison/contact links and optional social links; only verified brand details.
9. Reservation modal if included in the demo: close button, outside click, Escape, focus containment/return, labelled fields, background scroll lock and mobile layout. A working submission requires an explicitly configured backend; a prototype must not falsely claim a reservation was sent.

## Reference implementation parameters (not blindly mandatory)
The pasted template uses Vite, vanilla JavaScript, one CSS file, GSAP + ScrollTrigger and Lenis, with Netlify deployment/form examples. This does not instruct replacement of the existing Next.js application during this no-edit task.
Its dependency examples are Vite ^8.0.1, GSAP ^3.14.2 and Lenis ^1.3.21. Verify compatibility when implementing; no installation is requested now.
Its image sequence is 152 JPEG frames at 1920x1080; the headphone document uses 120 frames. A later generic example says 15 images. Frame count must be chosen for the actual sequence length and required smoothness, not treated as a quality guarantee.
Sticky scroll section examples range from 300vh to approximately 400vh. Frame tween example: 0 to 151, snapped integer, ease none, scrub 0.5, start top 40%, end bottom bottom. Validate pin timing and framing in the actual layout.
Reference motion: hero video scale 1.2 to 1.05 on entrance, then 1.0 on scroll; hero text parallax -150px and watermark -250px; product initial rotation -5 degrees, then up to 20 degrees and scale 1.3; collection background scale 1.1 and yPercent 10. These are tuning examples, subordinate to restrained motion and reduced-motion preferences.
Responsive examples: 1024px and 768px breakpoints; desktop multi-column footer collapses for smaller screens. Avoid forcing fixed viewport heights where content needs more space.

## Referenced watch brand configuration
Franck Muller / Vanguard / Smurfette is EXAMPLE content. The user's overriding preference is a premium classic watch, with no final brand/model confirmed.
Example colors: pink #f7a1c6, gold #d4af7a, blue #5bb3e4, background #0b0b0b; footer #050505. Example fonts: Playfair Display for headings, Inter for body, Outfit for labels.
Example variants: BL / Blue Guilloche Dial / V 32 SC AT FO SMURFETTE (BL); RS / Rose Pink Dial / V 32 SC AT FO SMURFETTE (RS). Pink is an optional reference variant, not an instruction to make the classic watch pink.
Example copy includes “A Masterpiece In Rose & Diamonds”, “Crafted For The Timeless”, “Three Decades of Mastery”, “The Architecture of Precision” and “Beyond Ordinary”. Adapt to the selected watch, without asserting unverified product specifications.
Edition count 88, case size 32mm, power reserve 38 hours, founding year 1991, 35+ years, 1,200+ calibres and 40+ boutiques are unverified source-template claims. The template inconsistently mentions 75 and 152 components. Do not publish these as facts or confuse component count with image frame count.
Brand links in the example: https://www.franckmuller.com ; https://www.instagram.com/franckmuller/ ; https://www.facebook.com/FranckMullerWatchland ; https://www.youtube.com/@FranckMuller . Example address: Rue du Tourbillon 1, 1217 Meyrin, Geneva, Switzerland. These are reference data, not the chosen site's verified identity.

## Asset inventory from the pasted template
- public/hero-video.mp4: cinematic hero loop, no sound required.
- public/assets/photo/logo.webp: approved brand logo.
- bg1.png: product macro/background; watch.png: transparent full watch.
- ethos-bg.png and ethos-bg-rs.png: backgrounds for two variants.
- ethos-watch.png and ethos-watch-rs.png: matching transparent watch renders.
- q1.png: heritage side-profile/glamour visual; z1.png: strongest showcase hero.
- public/assets/photo/v3/ezgif-frame-001.jpg through ezgif-frame-152.jpg: scroll sequence.
These names describe requested assets; they are not confirmation that those files exist.

## Image and video direction preserved from the chat
1. Full-watch hero image: whole watch visible, centered or slightly angled, original proportions, dark environment, focused top-left/overhead soft spotlight, controlled glass/metal reflections and natural grounding shadow. 16:9; 4K master preferred.
2. Hero video alternatives: an ultra-slow push-in or minimal zoom-out revealing the whole watch. Keep the product and lighting consistent. Select one purposeful direction per shot.
3. Dial macro: hands/pinion, raised numerals, dial texture and any actual artwork sharply resolved; slight perspective with luxury lighting. For a classic watch, show its real detail rather than inventing Smurfette artwork.
4. Dial video: locked composition with a feathered directional light gradually revealing detail. A separate concept has a subtle camera creep and accurate seconds-hand movement.
5. Crown/bezel macro: tight crop, crisp metal machining, hard controlled rim highlights, shallow depth of field and deep blacks.
6. Slit-light film: a narrow white light slowly travels across a stationary watch against black. Avoid exaggerated glow.
7. Three-quarter elevated image and slow-rotation video: reveal case profile, crown and dial together; a rim highlight traces the edge.
8. Unique-detail macro and pull-back video: focus on the actual watch's distinctive crown, dial, case or strap detail, then reveal the full product.
9. Diamond-specific option only if the chosen watch has diamonds: thin cold white beam sweeping across the bezel, sequential controlled white highlights; do not add diamonds to a non-diamond classic watch.
10. Product-selection visuals: clean consistent compositions for both genuine variants; pink variant requested in the example pack, subject to final product choice.
11. Dissection start frame and video: watch presented horizontally; slow staged opening with internal components exposed in aligned layers, matching the starting geometry, lighting and camera.
The embedded master prompt asks for five numbered image prompts followed by five numbered video prompts, specific to an actual supplied watch, without placeholders. This is a preserved downstream visual-production requirement, not a request to output that prompt pack instead of the current explanation/brief.

## Asset production workflow
Select an approved/licensed classic watch or create an original design. Establish consistent assembled and exploded states. Produce a controlled disassembly/reassembly animation; an AI video workflow is a possible option but is not a guarantee of mechanical fidelity. No video-generation capability is assumed or promised here.
Extract sequential frames using a tool such as FFmpeg. Optimize delivery (for example WebP and responsive resolutions), maintain exact ordering, and match backgrounds. Render through canvas; map scroll progress to frame index using GSAP/ScrollTrigger or equivalent. Preload enough to start, handle incomplete loading, and avoid decoding all high-resolution frames without a memory budget.

## What “works properly” must mean in validation
- Correct assembled first/last states and coherent reversible disassembly.
- Smooth forward/backward scrolling and no blank or flickering frames.
- Stable pinned layout, no clipped watch on mobile or resize/orientation change.
- Readable copy and usable controls by touch and keyboard.
- Reduced-motion alternative with a static or manually stepped presentation.
- Loading progress and graceful asset-error/static fallback; no endless preloader.
- No console errors; realistic image memory/network budgets and device testing.
- Honest demo interactions and verified product claims.
No production-ready guarantee is made until the actual assets and implementation pass validation.

## Supplied reference locations
Elevator experience: https://designfactorie.github.io/ftselevatorsanimated/
Earlier assembled/exploded images:
C:\Users\Abhishek Kumar\Downloads\ChatGPT Image Sep 21, 2026, 09_55_31 PM.png
C:\Users\Abhishek Kumar\Downloads\ChatGPT Image Sep 21, 2026, 09_55_44 PM.png
Earlier motion reference:
C:\Users\Abhishek Kumar\Videos\ScreenRecorderFiles\20260921\21-48-03.mp4
The screen recording is a motion reference, not a licensed production asset. Earlier site inspection did not fully verify the elevator animation because the capture remained at its preloader.

## Source preservation
The chat requirements above are consolidated, not a verbatim transcript of every pasted code block. The complete extracted body text of both supplied DOCX documents follows. DOCX images, formatting and embedded media are not reproduced in this text file. Headphone-specific wording is retained as source material, not applied literally to the watch.

## Complete document text: AntiGravtiy Award Winning Website.docx

Source: C:\Users\Abhishek Kumar\Downloads\AntiGravtiy Award Winning Website.docx

Product Description + Universal PromptUniversal Prompt:Deep black background with subtle gradient falloff, soft rim lighting outlining the ear cups and headband, controlled reflections on smooth metal and leather textures. Cinematic lighting, high contrast, luxury tech aesthetic, sharp focus, shallow depth of field. No clutter, no text, no logos emphasized. Shot with a professional DSLR, 85mm lens, f/1.8, ultra-high resolution, photorealistic, Apple-level product shoot, dramatic mood, modern and elegant.Explosion Prompt: Exploded technical diagram view of the same matte black over-ear headphones, every component precisely separated and floating in perfect alignment, suspended in mid-air against a deep black studio background. Visible internal structure including copper wiring, drivers, magnets, circuit boards, padding layers, and metal frame. Hyper-realistic product visualization, ultra-sharp focus, studio rim lighting identical to the hero shot, soft highlights tracing each component, controlled reflections on matte and metal surfaces. Cinematic lighting, high contrast, luxury engineering aesthetic, no labels, no annotations, no text. Photorealistic, ultra-high resolution, Apple-style industrial design render, dramatic and clean.


## Complete document text: AntiGravtiy Award Winning Website (1).docx

Source: C:\Users\Abhishek Kumar\Downloads\AntiGravtiy Award Winning Website (1).docx

ACT AS:A world-class Awwwards-level Creative Developer and Brand Experience Director, specializing in ultra-premium web design, Next.js, Framer Motion, advanced scroll-based storytelling, and 3D-inspired product interactions for global tech brands.
THE TASK:Design and implement a high-end, Apple-level scrollytelling landing page for Sony WH-1000XM6 headphones.The experience should feel like a cinematic product reveal combined with an interactive engineering showcase, driven entirely by scroll-based image-sequence animation and premium typography/layout. The core mechanic remains: as the user scrolls, an image sequence plays where the headphones explode (disassemble) into a floating technical diagram and then reassemble, synchronized with copywriting and storytelling beats.
TECH STACK INTENT (for behavior/style, not code generation):
Framework: Next.js 14 (App Router mental model)
Styling: Tailwind CSS-style utility thinking (tight spacing, consistent scale)
Animation: Framer Motion-style scroll-linked animations, easing, and transitions
Rendering: HTML5 Canvas-style image-sequence playback for performance and smoothness
VISUAL DIRECTION & BRAND AESTHETIC:
Overall vibe: Apple-level, luxury tech, cinematic, ultra-clean, minimal, editorial, premium corporate.
Seamless Blending:
The page background color MUST perfectly match the background of the image sequence frames so image edges are 100% invisible and the headphones appear to float in a unified void.
Color Palette – Premium Corporate Dark Mode:
Primary background: deep, near-black charcoal #050505 (or eyedrop from hero frame).
Secondary background: #0A0A0C subtle variation for sections and overlays.
Headings: text-white/90 with subtle soft glow or very subtle shadow for depth.
Body text: text-white/60 for calm readability.
Accent colors (Sony-inspired, high-end corporate):
Primary accent: rich deep blue #0050FF (or similar Sony-esque blue).
Secondary accent: electric cyan #00D6FF for tiny highlights, gradients, or interactive elements.
Use soft gradients:
Example: background radial gradient from #050505 to a deep desaturated blue #050815 behind hero content, extremely subtle.
Accent gradient for buttons or key labels: from #0050FF to #00D6FF with a premium, glossy but minimal feel.
Typography:
Fonts: Inter, SF Pro Display / SF Pro Text, or a Sony-like geometric grotesk.
Style: ultra-clean, tracking-tight, medium-to-bold weights, large scale, strong hierarchy.
Headings: bold, tight line-height, almost editorial—like Apple / Sony global websites.
Body: 16–18px, comfortable line-height, muted color, concise, confident copy.
Overall layout feeling: full-bleed, edge-to-edge, generous negative space, no clutter, no decorative noise, restrained use of color, everything feels intentional and premium.
NAVBAR LIKE APPLE – STRUCTURE & BEHAVIOR:
Ultra-minimal top navigation bar, inspired by Apple’s product pages.
Fixed / sticky at the top with a translucent, slightly blurred background (glassmorphism) that subtly appears after scroll.
Content (from left to right):
Left: simple text logo “Sony” or “WH‑1000XM6” in a clean, medium-weight font.
Center: minimalist navigation links: “Overview”, “Technology”, “Noise Cancelling”, “Specs”, “Buy”.
Right: primary CTA button (e.g., “Pre-order” or “Discover WH‑1000XM6”) with subtle gradient border, soft hover glow.
Navbar styling:
Height: slim and compact, like Apple product nav.
Background: semi-transparent black rgba(5,5,5,0.75) with subtle backdrop blur.
Hover states: very subtle underline or opacity shift, no heavy decoration.
Scroll behavior:
At top: nearly invisible or fully transparent.
After slight scroll: fades in with a gentle transition, reinforcing the premium feel.
CORE INTERACTION: SCROLL-LINKED IMAGE SEQUENCE
A central HTML5 Canvas-style full-screen area pinned/sticky during scroll.
Inside this space, a 120-frame image sequence of Sony WH‑1000XM6 in matte black plays as the user scrolls.
Sequence behavior:
Start: fully assembled, hero beauty shot.
Mid: gradually explodes / disassembles into internal components (drivers, microphones, PCBs, cushions, bands, structural elements).
Peak: fully exploded technical diagram, every component floating in perfect alignment, hyper-realistic.
End: components gracefully reassemble into the final hero product.
Each frame is ultra-high resolution, cinematic, photorealistic, 8K-level detail, with dramatic rim lighting, deep blacks, controlled reflections, and Apple-level product rendering quality.
The canvas and the background color are identical, enabling a seamless, edge-free presentation.
SCROLL LOGIC AND STORYTELLING BEATS (COPYWRITING-DRIVEN):Use scroll as a narrative axis. As the user scrolls from 0 to 100%, different text sections appear and disappear, synchronized with the state of the headphones.
HERO / INTRO (0–15% scroll)
Visual:
WH‑1000XM6 fully assembled in a three-quarter angle, matte black, floating over a deep black background with subtle gradient.
Cinematic rim light tracing the silhouette of the ear cups and headband.
Copy (centered, bold, confident, minimal):
Large headline:
“Sony WH‑1000XM6”
Subtitle: “Silence, perfected.” or “Hear only what matters.”
Supporting line (optional, smaller):
“Flagship wireless noise cancelling, re‑engineered for a world that never stops.”
Tone: short, confident, high-end corporate product copy, like a hero banner on Sony or Apple’s official site.
ENGINEERING REVEAL (15–40% scroll)
Visual:
The headphones begin to subtly separate—ear cups drift away, headband lifts, ear cushions detach.
Internal structure slowly becomes visible: drivers, acoustic chambers, microphones.
Copy (left aligned, emerging from the left as user scrolls):
Headline: “Precision-engineered for silence.”
Subcopy:
“Custom drivers, sealed acoustic chambers, and optimized airflow deliver studio-grade clarity.”
“Every component is tuned for balance, power, and comfort—hour after hour.”
Feel: technical yet poetic, mixing engineering language with emotional benefit.
NOISE CANCELLING & MICROPHONES (40–65% scroll)
Visual:
Components spread further apart, highlighting microphones and processing chips.
Show microphone arrays and control board more prominently.
Copy (right aligned, sliding from the right):
Headline: “Adaptive noise cancelling, redefined.”
Supporting key points (short and punchy):
“Multi-microphone array listens in every direction.”
“Real-time noise analysis adjusts to your environment.”
“Your music stays pure—planes, trains, and crowds fade away.”
Emphasis: advanced intelligence, real-time adaptation, premium isolation.
SOUND & UPSCALING (65–85% scroll)
Visual:
Drivers, coils, magnets, and acoustic chambers highlighted in the exploded view.
Each piece lit with soft highlights to emphasize craftsmanship and Sony’s audio heritage.
Copy (left aligned or centered, depending on composition):
Headline: “Immersive, lifelike sound.”
Subcopy:
“High-performance drivers unlock detail, depth, and texture in every track.”
“AI-enhanced upscaling restores clarity to compressed audio, so every note feels alive.”
Tone: emotional + audiophile, referencing “detail”, “texture”, “space”, “presence”, “studio-level experience”.
REASSEMBLY & CTA (85–100% scroll)
Visual:
Components gracefully glide back into place; the headphones reassemble into perfect alignment.
Final resting position: iconic hero pose, ready for purchase.
Copy (centered, strong call-to-action):
Headline: “Hear everything. Feel nothing else.”
Subheadline: “WH‑1000XM6. Designed for focus, crafted for comfort.”
CTA button-style copy:
“Experience WH‑1000XM6”
Secondary: “See full specs”
Optional micro-copy: “Engineered for airports, offices, and everything in between.”
UI & VISUAL POLISH (HEAVY “GOOD” KEYWORDS):
Keywords to emphasize in visual style:
Cinematic, photorealistic, hyper-detailed, ultra-premium, luxury tech, editorial, Apple-level, Sony flagship, modern, minimalist, corporate high-end, glassmorphism, gradient glows, smooth, buttery scroll, hardware-accelerated, immersive, interactive storytelling, scrollytelling, polished, Awwwards-level.
Stylistic elements:
Soft ambient glows behind the product and key text blocks.
Subtle gradient borders around CTAs and key cards.
Motion blur / depth suggestions through focus and lighting rather than noisy effects.
Extremely subtle grid or alignment hints to ground the design.
TYPOGRAPHY & GRADIENT DETAILS:
Headings:
Large, tight, using a gradient fill from white to very light blue or cyan for a premium, digital, high-tech feel, but kept subtle.
Example: gradient text: white → #00D6FF at the very bottom of the letterforms, with a gentle fade.
Body:
Solid rgba(255,255,255,0.6), smooth, no gradients, focus on readability.
Button text: white, semi-bold, with a subtle drop shadow for legibility over dark backgrounds.
CANVAS & LAYOUT BEHAVIOR (DESCRIPTIVE, NOT CODE):
Sticky canvas section with height ~400vh, so the user scrolls through multiple story beats while the canvas remains pinned.
Canvas is always full-width and full-height of the viewport, with the content (headphones sequence) centered and scaled to fit while preserving aspect ratio.
The scroll controls frame index; frame selection uses smooth mapping to avoid flicker or jumps.
All UI chrome (navbar, text overlays) float above the canvas with subtle depth and non-intrusive presence.
FINAL PROMPT (COMBINED, READY-TO-USE):
“Design a hyper-premium, Apple-level, cinematic scrollytelling landing page for Sony WH‑1000XM6 flagship noise-cancelling headphones. The experience should feel like a high-end, editorial, corporate product story with a sticky full-screen canvas playing a 120-frame image sequence of matte black WH‑1000XM6 headphones exploding (disassembling) into a floating technical diagram and then reassembling as the user scrolls. The page uses a pure dark-mode aesthetic with a deep charcoal background #050505 that perfectly matches the image sequence background so the headphones appear to float in seamless black space with no visible edges.
Include an Apple-style, ultra-minimal, fixed top navigation bar: a slim, glassmorphism nav with subtle backdrop blur, near-black translucent background, a simple product title (“WH‑1000XM6”), centered links like “Overview”, “Technology”, “Noise Cancelling”, “Specs”, “Buy”, and a right-aligned gradient CTA button reading “Experience WH‑1000XM6”. The nav starts nearly invisible at the top and gently fades in after a small scroll, mimicking Apple’s product navigation behavior.
Use premium corporate colors and gradients: primary background #050505, secondary background #0A0A0C, headings in text-white/90, body text in text-white/60, and sophisticated accent colors like deep Sony blue #0050FF and electric cyan #00D6FF for subtle gradients, underlines, and CTA borders. Add extremely subtle radial gradients behind the hero product and key sections, such as a soft glow from #050505 to #050815. Typography should use Inter or SF Pro Display/SF Pro Text with tracking-tight, bold headings and clean, readable body text, achieving a modern, minimalist, high-tech, editorial look.
The scroll-linked canvas animation is the core interaction: at 0–15% scroll, show the WH‑1000XM6 fully assembled in a cinematic hero shot with dramatic rim lighting, deep blacks, and photorealistic 8K-level detail. Center the copy: ‘Sony WH‑1000XM6’ as the main headline with ‘Silence, perfected.’ or ‘Hear only what matters.’ as the subheadline, and an optional line like ‘Flagship wireless noise cancelling, re‑engineered for a world that never stops.’. From 15–40% scroll, start the soft explosion of parts: ear cups, headband, and cushions drift apart, revealing internal structure. On the left side, fade in copy like ‘Precision-engineered for silence.’ with short, premium corporate subcopy about custom drivers, sealed acoustic chambers, and all-day comfort.
From 40–65% scroll, emphasize noise cancelling and microphones: highlight the multi-microphone array and processing components in the exploded view. On the right side, fade in copy like ‘Adaptive noise cancelling, redefined.’ with concise supporting lines such as ‘Multi-microphone array listens in every direction.’, ‘Real-time noise analysis adapts to your environment.’, and ‘Your music stays pure—planes, trains, and crowds fade away.’. From 65–85% scroll, put focus on sound quality and upscaling: emphasize drivers, coils, magnets, and acoustic chambers in the composition, with copy stating ‘Immersive, lifelike sound.’ and subcopy about high-performance drivers, detailed soundstage, and AI-enhanced upscaling that restores clarity and presence to compressed audio.
From 85–100% scroll, have all components gracefully glide back into place, the headphones fully reassemble, and the final hero state locks in. Show centered, bold CTA copy: ‘Hear everything. Feel nothing else.’, with subheadline ‘WH‑1000XM6. Designed for focus, crafted for comfort.’ and a primary CTA button ‘Experience WH‑1000XM6’ plus a secondary text link ‘See full specs’. The scroll transitions must feel smooth, buttery, and hardware-accelerated, with no stutter. All overlays (text, nav, buttons) should use subtle fades, slides, and eased transitions that reinforce the ultra-premium, cinematic feel.
Overall, optimize for an Awwwards-level, luxury tech experience with cinematic lighting, photorealistic matte black rendering, ultra-clean layout, high-end corporate color schemes, gradient accents, Apple-like navigation, premium copywriting, immersive scrollytelling, and a feeling of flagship, Sony-level craftsmanship and innovation.”


---

## Research and implementation proposal — 22 September 2026

This section records the latest user direction. The original brief and full document extracts above are preserved. The temporary brief was moved into the repository at the user's request; this is a documentation-only change, not implementation or a completed project phase.

### Confirmed intent
The assistant should create the watch visuals, rather than require the user to arrive with a finished model or video. Begin with a premium classic watch concept and a matching exploded image, then produce coherent animated disassembly and show it in an isolated HTML scroll prototype. Review that prototype before integrating the experience into Next.js. The user is asking for research and planning now, not image generation, video generation or code changes in this turn.

### Recommendation
Use generated images to establish the design. Use a rendered frame sequence for the fixed-camera cinematic HTML prototype, with professional JavaScript controlling scroll, pinning and text. Image sequences and professional code are complementary, not opposing choices.
For the strongest control over precise component movement, author one separated watch model in Blender and render every frame from that same scene. An AI first/last-frame video is a viable faster concept experiment if a video-generation service becomes available, but do not assume it preserves every gear, dial marking and reflection. Reject morphing or disappearing parts before website implementation.
The recommended browser experience does not require GLB. Blender can render PNG frames directly: an intermediate MP4 and subsequent extraction are unnecessary for that route. A preview MP4 may still be useful for reviewing the motion. If an AI video is used, extract its approved frames for the browser.
Real-time Three.js/GLB is appropriate if free rotation, alternate camera views or individually selectable parts become requirements. It is not automatically more professional or more photorealistic. For an original procedural model, GLB is an optional export format rather than an inherent requirement of all real-time 3D code.

### Concrete implementation stages for a future authorized task
1. Art direction: original classic black-dial watch, brushed steel with restrained gold details, no invented real-brand identity. Establish proportions, bezel, crown, hands, bracelet and fixed three-quarter camera. Generate assembled and exploded concepts using the same visual reference. Check that both show the same design. Concept internals remain illustrative unless validated against real engineering data.
2. Motion proof: create a short, modest-resolution animation sample before a full high-resolution render. Crown release, crystal/bezel lift, hands/dial separation, movement/bridges reveal, exploded hold, then exact reassembly. Lock geometry, materials and lighting throughout. Disassemble only the groups that can be shown convincingly.
3. Asset route decision: try AI interpolation only with an available authorized video service; otherwise establish Blender tooling and create the animation from one consistent scene. Do not substitute a two-image crossfade and call it mechanical disassembly. A simple procedural watch is not a substitute for the requested premium asset quality.
4. Sequence preparation: render or extract ordered frames, keep high-quality masters, derive desktop/mobile WebP or JPEG assets and a static poster. Initial sequence length may be around 120–240 frames, but select it from the approved motion rather than blindly following the template's 152. Do not mistake extra duplicate/interpolated frames for added mechanical detail.
5. Isolated HTML prototype: one HTML entry point with a local assets folder; use a local preview server. Inline its CSS/JS if useful, but describe external assets/dependencies accurately. Canvas maps one normalized scroll progress value to frame index. Use a pinned scene, staged explanatory copy, an exploded hold and reversible reassembly. Native scrolling first; add Lenis only if it improves tested behavior.
6. Rendering and resilience: scale to fit the entire exploded assembly, cap pixel density, redraw only when the frame or size changes, preload the poster and nearby frames with bounded concurrency, and cap decoded-image memory. Draw only successfully decoded frames; retain the last valid image on an individual failure. Provide a clear retry/static fallback and a reduced-motion static or stepped view. Avoid eager decoding of every 4K frame.
7. Validation: inspect the full motion for shape changes, collisions, flicker, labels hiding detail and incorrect reassembly. Test forward/backward scroll, fast seeking, initial load at a deep scroll position, resize, mobile orientation, keyboard, reduced motion, slow network and missing frames. Measure transfer size, startup time, decoded memory and frame delivery on real hardware before calling the result production-ready.
8. Integration after review: port the approved experience into the existing Next.js architecture. Preserve current error/loading/accessibility behavior. Make a deliberate decision about the existing GLB pipeline and phase plan; do not silently replace it or mark Phase 6 complete.

### Capability and dependency findings
- Image generation is available in this session; no images were generated during this research task.
- No dedicated AI image-to-video generation tool is connected in the available tool set. Preparing prompts is possible; executing a hosted video-generation job requires an actual connected service/account. Do not promise that model capability alone supplies that service.
- `Get-Command blender,ffmpeg` found neither executable on PATH. This is not proof they are absent from the machine; installation locations/tooling need checking before production work. No tools were installed.
- Repository docs still state Phase 6 is pending the approved real GLB. The current manifest deliberately uses a null model. This proposal does not change that status.

### Primary-source research
- GSAP documents canvas image-sequence scrubbing, including mapping a tweened frame index to the drawn image and ScrollTrigger configuration: https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/
- GSAP ScrollTrigger supports scroll-linked progress and pinning: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Google documents Veo frame-specific generation, including first/last-frame control: https://ai.google.dev/gemini-api/docs/veo?hl=en and https://ai.google.dev/gemini-api/docs/video . This establishes an available external workflow, not access from this session or a guarantee of mechanical accuracy.
- Blender documents animation rendering as image sequences, which can subsequently be assembled into video: https://docs.blender.org/manual/id/dev/render/output/animation.html . The English latest page could not be retrieved during this check; the official indexed manual supports the sequence workflow.

The recommendation to favor one controlled 3D scene for precise disassembly is an engineering assessment based on continuity requirements, not a claim that an AI-generated video has already been tested and failed.

### Next deliverable
Generate the assembled and exploded concept pair first. Review visual identity and component layout, then produce the motion proof. Only after that should the HTML prototype be implemented. This order avoids building a polished page around inadequate or inconsistent watch assets.