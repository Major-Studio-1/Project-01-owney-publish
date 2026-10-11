# Museum tag cutouts

The Journey cube uses 67 transparent museum photographs in chronological order. The Collection uses transparent, centered thumbnails for all 377 objects. AI illustrations remain exclusively in the Journey background. Object dialogs retain the original museum JPEGs, including additional views when available.

## Processing and review

This is non-generative image processing. The retained RGB pixels are copied unchanged from the decoded source photographs; only alpha and placement change in the full cutouts. Background masks follow the main object silhouette, with enclosed engraving and patina restored and individually reviewed suspension holes removed. Colored backgrounds and mounted plaques receive individually checked masks. No object detail is invented, recolored, sharpened, or redrawn.

The original 67 PNGs are in `public/assets/token-cutouts/`; `token-cutout-processing.json` records their source dimensions, bounds, offsets, and hole areas. Their 6,317,736 retained RGB pixels were verified against the source photographs. The remaining 310 masks were visually reviewed on contrasting contact sheets and corrected against the original photographs. Independent verification found all 28,792,777 retained RGB pixels identical to the source decoder output. Their audit is in `collection-cutout-processing.json`; full-resolution working cutouts and visual review sheets remain in the adjacent working asset directory.

All 377 display thumbnails are in `public/assets/tag-gallery/`. Each silhouette is fitted within a 288px square with a 16px transparent margin, yielding a 320px image. This display resizing resamples pixels; lossless WebP compression then preserves the resulting RGBA pixels. `gallery-image-processing.json` records every file, size, transparency, and detail-crop flag. Thumbnails load lazily, with at most 24 displayed on a collection page.

Objects 487–492 are metal plaque details cropped away from their mounting collars and neighboring tags; their rivets remain. Object 402 retains the visible bell and chain from a photograph cropped at its edges. These seven collection cards are labeled “Tag detail.” The original photographs remain accessible in object dialogs.

The earlier experimental AI-generated cutout is excluded because it altered fine surface texture. Shape groups are separate, manually reviewed visual observations; see `TAG-SHAPES.md`.
