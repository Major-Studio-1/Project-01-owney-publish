# Original-sky wind and an idle tag tour

Updated 19 October 2026.

The initial date brush is 1 May–31 December 1896, containing five precisely dated records. Changing filters rebuilds the available date domain; the opening default is not imposed again.

After 12 seconds without input, while the cube is visible, the tour selects the current highlighted tags in date order, allowing 4.6 seconds per tag and an 8-second rest before looping. It does not expand chosen dates or clear collection filters. Pointer, keyboard, scrolling, date-brush, and filter input restart the idle delay. The tour stays inactive when the page is hidden, a dialog or record details are open, keyboard focus is visible in Journey, or reduced motion is enabled. A compact pause/enable button provides an opt-out for the visit.

The whole selected card, including image, frame, and label, shifts right by **50%** of its width. Chronological depth remains unchanged. Click again to restore it. Automatic highlighting uses an 850 ms easing; direct clicks use 380 ms. The offset returns to zero during rotation and in Timeline view.

The camera reserves the full card slide at every screen width. As rotation approaches a front-facing tag view, framing gradually shifts toward the left inset of the cube viewport. Assistance begins within 42 degrees of face-on and uses smooth easing, reaching the left inset when facing forward. Strong top/bottom tilts reduce this assistance. It changes placement without taking over rotation or jumping between selected objects. Timeline framing remains centered.

## Motion in the original sky

Both passages load only `public/assets/owney-country-scene.png` for scenery. The additional generated foreground clouds are no longer loaded or displayed. The original illustration is unchanged.

During preparation, the renderer copies the original sky pixels into a bounded canvas with a feathered mask above the hills and tree silhouettes. This sky copy shares the distant scene transform, adding a small horizontal wind drift (24 source-image pixels over 26 seconds, easing back and forth) relative to the hills. The soft mask protects treetops and leaves a quiet transition at the horizon. No new cloud artwork is introduced.

Textures are painted once per size change. Only compositor transforms animate; they pause offscreen and follow reduced-motion settings. The whole-dog animation is unchanged.