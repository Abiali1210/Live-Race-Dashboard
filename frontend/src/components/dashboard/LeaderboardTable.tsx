import type { TimingCar } from "../../api/types";
import { getCarClassName, getCarDriverName, getCarModel, getCarTeamName } from "../../dashboard/carHelpers";
import { formatOptional } from "../../dashboard/formatters";

type LeaderboardTableProps = {
  cars: TimingCar[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  selectedCarNumber: string | null;
  onSelectCar: (carNumber: string) => void;
};

export function LeaderboardTable({
  cars,
  hasActiveFilters,
  onClearFilters,
  selectedCarNumber,
  onSelectCar,
}: LeaderboardTableProps) {
  function getSelectionLabel(car: TimingCar, isSelected: boolean): string {
    const position = formatOptional(car.position);
    const lap = formatOptional(car.lap);
    const selectionState = isSelected
      ? "Currently shown in the featured car panel."
      : "Select this car for the featured car panel.";

    return [
      selectionState,
      `Car ${car.carNumber}.`,
      `Position ${position}.`,
      `Class ${getCarClassName(car)}.`,
      `Team ${getCarTeamName(car)}.`,
      `Driver ${getCarDriverName(car)}.`,
      `Vehicle ${getCarModel(car)}.`,
      `Lap ${lap}.`,
      `Pit status ${car.pitStatus}.`,
    ].join(" ");
  }

  return (
    <div className="leaderboard-table-wrap">
      <table className="leaderboard-table" aria-label="Full race leaderboard">
        <caption>
          Full live timing field. Use horizontal and vertical scrolling to inspect all cars.
          Use each car number button to show that car in the featured panel.
        </caption>
        <thead>
          <tr>
            <th>Pos</th>
            <th>No</th>
            <th>Class</th>
            <th>Team</th>
            <th>Driver</th>
            <th>Car</th>
            <th>Lap</th>
            <th>Gap</th>
            <th>Last</th>
            <th>Best</th>
            <th>Pit</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car) => {
              const isSelected = car.carNumber === selectedCarNumber;

              return (
                <tr
                  className={isSelected ? "is-selected" : undefined}
                  key={car.carNumber}
                  onClick={() => onSelectCar(car.carNumber)}
                >
                  <td className="table-position">P{formatOptional(car.position)}</td>
                  <th className="table-car-number" scope="row">
                    <button
                      className="leaderboard-row-select"
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={getSelectionLabel(car, isSelected)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectCar(car.carNumber);
                      }}
                    >
                      #{car.carNumber}
                      {isSelected && <span className="sr-only"> selected</span>}
                    </button>
                  </th>
                  <td>{getCarClassName(car)}</td>
                  <td className="table-team">{getCarTeamName(car)}</td>
                  <td>{getCarDriverName(car)}</td>
                  <td>{getCarModel(car)}</td>
                  <td>{formatOptional(car.lap)}</td>
                  <td>{formatOptional(car.gapToLeader)}</td>
                  <td>{formatOptional(car.lastLap)}</td>
                  <td>{formatOptional(car.bestLap)}</td>
                  <td>
                    <span className={`pit-status pit-status--${car.pitStatus.toLowerCase()}`}>
                      {car.pitStatus}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="table-empty" colSpan={11}>
                {hasActiveFilters ? (
                  <div className="table-empty-state">
                    <strong>No cars match the current filters.</strong>
                    <span>Clear search or reset the class filter to return to the full field.</span>
                    <button type="button" onClick={onClearFilters}>Reset filters</button>
                  </div>
                ) : (
                  <div className="table-empty-state">
                    <strong>Waiting for timing rows from the local backend.</strong>
                    <span>
                      WIGE timing arrives event-by-event over websocket, so the field may stay empty
                      until the backend receives live car packets for this event.
                    </span>
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}