# Suitable sources for Nürburgring Nordschleife + GP circuit geometry

The ADAC RAVENOL 24h race uses a **combined track** -- the Nordschleife
plus the modern Grand‑Prix (GP) circuit. To build an interactive map
component for a React dashboard, you need a reliable outline of the
whole track in a vector format. The table below summarises the most
suitable publicly‑available sources, the licence implications and how
they might be converted into an inline SVG path with hover/glow effects.

## Recommended sources

+-------------+-------------+-------------+-------------+-------------+
| \#          | Source &    | Format      | Licence &   | Adaptation  |
|             | description | (Nordschl   | usage notes | rec         |
|             |             | eife + GP?) |             | ommendation |
+=============+=============+=============+=============+=============+
| **1**       | **Wikimedia | **SVG**     | Released    | Download    |
|             | Commons --  | (vector).   | under       | the SVG and |
|             | "Ci         | Includes    | **Creat     | open it in  |
|             | rcuit Nürbu | **Nor       | ive Commons | an editor   |
|             | rgring‑2002 | dschleife + | Attri       | (e.g.,      |
|             | ‑24h.svg"** | GP loop**   | bution--Sha |  Inkscape). |
|             | -- created  | and pit     | reAlike 3.0 | Delete any  |
|             | by user     | lane.       | Unported    | text labels |
|             | **P         |             | (CC B       | and         |
|             | itlane02**. |             | Y‑SA 3.0)** | extraneous  |
|             | The file    |             | and         | elements,   |
|             | description |             | **G         | then        |
|             | says it     |             | FDL**[\[2\] | extract the |
|             | depicts the |             | ](https://c | `<path>`    |
|             | Nürburgring |             | ommons.wiki | elements    |
|             | layout used |             | media.org/w | r           |
|             | for the     |             | iki/File:Ci | epresenting |
|             | 24‑Hour     |             | rcuit_N%C3% | the track   |
|             | race:       |             | BCrburgring | outline. In |
|             | *"layout    |             | -2002-24h.s | React,      |
|             | from 2005,  |             | vg#:~:text= | embed this  |
|             | the         |             | Licensing). | path inside |
|             | complete    |             | You may     | an `<svg>`  |
|             | track since |             | copy and    | element and |
|             | the         |             | adapt the   | apply CSS   |
|             | 24h         |             | SVG as long | for         |
|             | ‑race"*[\[1 |             | as you      | hover/glow  |
|             | \]](https:/ |             | credit the  | (e.g.,      |
|             | /commons.wi |             | author      | change      |
|             | kimedia.org |             | ("          | `st         |
|             | /wiki/File: |             | Pitlane02") | roke-width` |
|             | Circuit_N%C |             | and share   | and         |
|             | 3%BCrburgri |             | derivative  | `stroke`    |
|             | ng-2002-24h |             | works under | colour on   |
|             | .svg#:~:tex |             | the same    | `:hover`).  |
|             | t=Descripti |             | licence.    | Because the |
|             | on%20Circui |             |             | licence is  |
|             | t%20N%C3%BC |             |             | CC BY‑SA,   |
|             | rburgring). |             |             | include an  |
|             |             |             |             | attribution |
|             |             |             |             | statement   |
|             |             |             |             | and link to |
|             |             |             |             | the licence |
|             |             |             |             | in your     |
|             |             |             |             | dashboard's |
|             |             |             |             | "About" or  |
|             |             |             |             | "Credits"   |
|             |             |             |             | section.    |
+-------------+-------------+-------------+-------------+-------------+
| **2**       | **Wikimedia | **SVG**     | Licenced    | Similar     |
|             | Commons --  | (vector).   | under       | adaptation  |
|             | "Circuit N  | Complete    | **C         | as          |
|             | ürburgring‑ | **Nor       | C BY‑SA 3.0 | source 1.   |
|             | 2002.svg"** | dschleife + | /           | This file   |
|             | -- also by  | GP**        | GFDL**[\    | may have a  |
|             | **P         | layout.     | [4\]](https | slightly    |
|             | itlane02**. |             | ://commons. | different   |
|             | Described   |             | wikimedia.o | layout      |
|             | as          |             | rg/wiki/Fil | (2002       |
|             | *"N         |             | e:Circuit_N | vs 2005)    |
|             | ürburgring, |             | %C3%BCrburg | and         |
|             | layout from |             | ring-2002.s | therefore   |
|             | 2002, the   |             | vg#:~:text= | can be used |
|             | complete    |             | Licensing). | if you      |
|             | track"*     |             | Same        | prefer the  |
|             | [\[3\]](htt |             | conditions  | 2002        |
|             | ps://common |             | as above:   | variant.    |
|             | s.wikimedia |             | credit the  | Remove      |
|             | .org/wiki/F |             | author and  | textual     |
|             | ile:Circuit |             | s           | elements,   |
|             | _N%C3%BCrbu |             | hare‑alike. | then        |
|             | rgring-2002 |             |             | convert the |
|             | .svg#:~:tex |             |             | track       |
|             | t=Descripti |             |             | outline     |
|             | on%20Circui |             |             | into a      |
|             | t%20N%C3%BC |             |             | single `d`  |
|             | rburgring); |             |             | attribute   |
|             | it shows    |             |             | for a React |
|             | the         |             |             | `<path>`    |
|             | combined    |             |             | and style   |
|             | N           |             |             | it.         |
|             | ordschleife |             |             |             |
|             | and GP      |             |             |             |
|             | track.      |             |             |             |
+-------------+-------------+-------------+-------------+-------------+
| **3**       | **Wikimedia | **SVG**     | The author  | Use this if |
|             | Commons --  | (vector).   | released    | you only    |
|             | "N          | **N         | this file   | need the    |
|             | ürburgring  | ordschleife | into the    | N           |
|             | -- Nordschl | only**;     | **public    | ordschleife |
|             | eife.svg"** | does        | domain      | outline.    |
|             | -- drawn by | **not**     | **[\[6\]](h | Combine it  |
|             | **Will P    | include the | ttps://comm | with the GP |
|             | ittenger**. | GP loop.    | ons.wikimed | track from  |
|             | The         |             | ia.org/wiki | source 4 or |
|             | description |             | /File:N%C3% | 5 to build  |
|             | simply      |             | BCrburgring | the full    |
|             | states that |             | _-_Nordschl | 24h layout. |
|             | it is a     |             | eife.svg#:~ | Being       |
|             | track map   |             | :text=Publi | pub         |
|             | of the      |             | c%20domain% | lic‑domain, |
|             | Nordsch     |             | 20Public%20 | it can be   |
|             | leife[\[5\] |             | domain%20fa | freely      |
|             | ](https://c |             | lse,conditi | edited and  |
|             | ommons.wiki |             | ons%20are%2 | embedded.   |
|             | media.org/w |             | 0required%2 |             |
|             | iki/File:N% |             | 0by%20law). |             |
|             | C3%BCrburgr |             | There are   |             |
|             | ing_-_Nords |             | no licence  |             |
|             | chleife.svg |             | re          |             |
|             | #:~:text=De |             | strictions; |             |
|             | scription%2 |             | it can be   |             |
|             | 0N%C3%BCrbu |             | used for    |             |
|             | rgring%20). |             | any purpose |             |
|             |             |             | without     |             |
|             |             |             | a           |             |
|             |             |             | ttribution. |             |
+-------------+-------------+-------------+-------------+-------------+
| **4**       | **Wikimedia | **SVG**.    | Licensed    | Extract the |
|             | Commons --  | **GP loop   | under       | GP loop     |
|             | "C          | only**.     | **C         | path and    |
|             | ircuit Nürb |             | C BY‑SA 3.0 | merge it    |
|             | urgring‑200 |             | /           | with the    |
|             | 2‑GP.svg"** |             | G           | N           |
|             | --          |             | FDL**[\[8\] | ordschleife |
|             | Grand‑Prix  |             | ](https://c | outline     |
|             | track only. |             | ommons.wiki | (source 3)  |
|             | The         |             | media.org/w | to create a |
|             | description |             | iki/File:Ci | combined    |
|             | calls it    |             | rcuit_N%C3% | map. Ensure |
|             | the         |             | BCrburgring | you fulfil  |
|             | *           |             | -2002-GP.sv | the         |
|             | "Grand‑Prix |             | g#:~:text=I | CC BY‑SA    |
|             | ‑Track"*[\[ |             | %2C%20the%2 | attribution |
|             | 7\]](https: |             | 0copyright% | r           |
|             | //commons.w |             | 20holder%20 | equirements |
|             | ikimedia.or |             | of,it%20und | when        |
|             | g/wiki/File |             | er%20the%20 | combining   |
|             | :Circuit_N% |             | following%2 | the files.  |
|             | C3%BCrburgr |             | 0licenses). |             |
|             | ing-2002-GP |             |             |             |
|             | .svg#:~:tex |             |             |             |
|             | t=Descripti |             |             |             |
|             | on%20Circui |             |             |             |
|             | t%20N%C3%BC |             |             |             |
|             | rburgring). |             |             |             |
+-------------+-------------+-------------+-------------+-------------+
| **5**       | **Wikimedia | **SVG**.    | Licensed    | Potentially |
|             | Commons --  | **Sprint    | under       | useful if   |
|             | "Circu      | track       | **C         | you wish to |
|             | it Nürburgr | only** (no  | C BY‑SA 3.0 | show        |
|             | ing‑2002‑Sp | Nor         | /           | alternative |
|             | rint.svg"** | dschleife). | GFDL**      | layouts.    |
|             | -- shows    |             | [\[10\]](ht | Similar     |
|             | the short   |             | tps://commo | extraction  |
|             | "Sprint"    |             | ns.wikimedi | steps       |
|             | loop of the |             | a.org/wiki/ | apply.      |
|             | GP          |             | File:Circui |             |
|             | cir         |             | t_N%C3%BCrb |             |
|             | cuit[\[9\]] |             | urgring-200 |             |
|             | (https://co |             | 2-Sprint.sv |             |
|             | mmons.wikim |             | g#:~:text=I |             |
|             | edia.org/wi |             | %2C%20the%2 |             |
|             | ki/File:Cir |             | 0copyright% |             |
|             | cuit_N%C3%B |             | 20holder%20 |             |
|             | Crburgring- |             | of,it%20und |             |
|             | 2002-Sprint |             | er%20the%20 |             |
|             | .svg#:~:tex |             | following%2 |             |
|             | t=Descripti |             | 0licenses). |             |
|             | on%20Circui |             |             |             |
|             | t%20N%C3%BC |             |             |             |
|             | rburgring). |             |             |             |
+-------------+-------------+-------------+-------------+-------------+
| **6**       | **          | *           | Repository  | If you      |
|             | F1‑Circuits | *GeoJSON**; | is licensed | prefer      |
|             | GeoJSON     | **GP loop   | under the   | working in  |
|             | repository  | only**      | **MIT       | GeoJSON,    |
|             | (GitHub:**  | (appro      | licen       | import this |
|             | `ba         | x. 5.1 km). | ce**[\[12\] | file into a |
|             | cinger/f1-c |             | ](https://r | mapping     |
|             | ircuits`**) |             | aw.githubus | library     |
|             | -- file**   |             | ercontent.c | (MapLibr    |
|             | `de‑192     |             | om/bacinger | e/Leaflet). |
|             | 7.geojson`. |             | /f1-circuit | To build a  |
|             | This        |             | s/master/LI | combined    |
|             | repository  |             | CENSE.md#:~ | Nor         |
|             | contains    |             | :text=Copyr | dschleife + |
|             | GeoJSON     |             | ight%20%28c | GP map you  |
|             | polylines   |             | %29%202019) | will still  |
|             | for         |             | --          | need        |
|             | Formula 1   |             | permissive  | N           |
|             | circuits.   |             | for         | ordschleife |
|             | The file    |             | personal    | geometry    |
|             | `de‑19      |             | and         | (sources 3  |
|             | 27.geojson` |             | commercial  | or via      |
|             | represents  |             | use with    | OSM).       |
|             | the         |             | attribution | Convert the |
|             | **          |             | of the      | GeoJSON     |
|             | Nürburgring |             | copyright   | coordinates |
|             | Grand‑Prix  |             | notice.     | into an SVG |
|             | circuit**;  |             |             | path by     |
|             | the         |             |             | projecting  |
|             | geometry is |             |             | the         |
|             | a           |             |             | coordinates |
|             | `           |             |             | (e.g.,      |
|             | LineString` |             |             | using D3's  |
|             | with        |             |             | `geoPath`)  |
|             | longitu     |             |             | or by       |
|             | de/latitude |             |             | drawing     |
|             | coordinates |             |             | them on a   |
|             | and has     |             |             | canvas and  |
|             | metadata    |             |             | converting  |
|             | such as     |             |             | to path.    |
|             | length and  |             |             |             |
|             | altitu      |             |             |             |
|             | de[\[11\]]( |             |             |             |
|             | https://raw |             |             |             |
|             | .githubuser |             |             |             |
|             | content.com |             |             |             |
|             | /bacinger/f |             |             |             |
|             | 1-circuits/ |             |             |             |
|             | master/circ |             |             |             |
|             | uits/de-192 |             |             |             |
|             | 7.geojson#: |             |             |             |
|             | ~:text=%7B% |             |             |             |
|             | 20%22type%2 |             |             |             |
|             | 2%3A%20%22F |             |             |             |
|             | eatureColle |             |             |             |
|             | ction%22%2C |             |             |             |
|             | %20%22name% |             |             |             |
|             | 22%3A%20%22 |             |             |             |
|             | de,337712). |             |             |             |
+-------------+-------------+-------------+-------------+-------------+
| **7**       | **Op        | **OSM XML / | *           | Use a query |
|             | enStreetMap | JSON**;     | *Open Datab | such as:    |
|             | (OSM) data  | includes    | ase Licence |             |
|             | via         | **Nor       | (ODbL)** -- |             |
|             | Ove         | dschleife** | you may     |             |
|             | rpass API** | and **GP**  | share and   |             |
|             | -- OSM      | segments    | adapt the   |             |
|             | records the | (can be     | data as     |             |
|             | raceway as  | queried     | long as you |             |
|             | `highw      | separately  | credit OSM  |             |
|             | ay=raceway` | or          | c           |             |
|             | or          | together).  | ontributors |             |
|             | `leisu      |             | and keep    |             |
|             | re=raceway` |             | derivatives |             |
|             | ways tagged |             | under the   |             |
|             | with names  |             | same        |             |
|             | such as     |             | licence.    |             |
|             | "No         |             | Attribution |             |
|             | rdschleife" |             | must be     |             |
|             | and         |             | displayed   |             |
|             | "           |             | near the    |             |
|             | Nürburgring |             | map or in   |             |
|             | Grand       |             | doc         |             |
|             | Pri         |             | umentation. |             |
|             | x‑Strecke". |             |             |             |
|             | O           |             |             |             |
|             | verpass API |             |             |             |
|             | can return  |             |             |             |
|             | the         |             |             |             |
|             | geometry in |             |             |             |
|             | JSON/OSM    |             |             |             |
|             | format,     |             |             |             |
|             | which can   |             |             |             |
|             | be          |             |             |             |
|             | converted   |             |             |             |
|             | to GeoJSON  |             |             |             |
|             | (e.g.,      |             |             |             |
|             | using       |             |             |             |
|             | `osmt       |             |             |             |
|             | ogeojson`). |             |             |             |
+-------------+-------------+-------------+-------------+-------------+
|             |             |             |             |             |
| [out:json]; |             |             |             |             |
|     (       |             |             |             |             |
|             |             |             |             |             |
|  way[highwa |             |             |             |             |
| y=raceway][ |             |             |             |             |
| name~"Nords |             |             |             |             |
| chleife"];  |             |             |             |             |
|             |             |             |             |             |
|    way[high |             |             |             |             |
| way=raceway |             |             |             |             |
| ][name~"Gra |             |             |             |             |
| nd Prix"];  |             |             |             |             |
|     );      |             |             |             |             |
|     (._;>;) |             |             |             |             |
| ; out body; |             |             |             |             |
+-------------+-------------+-------------+-------------+-------------+

Send this query to `https://overpass-api.de/api/interpreter` to obtain
nodes and ways. Convert the result to GeoJSON and then into an SVG path.
To visualise on an interactive map, project the coordinates with a
library like D3 or MapLibre. Because the OSM licence requires
attribution, include a statement such as "Map data © OpenStreetMap
contributors, ODbL". \|

## Additional notes and guidance

-   **Avoid unlicensed or unclear sources.** Some community‑built
    interactive maps (e.g., JJ Ying's Nordschleife map or various
    race‑simulation mods) contain embedded SVG paths but provide no
    licence information. Re‑using these without permission may infringe
    copyright.

-   **3D‑printed GPX models** (Printables/MakerWorld) and cycling routes
    (RideWithGPS, Komoot, Plotaroute) embed GPX files, but they are
    user‑generated and the terms of use generally forbid redistribution.
    They are therefore unsuitable for an open dashboard.

-   **Converting SVG to React.** Once you have an SVG track outline, you
    can inline it into a React component. Remove unnecessary
    strokes/text and assign class names to `<path>` elements. For hover
    effects, use CSS transitions (e.g.,
    `path:hover { stroke-width: 4; stroke: #FFD700; }`). For glow
    effects, apply an SVG `<filter>` (e.g., `feGaussianBlur`) and toggle
    it on hover.

-   **GeoJSON to SVG.** If you start with GeoJSON (sources 6 or 7),
    project the coordinates to screen space with a projection library
    (D3's `geoPath` with `geoMercator` or `geoNaturalEarth1`), then
    generate an SVG `<path d="…">`. Scale and translate the path to fit
    your dashboard layout.

-   **Attribution.** When using CC‑BY‑SA or ODbL sources, include credit
    to the author(s) and specify the licence (e.g., "Track outline
    © Pitlane02 (CC BY‑SA 3.0)" or "Contains data © OpenStreetMap
    contributors (ODbL)"). Because the CC BY‑SA licence is share‑alike,
    any modifications or derivatives should also be shared under the
    same licence.

## Recommendations

For a personal interactive dashboard that mirrors the 24‑Hour
Nürburgring layout, the **Wikimedia Commons
"Circuit Nürburgring‑2002‑24h.svg"** is the most straightforward source.
It provides the combined Nordschleife + GP outline in a lightweight SVG
with clear CC BY‑SA
licensing[\[13\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-24h.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring).
Remove text and convert the path into a React component, then overlay
timing data on top. If you require more precise or up‑to‑date geometry
(e.g., for map projection), supplement the SVG with **OSM‑derived
GeoJSON** and ensure ODbL attribution.

[\[1\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-24h.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring)
[\[2\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-24h.svg#:~:text=Licensing)
[\[13\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-24h.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring)
File:Circuit Nürburgring-2002-24h.svg - Wikimedia Commons

<https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-24h.svg>

[\[3\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring)
[\[4\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002.svg#:~:text=Licensing)
File:Circuit Nürburgring-2002.svg - Wikimedia Commons

<https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002.svg>

[\[5\]](https://commons.wikimedia.org/wiki/File:N%C3%BCrburgring_-_Nordschleife.svg#:~:text=Description%20N%C3%BCrburgring%20)
[\[6\]](https://commons.wikimedia.org/wiki/File:N%C3%BCrburgring_-_Nordschleife.svg#:~:text=Public%20domain%20Public%20domain%20false,conditions%20are%20required%20by%20law)
File:Nürburgring - Nordschleife.svg - Wikimedia Commons

<https://commons.wikimedia.org/wiki/File:N%C3%BCrburgring_-_Nordschleife.svg>

[\[7\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-GP.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring)
[\[8\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-GP.svg#:~:text=I%2C%20the%20copyright%20holder%20of,it%20under%20the%20following%20licenses)
File:Circuit Nürburgring-2002-GP.svg - Wikimedia Commons

<https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-GP.svg>

[\[9\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-Sprint.svg#:~:text=Description%20Circuit%20N%C3%BCrburgring)
[\[10\]](https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-Sprint.svg#:~:text=I%2C%20the%20copyright%20holder%20of,it%20under%20the%20following%20licenses)
File:Circuit Nürburgring-2002-Sprint.svg - Wikimedia Commons

<https://commons.wikimedia.org/wiki/File:Circuit_N%C3%BCrburgring-2002-Sprint.svg>

[\[11\]](https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/de-1927.geojson#:~:text=%7B%20%22type%22%3A%20%22FeatureCollection%22%2C%20%22name%22%3A%20%22de,337712)
raw.githubusercontent.com

<https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/de-1927.geojson>

[\[12\]](https://raw.githubusercontent.com/bacinger/f1-circuits/master/LICENSE.md#:~:text=Copyright%20%28c%29%202019)
raw.githubusercontent.com

<https://raw.githubusercontent.com/bacinger/f1-circuits/master/LICENSE.md>
