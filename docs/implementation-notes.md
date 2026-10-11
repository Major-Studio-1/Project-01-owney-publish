# Owney — A Life in Tags

An English-language exploration with four chapters: Meet Owney, Journey, the full377-object collection, and visitor tags. The Journey presents67 transparent museum-tag photographs in fixed chronological layers, with Cube view and Timeline view, a date-range brush, the selected city and recorded tag date, and a supporting map above the story. Cube view defaults to even spacing; Timeline view defaults to calendar spacing. The date brush updates highlighted tags, confirmed map places, and the inspected encounter while dragging. Previous/Next, hover, map pins, and keyboard arrows reach individual objects. Phones stack the heading, cube, map, and story; Rotate cube preserves ordinary touch scrolling. Playback and View options are absent. Only23 dated objects across21 cities have explicit location evidence and appear on the map; all67 remain in the cube. No inferred routes are drawn. The background is labeled “AI-generated background image.” Original museum photographs and records remain available in object dialogs. Existing #cube links open Journey.
The view presets share a continuous camera: rotations, perspective, layer sizing, and timeline labels blend over 760ms. Manual rotation can pass the full edge-on angle; releasing near it gently aligns to the same timeline. Touch rotation remains an explicit mode, and reduced-motion preferences skip the animation. Tag images fill more of each plane using the audited cutout bounds, with the source PNGs unchanged.

The vertical silhouette icon rail provides seven manually reviewed outline groups, independently of collection themes. It intersects the year/story filter and preserves chronological IDs, live date highlighting, and confirmed map eligibility. Empty combinations clear stale story/map content and offer the same shape across all dates. See TAG-SHAPES.md and tag-shape-evidence.json for the visual observations and source links.

## Open locally

Install the pinned packages with pnpm install, run pnpm build, and apply the generated migration locally with node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --file drizzle/0000_visitor_tags.sql. Run node serve.cjs and visit http://127.0.0.1:8766/. The local collection is separate from the published D1 database. Set XDG_CONFIG_HOME and WRANGLER_LOG_PATH to writable workspace directories when running Wrangler in a restricted environment.

## Edit

Edit the HTML, CSS, and JavaScript in public/. The build copies this to dist/client and combines the small Worker modules into dist/server/index.js. Database schema is in db/schema.ts; pnpm db:generate uses Drizzle's programmatic API and saves schema-only migrations and metadata. Applied migrations are immutable. Run pnpm test for submission, validation, retry, rate-limit, and pagination checks. prepare-data.cjs regenerates public/data.js and events-source.json from catalog-source.json, story-sequence.json, category-overrides.json, and the map topology. Edit the story sequence and category assignments in those files, then regenerate. source-data.json preserves all 377 raw museum records.

## Full museum collection

All377 audited tag records are searchable by title, description, place, date, material, or object-number suffix. Filters retain the museum’s place and material wording and the audit’s date-precision labels. Pages contain at most24 tags. Transparent, centered320px lossless WebP thumbnails load lazily; all primary original JPEGs remain available in object dialogs. Seven mounted or photograph-edge details are labeled “Tag detail.” See TOKEN-CUTOUTS.md and gallery-image-processing.json for the reviewed extraction and display processing. Additional views (742 image entries in total) load from Smithsonian image URLs when selected. Theme groupings are editorial. The cube contains67 dated objects from March1892 to March1897, including the original14 story highlights. Map eligibility and source excerpts are recorded in map-location-evidence.json; see MAP-LOCATIONS.md. Fort Wayne includes two same-day objects. Brooklyn’s tag date and newspaper report are distinct; Scotland is a donor association and receives no map point.

## Visitor collection and sharing

Visitors publish a city/place and a short message to a shared D1 collection. Prepared statements validate and save the text; duplicate retries reuse a submission ID. Lists are paginated and shared links retrieve an individual tag. Each tag offers an Instagram-sized PNG, a caption and direct link, and the native file share menu where supported. Posting to Instagram remains a visitor action. The offline HTML links to the live shared collection. It never pretends to save public tags locally.

The introduction mirrors the museum portrait to face the text. Generated scene images form the full-width Journey background; museum tag cutouts appear in the time cube.

## Evidence and interpretation

The Smithsonian Open Access search snapshot was retrieved on22 September2026. It contained422 Owney search records, including377 National Postal Museum records with Owney and tag in their titles, and742 CC0 image entries in that subset. The complete raw records are in source-data.json. Category assignments and approximate city-center coordinates are editorial additions. Only explicitly evidenced locations are mapped, without inferred route links. For Tacoma/Puyallup,14 August is the tag date and19 August is departure context; the gift location is unconfirmed and not mapped.

Museum object photographs are CC0. The painted scenes were created using the built-in image_gen tool; prompts are in image-prompts.json and expansion-image-prompts.json, and owney-reference.jpg records the inspected appearance reference. These are interpretations, not historical photographs. The St. Louis source illustration contains an anachronistic detail at the far right; the app deliberately displays a square crop positioned at 25% to exclude it. Preserve that crop when reusing this asset.

Map boundaries: Natural Earth public-domain data, distributed through world-atlas (countries-110m.json). Modern boundaries are context, not a historical border reconstruction.

Background: https://postalmuseum.si.edu/exhibition/about-postal-operations-popular-culture-seals-symbols/owney-the-dog
API: https://edan.si.edu/openaccess/apidocs/#api-search-search
Time-volume inspiration: Bradley Tangonan's xy + t, https://www.instagram.com/reel/DdaH9kpg4iA/

Your Smithsonian API key is not included or required.

## Linked journey characteristics

Shape, Theme, and Material intersect the same 67 dated objects. Selection order defines the lead and cumulative counts; these counts precede the date brush. Theme and Material expand independently, with a first-icon hover/focus preview. Column × and per-filter breadcrumb × share cancellation: they clear only their own filter and fold that secondary column. Minus/Escape only folds; Reset clears all three. Mobile uses horizontally scrollable rows and 44px touch controls. Connector paths are static and clipped to the gaps between rails.

Journey material groups preserve the museum medium wording in the evidence panel and original record: unspecified metal (41), brass (15), copper (4), silver (3), metal with enamel (2), leather (2). Technique suffixes are grouped with their recorded material; unspecified metal is not assigned a more specific composition. The collection's original material dropdown remains based on the raw medium field.
On laptops with a fine pointer, Theme/Material labels and unpinned plus controls stay quiet until navigation hover or focus; touch layouts retain visible labeled controls. A single short description follows the hovered or focused icon vertically, beside the visible rails; it chooses available left/right viewport space and repositions when the page scrolls or resizes. Individual screen-reader descriptions remain attached to each icon, and Escape dismisses the visible hint.

Expansion is discovered progressively: Shape hover/focus reveals Theme's plus; Theme hover/focus reveals Material's plus. A small pointer bridge keeps each control reachable across the gap. Keyboard traversal follows the visual column order. Mobile shows Material's expand control after Theme is expanded, while an active or expanded Material remains reachable independently. These disclosure states do not require selecting a theme.

The intro portrait layer spans the viewport beyond the centered 1600px reading container. Responsive inner padding preserves the text column, and both photo edges fade to avoid a sharp boundary after mirroring.
