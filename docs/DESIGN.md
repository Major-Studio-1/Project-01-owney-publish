# Design rationale and refinement

## Question and visualization methods

The project asks how a collection of small objects can reveal encounters in one dog's life. The collection contains 377 museum records, but only 67 objects have sufficiently precise dates for chronological placement. The Journey therefore uses a dated subset, while the gallery retains the wider archive and its uncertain records.

The time cube places each tag photograph on a chronological layer. Its purpose is to let viewers see the objects as a collection and move between individual encounters. Cube view uses even spacing to make the photographs easier to browse. Timeline view rotates the same structure and defaults to calendar spacing, revealing clusters and gaps among the displayed dated records. Layer thickness is uniform and symbolic; it is neither a measurement of the objects nor a duration. Overlapping dates are also accessible through Previous/Next controls.

The map answers a different question: where does the museum description support a specific encounter? It includes only 23 dated tags in 21 confirmed cities. Donor addresses, advertisements, railway names, and ambiguous locations are omitted. City centers are approximate display coordinates, and no inferred routes connect them. An absence on the map does not mean Owney never visited a place.

## Composition and hierarchy

The introduction gives the dog a large portrait and a brief narrative before asking the viewer to interpret data. In the Journey, the cube is the principal exploratory view. The map sits above the evidence/details area, giving it a stable position when story lengths change. The selected city and date have prominent type, so the current encounter remains clear.

Earlier iterations separated the map and cube and repeated token images in a bottom strip. They were combined into one linked section, and the redundant strip was removed. A compact persistent menu reduces vertical space on laptop screens. The gallery follows Journey filters and highlights its selected object, avoiding a disconnected second browsing task. An explicit reset restores the complete archive.

## Color, contrast, and atmosphere

Dark blue forms the continuous page background. Warm gold identifies active controls, selected dates, and the focused object; pale neutral text and dimmer surrounding tags establish supporting levels of emphasis. Transparent tag cutouts remove the competing photographic rectangles while keeping the original museum object pixels. Original photographs remain available in the record dialog.

AI-generated scenes sit behind the Journey as atmosphere. Their visual weight is reduced so the recorded date, city, objects, and map remain readable. They are labeled as generated background images and are not used as historical evidence. The artwork and specimen photograph have different roles, explained in the source notes.

## Typography and interaction

Large serif headings support the narrative tone. Sans-serif labels and controls prioritize legibility for dates, counts, and filtering. The hierarchy moves from section title to selected encounter, supporting evidence, and source links. Selection is also communicated with text and control state rather than color alone.

Shape, theme, and material filters are linked. Their order of activation determines the cumulative counts and connection lines. Secondary columns begin collapsed to keep the initial view quiet, and expand on deliberate interaction. Their close controls and filter breadcrumbs share cancellation behavior. On touch screens the filters become scrollable rows with larger targets; cube rotation is an explicit mode to preserve ordinary page scrolling.

## Refinements after feedback

The project was repeatedly adjusted for wide laptop screens, including a smaller top menu, more room for the cube, fewer controls above it, and removal of overlapping instructions. Date highlighting updates the map during the interaction. Unconfirmed map points were removed. Background removal was extended to the full collection, and a shared selection connects the Journey with the gallery.

The running interludes aim to suggest that Owney was once a living, energetic dog. The final player uses whole-dog drawings instead of separately transformed limbs. The dog was reduced in size, rear landing/support drawings were added, and the second interlude was moved after the collection. The scenes can be paused, stop when offscreen, and respect reduced-motion preferences. Their motion is an illustrated interpretation, not biomechanical measurement or historical footage.

## Limitations to discuss

The dated records do not measure all tags collected over time, so the timeline cannot establish a collecting rate. The full museum snapshot is also not a complete travel history. Shape and theme labels are editorial classifications, while material groups simplify the museum's wording. The 3D presentation favors exploratory object browsing; the timeline, gallery, and keyboard controls provide more direct alternatives when precise comparison or access to overlapping objects is needed.
