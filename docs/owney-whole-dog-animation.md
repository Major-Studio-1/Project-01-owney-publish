# Owney whole-dog sequence

The two countryside interludes appear after Meet Owney and after The collection (before Your tag). They use thirteen complete painted dog drawings, played as a looping sequence. Every displayed frame includes the body, all visible legs, ears, tongue, tail, harness and tags. No body part is detached, masked, rotated or reconstructed by the player.

## Artwork and assembly

- Built-in image generation, true alpha requested; appearance reference was the user's Owney screenshot, with a whole-character gait guide as motion reference.
- Exact generation prompts: `owney-whole-dog-prompt.txt` and `owney-hind-contact-prompt.txt`. The second built-in image edit added two full-character rear landing/support poses using the existing gathered and push-off drawings as references.
- Source artwork: 1448 × 1086 RGBA, twelve separate painted dogs. Nominal grid slicing would cut off paws, so each complete connected image was extracted with its original pixels and soft edge.
- One shared 512 × 320 stage per drawing. Both new poses are scaled equally to match the original character, then complete drawings are translated to register contact soles at y=300. Original rear-contact drawings were about 40 pixels above the forefoot ground level.
- Source pose order: 2, 4, 3, 5, 6, new rear landing, new rear support, 9, 10, 12, 11, 8, 7. The old first pose with simultaneous front/rear contact is omitted. This follows front contact, gathering, rear landing/support, rear push, extension and foreleg reach, informed by the [University of Minnesota veterinary gallop reference](https://vanat.ahc.umn.edu/gaits/rotGallop.html).
- Website asset: `public/assets/owney-grounded-run-atlas.webp`, 2048 × 1280, transparent, lossless. Downloadable loop: `public/assets/owney-grounded-run.gif` (GIF has binary transparency).
- Thirteen drawings with 60–80 ms holds, an 880 ms loop. The same player and artwork serve both scenes. Landing/support frames receive a slightly longer hold. Landscape travel is slowed to suit the revised size and stride.
- Desktop width changes from 72vw/max1040px to 56vw/max820px with a height cap; phone width changes from 105vw to 88vw.

## Playback

The player draws one complete image at a time and only repaints when its frame changes. It decodes the full sheet before revealing Owney, preserves the current frame while stopped, stops offscreen or in a hidden tab, and respects reduced-motion settings. Country scenery uses continuous parallax independently of the held dog drawings. The old articulated renderer is no longer loaded.

This is an illustrated, AI-generated interpretation of running, not measured motion capture. Pose-sheet inspection confirms complete connected drawings and clear near-side limbs.

## 13 October 2026: continuous scenery and automatic playback

The countryside now decodes its source image before playback and prepares seven canvas textures once per scene size. Middle and foreground textures contain only their visible bands; fades and light foreground blur are baked during preparation. Their three-tile, mirrored loops move with continuous CSS transforms. The distant horizon drifts slowly over an oversized single texture. The prepared texture area is about 2.52 viewport areas before resolution caps, versus twelve full-screen image tiles previously.

Dog and scenery preparation must both finish before two warm-up animation frames allow motion to start. Duplicate preparation requests are coalesced. A scene starts at 40% visibility and stops below 15%, avoiding repeated starts around one scroll threshold. Hidden tabs and offscreen scenes stop; reduced-motion preferences keep the illustration still. The animation Pause/Play button is removed from both interludes at the user's request. The whole-dog drawings and their 880 ms sequence are unchanged.

Tests cover decoding/warm-up, late loading, hidden tabs, visibility hysteresis, reduced motion, shared scenery loading, unchanged-size rendering, and bounded canvas dimensions. These validate behavior and rendering workload; they do not establish a measured frame rate on the viewer's laptop.

## Music

The user-selected track is [Broken Vow on YouTube](https://www.youtube.com/watch?v=CCSdRKSQXnE). The official IFrame player tries to start after page load at 12% volume. If the browser blocks autoplay, a Play music control remains available. The visible player includes volume, mute, and Stop and close controls. Closing it pauses playback and remembers that choice for the current browser session. Playback also stops when the page becomes hidden. No audio is downloaded or extracted. YouTube availability, advertising, and autoplay restrictions remain outside the site's control.
