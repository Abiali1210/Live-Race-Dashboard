import type { TimingCar } from "../../api/types";
import type { LeaderboardSortMode } from "../../dashboard/leaderboardFilters";
import { LeaderboardControls } from "./LeaderboardControls";
import { LeaderboardTable } from "./LeaderboardTable";

type LeaderboardPanelProps = {
  availableClasses: string[];
  filteredCars: TimingCar[];
  hasActiveFilters: boolean;
  leaderboardSearch: string;
  selectedCarHiddenByFilters: boolean;
  selectedCarNumber: string | null;
  selectedClass: string;
  sortMode: LeaderboardSortMode;
  totalCars: TimingCar[];
  onClearFilters: () => void;
  onLeaderboardSearchChange: (value: string) => void;
  onSelectedClassChange: (value: string) => void;
  onSelectCar: (carNumber: string) => void;
  onSortModeChange: (value: LeaderboardSortMode) => void;
};

export function LeaderboardPanel({
  availableClasses,
  filteredCars,
  hasActiveFilters,
  leaderboardSearch,
  selectedCarHiddenByFilters,
  selectedCarNumber,
  selectedClass,
  sortMode,
  totalCars,
  onClearFilters,
  onLeaderboardSearchChange,
  onSelectedClassChange,
  onSelectCar,
  onSortModeChange,
}: LeaderboardPanelProps) {
  return (
    <article className="panel leaderboard-panel">
      <div className="panel-heading">
        <p className="eyebrow">Timing snapshot</p>
        <h2>Full field</h2>
        <span className="panel-kicker">{totalCars.length} cars</span>
      </div>

      <LeaderboardControls
        availableClasses={availableClasses}
        filteredCarCount={filteredCars.length}
        leaderboardSearch={leaderboardSearch}
        selectedCarHiddenByFilters={selectedCarHiddenByFilters}
        selectedClass={selectedClass}
        sortMode={sortMode}
        totalCarCount={totalCars.length}
        onClearFilters={onClearFilters}
        onLeaderboardSearchChange={onLeaderboardSearchChange}
        onSelectedClassChange={onSelectedClassChange}
        onSortModeChange={onSortModeChange}
      />

      <LeaderboardTable
        cars={filteredCars}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        selectedCarNumber={selectedCarNumber}
        onSelectCar={onSelectCar}
      />
    </article>
  );
}