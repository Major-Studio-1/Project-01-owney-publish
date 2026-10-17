# Optional soundtrack

The owner selected [Broken Vow on YouTube](https://www.youtube.com/watch?v=CCSdRKSQXnE). A subdued sound icon is available from the introduction onward. It opens a 200 × 200 official YouTube player with a small link-and-close footer. No YouTube request is made until the visitor chooses music. Initial volume is 12%; the native player provides playback and volume controls.

The player remains visible during playback. Closing it or hiding the page pauses the track. If the browser blocks the first play request, the visible native Play button remains usable. YouTube availability and advertising are controlled by YouTube.

The proposed MP3 replacement was canceled by the owner on 15 October 2026. No MP3 was copied, committed, or deployed. This implementation does not download or extract audio.

Behavior tests cover lazy loading, player dimensions, quiet startup, browser autoplay blocking, close/Escape, page visibility, late player readiness, and load failure.

## Moving the player

The six-dot grip moves the open player without interrupting playback. Drag it anywhere within the visible viewport, or tap it to move to the next corner. Keyboard users can use the arrow keys (Shift for larger steps), or Home to return to the bottom-right corner. The video remains 200 × 200 pixels. Phone controls have 44-pixel touch targets.

The player stays within the visible screen when its size or orientation changes. Closing returns the small sound button to its usual position; reopening restores the last player position for this visit. Separate interaction tests cover dragging, cancellation, corner movement, keyboard movement, viewport bounds, and close/reopen behavior.
