# Map location decisions

The map uses explicit place-of-visit or place-of-exchange evidence in the saved Smithsonian National Postal Museum descriptions. Naming a donor, workplace, manufacturer, advertising town, or railway does not establish where the gift reached Owney. Multiple places, missing places, and conflicting records are omitted. This conservative rule admits23 dated objects across21 city labels;39 location associations and5 conflicting records are not mapped. All67 dated objects remain in the cube and all377 objects remain in the collection.

`map-location-evidence.json` records a decision for each dated tag, its reason, an exact supporting museum excerpt, and the source URL. Ellipses separate exact parts of a single description. `prepare-data.cjs` verifies the source URL, place label, and excerpts against the saved catalog before assigning a point. It removes coordinates for excluded records. The runtime also requires confirmed status before creating a marker.

Examples: Portland tag463 identifies railway clerks' home office and an exchange on a southbound train, so it has no city marker. Scotland tag196 identifies its donor's town, so it has no marker. Tacoma/Puyallup tag104 has a tag date and a different departure date, without a confirmed gift location. The paired San Francisco/Cheyenne and Pierre/Lawrence dates conflict. Atlanta tag65 explicitly records a visit to Atlanta and is mapped.

Markers are approximate city centers added for the visualization, not Smithsonian coordinates or exact exchange sites. Dates remain recorded tag dates, not independently verified arrival dates. No inferred travel routes are drawn. Highlight membership and the inspected encounter update while the date controls move; an empty range clears map highlights.
