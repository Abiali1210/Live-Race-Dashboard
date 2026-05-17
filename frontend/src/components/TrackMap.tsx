import { useId, useMemo } from "react";

import sourceSvg from "../../Circuit_Nürburgring-2002-24h.svg?raw";
import "./TrackMap.css";

type SvgPath = {
  d: string;
  fill: string | null;
  strokeWidth: number | null;
};

type TrackGeometry = {
  connectorPath: string;
  directionMarkers: string[];
  mainTrackPath: string;
  pitLanePath: string;
  secondaryTrackPaths: Array<Pick<SvgPath, "d" | "strokeWidth">>;
  startFinishTiles: Array<Pick<SvgPath, "d" | "fill">>;
};

const emptyGeometry: TrackGeometry = {
  connectorPath: "",
  directionMarkers: [],
  mainTrackPath: "",
  pitLanePath: "",
  secondaryTrackPaths: [],
  startFinishTiles: [],
};

const trackLabels = [
  { label: "Nordschleife", x: 318, y: 346, anchor: "middle" },
  { label: "GP-Strecke", x: 232, y: 520, anchor: "middle" },
  { label: "Start/Ziel", x: 307, y: 488, anchor: "start" },
  { label: "Döttinger Höhe", x: 446, y: 316, anchor: "start" },
] as const;

function readPath(path: Element): SvgPath | null {
  const d = path.getAttribute("d");

  if (d === null) {
    return null;
  }

  const strokeWidth = path.getAttribute("stroke-width");

  return {
    d,
    fill: path.getAttribute("fill"),
    strokeWidth: strokeWidth === null ? null : Number(strokeWidth),
  };
}

function extractTrackGeometry(svgText: string): TrackGeometry {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, "image/svg+xml");
  const topLevelPaths = Array.from(document.querySelectorAll("svg > g > path"))
    .map(readPath)
    .filter((path): path is SvgPath => path !== null);
  const startFinishTiles = Array.from(document.querySelectorAll("svg > g > g path"))
    .map(readPath)
    .filter((path): path is SvgPath => path !== null)
    .map(({ d, fill }) => ({ d, fill }));
  const mainTrackPath = topLevelPaths[13]?.d;

  if (mainTrackPath === undefined) {
    return emptyGeometry;
  }

  return {
    connectorPath: topLevelPaths[11]?.d ?? "",
    directionMarkers: topLevelPaths.slice(7, 11).map(({ d }) => d),
    mainTrackPath,
    pitLanePath: topLevelPaths[12]?.d ?? "",
    secondaryTrackPaths: topLevelPaths
      .slice(0, 7)
      .map(({ d, strokeWidth }) => ({ d, strokeWidth })),
    startFinishTiles,
  };
}

type TrackMapProps = {
  className?: string;
};

export function TrackMap({ className }: TrackMapProps) {
  const titleId = useId();
  const descriptionId = useId();
  const classNames = ["track-map", className].filter(Boolean).join(" ");
  const geometry = useMemo(() => extractTrackGeometry(sourceSvg), []);

  return (
    <figure className={classNames}>
      <div
        className="track-map__stage"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={0}
      >
        <svg
          className="track-map__svg"
          viewBox="0 0 690.66 638.50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={titleId}>Nürburgring 24h circuit layout</title>
          <desc id={descriptionId}>
            Static outline of the combined Nordschleife and Grand Prix circuit used for the Nürburgring 24h race. Live car GPS positions are not shown.
          </desc>

          <defs>
            <filter id="track-map-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0.98  0 1 0 0 0.7  0 0 1 0 0.18  0 0 0 0.75 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="track-map__grid" aria-hidden="true">
            <path d="M 64 64 H 628" />
            <path d="M 64 192 H 628" />
            <path d="M 64 320 H 628" />
            <path d="M 64 448 H 628" />
            <path d="M 128 24 V 602" />
            <path d="M 256 24 V 602" />
            <path d="M 384 24 V 602" />
            <path d="M 512 24 V 602" />
          </g>

          <g className="track-map__secondary" aria-hidden="true">
            {geometry.secondaryTrackPaths.map((path) => (
              <path
                key={path.d}
                d={path.d}
                strokeWidth={path.strokeWidth ?? undefined}
              />
            ))}
            {geometry.connectorPath !== "" && <path d={geometry.connectorPath} strokeWidth="4.5" />}
            {geometry.pitLanePath !== "" && <path d={geometry.pitLanePath} strokeWidth="2" />}
          </g>

          <path className="track-map__halo" d={geometry.mainTrackPath} aria-hidden="true" />
          <path className="track-map__outline" d={geometry.mainTrackPath} />

          <g className="track-map__direction-markers" aria-hidden="true">
            {geometry.directionMarkers.map((path) => (
              <path key={path} d={path} />
            ))}
          </g>

          <g className="track-map__start-finish" aria-hidden="true">
            {geometry.startFinishTiles.map((tile) => (
              <path
                key={tile.d}
                d={tile.d}
                fill={tile.fill === "#FFFFFF" ? "var(--track-map-checker-light)" : "var(--track-map-checker-dark)"}
              />
            ))}
          </g>

          <g className="track-map__labels" aria-hidden="true">
            {trackLabels.map((trackLabel) => (
              <text
                key={trackLabel.label}
                x={trackLabel.x}
                y={trackLabel.y}
                textAnchor={trackLabel.anchor}
              >
                {trackLabel.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <figcaption className="track-map__caption">
        <span>Static circuit reference. Live car GPS is not available.</span>
        <span>Track outline © Pitlane02, Wikimedia Commons, CC BY-SA 3.0 / GFDL.</span>
      </figcaption>
    </figure>
  );
}
