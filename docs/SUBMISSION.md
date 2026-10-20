# Submission provenance

Prepared on 10 October 2026 from the published Owney source commit `3e5797e8037c760dc83b8f409f25f6122158b1d1` (version 39, release `linked-collection-1`).

This is a separate assignment copy. Only tracked project files were copied, with the superseded animation renderer and its unused art omitted. The included process PDF/Word documents and screenshots were copied from the project outputs.

The original project history remains in the working project; this folder does not fabricate a development history. Its first GitHub commit describes it as an assignment export of the completed project. Three new browser screenshots of the live prototype were subsequently added under `images/`, each verified at 1920 × 1080 pixels and embedded in the root README.

The README was rewritten for a reviewer, and an existing detailed README is preserved as `docs/implementation-notes.md`. That file contains historical implementation notes; use the root README and current source for the final behavior.

## Excluded superseded assets

- `public/assets/owney-gallop-parts.png`
- `public/assets/owney-secondary-motion-base.png`
- `public/assets/owney-trot.png`
- `public/assets/owney-whole-run-atlas.webp`
- `public/assets/owney-whole-run.gif`
- `public/gallop-model.js`
- `public/gallop.css`
- `public/gallop.js`

## Validation

The export contains about 75.1 MiB in 906 files before ignored build output; its largest file is 2.82 MiB. All checked static asset references resolve, and the scan for common credential formats passed. The production build succeeded. All seven catalog/community tests passed, covering museum identities, chronological encounters, confirmed map evidence, shape classifications, submission persistence and retries, input validation, and storage errors. This export contains database schema and server code, not a dump of visitors' messages.

## Motion and music refinement — 14 October 2026

Synced the animation and music implementation from Site source commit `bed7f3a097ae14a1b578e42e9c61de1f0d1a77b9`. Scenery textures now prepare and warm before playback, with cropped pre-rendered layers reducing work during movement. The animation Pause/Play buttons were removed; the scenes still respect reduced-motion preferences and pause offscreen. The official YouTube player adds the requested soundtrack at 12% initial volume, with a Play music fallback when autoplay is blocked and separate music controls. The existing whole-dog drawings are unchanged.

The production build and twelve tests pass, including preparation timing, visibility transitions, canvas sizing, autoplay fallback, music controls, and the existing catalog/community checks. The three submission screenshots remain the genuine 1920 × 1080 captures of the earlier `linked-collection-1` release; their capture details are preserved in `images/README.md`.


## Compact soundtrack control — 15 October 2026

Synced from Site source commit `791904a9951ae8d2131da22899a58fe338dc0559`. The soundtrack now loads only on request, with a subtle icon visible from the introduction and a 200 × 200 YouTube player plus a small link-and-close footer. Initial volume remains 12%. Close/Escape and page hiding pause playback; a late-loading player cannot restart after dismissal. The owner canceled the proposed MP3 replacement, and no audio file was included. All 15 music, animation, catalog, and community tests passed, and the production build succeeded.


## Touch interactions and movable music — 17 October 2026

Synced from Site source commit `74934ce6b98822aaf3de23255c393d8a176efcb2`. The music player can be dragged, moved between corners by tapping its grip, or moved with the keyboard. It stays within the visible viewport and remembers its position for the visit. Cube rotation now uses width-aware touch sensitivity and a single parent transform during gestures. The Rotate button has an icon. Clicked cards shift slightly as a whole, including frame and label, without changing chronological depth. All 21 tests and the production build passed. Physical iPhone Safari frame rate still requires device confirmation. The live prototype is now available at https://owney.icare.love/.


## Independent clouds and idle tag tour — 17 October 2026

Synced from Site source commit `6ad23fd5f4a116cf8a551687d5806bb99e110f46`. Added a transparent painted cloud asset and two independently animated layers. The opening date range is 1 May–31 December 1896, with five dated tags. A visitor-controlled idle tour follows the current highlighted dates, pauses for input, and remains inactive offscreen, while reading expanded evidence, or with reduced motion enabled. Selected whole cards slide 58% of their width; date depth stays fixed. All 25 automated checks and the production build passed. Asset prompt and interaction details are in `docs/idle-tour-and-clouds.md`.

## Phone framing follow-up — 18 October 2026

Synced from Site source commit `0ec266513847a6936465524e8839f3a8a49481ea`. Narrow cube stages now reserve space for the full 58% card slide; the camera stays stable between selections. Two geometric regression tests cover card containment across phone widths, chronological positions, and rotation angles, plus centered Timeline framing. Those tests and eleven related catalog, touch, and idle-tour tests passed. The production build succeeded.

## Original sky wind and front-facing cube — 20 October 2026

Synced from Site source commit `86696028d7a19d3d4a209a000797e91dab1ddf69`. The original sky above the hills now drifts gently at a different speed, replacing the added foreground cloud layers. Entire tag cards slide 50%, with gradual left alignment as their faces turn forward. Framing reserves the slide space on both desktop and phone widths. Thirteen relevant framing, passage, gesture, and idle-tour tests passed, as did the production build. Desktop and 390 × 844 phone viewport checks confirmed that the extended card remains within the stage, without horizontal page overflow. This viewport check does not measure physical iPhone performance.

## Balanced cube framing — 20 October 2026

Synced from Site source commit `4ef9c2a34291415826c30ac9c7204e198b972936`. Replaced left-edge anchoring with a perspective fit of the complete cube plus 50% card-extension envelope. The largest feasible scale fits within responsive horizontal margins and 28 px vertical margins, up to a 1.5x enlargement ceiling, then balances the projected footprint. Geometry determines framing, so switching tags does not move the camera. Continuous rotation calculations and existing transition easing keep movement connected. The original sky wind cycle is now 20 seconds (previously 26). Thirteen relevant tests and the production build passed. Desktop and 390x844 phone checks passed with no horizontal overflow, full card containment, and calendar spacing preserved in Timeline view. Phone viewport QA does not measure physical iPhone performance.
