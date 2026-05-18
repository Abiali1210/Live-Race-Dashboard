import { allClassesFilterValue, type LeaderboardSortMode } from "../../dashboard/leaderboardFilters";

type LeaderboardControlsProps = {
  availableClasses: string[];
  filteredCarCount: number;
  leaderboardSearch: string;
  selectedCarHiddenByFilters: boolean;
  selectedClass: string;
  sortMode: LeaderboardSortMode;
  totalCarCount: number;
  onClearFilters: () => void;
  onLeaderboardSearchChange: (value: string) => void;
  onSelectedClassChange: (value: string) => void;
  onSortModeChange: (value: LeaderboardSortMode) => void;
};

export function LeaderboardControls({
  availableClasses,
  filteredCarCount,
  leaderboardSearch,
  selectedCarHiddenByFilters,
  selectedClass,
  sortMode,
  totalCarCount,
  onClearFilters,
  onLeaderboardSearchChange,
  onSelectedClassChange,
  onSortModeChange,
}: LeaderboardControlsProps) {
  const hasActiveFilters = leaderboardSearch.trim() !== "" || selectedClass !== allClassesFilterValue;

  return (
    <div className="leaderboard-controls" aria-label="Leaderboard filters">
      <label className="leaderboard-control">
        <span>Search</span>
        <input
          type="search"
          value={leaderboardSearch}
          onChange={(event) => onLeaderboardSearchChange(event.target.value)}
          placeholder="Car, team, driver, class…"
        />
      </label>

      <label className="leaderboard-control leaderboard-control--class">
        <span>Class</span>
        <select
          value={selectedClass}
          onChange={(event) => onSelectedClassChange(event.target.value)}
        >
          <option value={allClassesFilterValue}>All classes</option>
          {availableClasses.map((className) => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
      </label>

      <label className="leaderboard-control leaderboard-control--sort">
        <span>Sort</span>
        <select
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value as LeaderboardSortMode)}
        >
          <option value="position">Live position</option>
          <option value="carNumber">Car number</option>
          <option value="class">Class</option>
          <option value="team">Team</option>
          <option value="lap">Lap count</option>
          <option value="bestLap">Best lap</option>
          <option value="lastLap">Last lap</option>
        </select>
      </label>

      <div className="leaderboard-filter-summary" aria-live="polite">
        Showing {filteredCarCount}/{totalCarCount} cars
      </div>

      <button
        className="leaderboard-reset-button"
        type="button"
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
      >
        Reset filters
      </button>

      {selectedCarHiddenByFilters && (
        <p className="leaderboard-filter-warning">
          Selected car is hidden by the current search or class filter.
        </p>
      )}
    </div>
  );
}