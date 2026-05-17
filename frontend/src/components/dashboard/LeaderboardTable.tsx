import type { KeyboardEvent } from "react";

import type { TimingCar } from "../../api/types";
import { getCarClassName, getCarDriverName, getCarModel, getCarTeamName } from "../../dashboard/carHelpers";
import { formatOptional } from "../../dashboard/formatters";

type LeaderboardTableProps = {
  cars: TimingCar[];
  selectedCarNumber: string | null;
  onSelectCar: (carNumber: string) => void;
};

export function LeaderboardTable({ cars, selectedCarNumber, onSelectCar }: LeaderboardTableProps) {
  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, carNumber: string): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectCar(carNumber);
    }
  }

  return (
    <div className="leaderboard-table-wrap">
      <table className="leaderboard-table" aria-label="Full race leaderboard">
        <caption>
          Full live timing field. Use horizontal and vertical scrolling to inspect all cars.
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
                  onKeyDown={(event) => handleRowKeyDown(event, car.carNumber)}
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <td className="table-position">P{formatOptional(car.position)}</td>
                  <td className="table-car-number">#{car.carNumber}</td>
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
                Waiting for timing rows from the local backend.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}