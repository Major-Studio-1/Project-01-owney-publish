# Original-sky wind and an idle tag tour

Updated 20 October 2026.

The initial date brush is 1 May–31 December 1896, containing five precisely dated records. Changing filters rebuilds the available date domain; the opening default is not imposed again.

After 12 seconds without input, while the cube is visible, the tour selects the current highlighted tags in date order, allowing 4.6 seconds per tag and an 8-second rest before looping. It does not expand chosen dates or clear collection filters. Pointer, keyboard, scrolling, date-brush, and filter input restart the idle delay. The tour stays inactive when the page is hidden, a dialog or record details are open, keyboard focus is visible in Journey, or reduced motion is enabled. A compact pause/enable button provides an opt-out for the visit.

The whole selected card, including image, frame, and label, shifts right by **50%** of its width. Chronological depth remains unchanged. Click again to restore it. Automatic highlighting uses an 850 ms easing; direct clicks use 380 ms. The offset returns to zero during rotation and in Timeline view.

The camera fits the projected envelope of the cube plus a full 50% card extension at every rotation and viewport width. It finds the largest feasible scale within 16–28 px horizontal and 28 px vertical margins, with a restrained 1.5× enlargement ceiling, then balances the projected envelope in the viewport. A forward-facing cube therefore sits slightly left of center with breathing room; it is no longer anchored to the left edge. Framing depends on geometry and rotation, not the inspected tag, so selection does not change the camera. Continuous projection calculations and the existing view-change/release easing keep rotation and framing connected. Timeline framing remains centered.

## Motion in the original sky

Both passages load only `public/assets/owney-country-scene.png` for scenery. The additional generated foreground clouds are no longer loaded or displayed. The original illustration is unchanged.

During preparation, the renderer copies the original sky pixels into a bounded canvas with a feathered mask above the hills and tree silhouettes. This sky copy shares the distant scene transform, adding a small horizontal wind drift (24 source-image pixels over 20 seconds, easing back and forth) relative to the hills. The soft mask protects treetops and leaves a quiet transition at the horizon. No new cloud artwork is introduced.

Textures are painted once per size change. Only compositor transforms animate; they pause offscreen and follow reduced-motion settings. The whole-dog animation is unchanged.