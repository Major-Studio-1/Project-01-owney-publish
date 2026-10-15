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
