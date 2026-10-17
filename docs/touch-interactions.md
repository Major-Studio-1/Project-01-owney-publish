# Cube and player interactions

Updated 17 October 2026.

The Rotate button has a cube-and-arrows icon. On touchscreens, visitors choose Rotate to enable swiping and Done to return to ordinary page scrolling. Touch sensitivity follows the display width: a 120-pixel swipe on a 300-pixel stage rotates 72 degrees, compared with 26.4 degrees previously. Pointer capture keeps a gesture attached to the stage; cancellation, interrupted pointers, and orientation changes release it safely. Dragging suppresses accidental tag clicks.

During rotation the stage keeps its measured geometry and updates only the parent cube transform, at most once per animation frame. Decorative side faces are hidden while dragging to reduce compositing work. After release the layout settles smoothly; approaching the timeline angle snaps into Timeline view. The Cube/Timeline buttons retain their smooth transition.

Clicking a tag moves its entire card, photograph, frame, and label a little to the right; clicking it again returns it. The card retains its date depth and chronological order. Hover previews do not create this effect, and the offset disappears in Timeline view or while rotating. Reduced-motion preferences remove the card transition.

Automated checks cover touch activation, sensitivity, pointer capture, cancellation, click suppression, music-player movement and viewport bounds, alongside the existing music, passage, catalog, and community checks. Physical iPhone Safari performance still requires confirmation on an actual device; simulated pointer checks do not establish device frame rate.
