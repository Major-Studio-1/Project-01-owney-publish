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

The player draws one complete image at a time and only repaints when its frame changes. It decodes the full sheet before revealing Owney, preserves the current frame when paused, stops offscreen or in a hidden tab, and respects reduced-motion settings until the viewer chooses Play. Country scenery keeps its existing parallax. The old articulated renderer is no longer loaded.

This is an illustrated, AI-generated interpretation of running, not measured motion capture. Pose-sheet inspection confirms complete connected drawings and clear near-side limbs. The build and lifecycle checks passed. Browser playback could not be visually verified in this environment because the local browser connection timed out; this limitation should not be described as a successful browser animation review.
