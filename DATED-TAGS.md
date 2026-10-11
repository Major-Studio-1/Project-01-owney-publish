# Dated tags in the Journey

The Journey now contains 67 objects from the existing 377-record Smithsonian snapshot. Each object has its own layer, museum link, preserved source photograph, and transparent display cutout. The original fourteen editorial stories remain a filter within this expanded set.

## Inclusion and provenance

- 61 objects have an exact-day catalog date.
- Six additional dates occur in the museum descriptions: 19 (24 May 1894), 122 (16 June 1895), 153 (12 April 1893), 183 (24 June 1895), 205 (13 September 1894), and 457 (12 April 1893).
- Broad spans, month-only dates, year-only dates without a precise description date, manufacture/patent dates, and speculative receipt dates are not assigned invented days.
- The original museum wording remains in `catalog-source.json` and in each object dialog. `dated-tag-evidence.json` records the added summaries, description-date overrides, approximate city centers, and evidence cautions. `prepare-data.cjs` builds the display data from these sources.

## Descriptive counts

| Recorded year | Tags |
|---|---:|
| 1892 | 17 |
| 1893 | 9 |
| 1894 | 21 |
| 1895 | 9 |
| 1896 | 10 |
| 1897 | 1 |

The 67 objects occupy 57 distinct recorded dates, from 28 March 1892 to 17 March 1897. The conservative location audit in `map-location-evidence.json` maps only23 dated objects across21 cities whose museum descriptions explicitly identify a visit or exchange in that city. It excludes39 unconfirmed location associations and5 conflicting records. All67 objects remain selectable in the cube. City-center coordinates are editorial approximations; recorded tag dates are not independently verified arrival dates. Each audit entry preserves an exact museum excerpt, its source URL, and the inclusion or exclusion reason. Data preparation validates these excerpts and clears coordinates for excluded objects.

## Limits visible in the interface

- Tag 84 has an internally conflicting description: it gives 5 May 1896 and also says the presentation date is unknown.
- Tags 153 and 457 describe the same day in San Francisco and Cheyenne. Tags 481 and 482 have the same date in Pierre and Lawrence. These conflicts are flagged and are not joined by the optional chronological links.
- Identical dates retain identical positions in calendar spacing. Previous/Next and keyboard navigation reach each object independently; the selected date’s count appears above the timeline. Even spacing separates objects for browsing.
- Counts describe surviving catalog evidence, not the collection rate of all 377 objects or a complete itinerary.
- New summaries paraphrase the museum descriptions. Added tags share a clearly identified imaginative background; no new historical scene is asserted or generated.

## Display verification

All 67 dates, source links, unique IDs, source-to-Journey links, optional coordinates, and cutout assets were checked. Retained cutout RGB values were compared to the original JPEG decodes. The original 377 JPEGs are unchanged.
