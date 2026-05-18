import type { TimingCar } from "../../api/types";
import {
  getCarClassName,
  getCarDriverName,
  getCarDrivers,
  getCarImageUrl,
  getCarModel,
  getCarTeamName,
} from "../../dashboard/carHelpers";
import { formatOptional } from "../../dashboard/formatters";

type FeaturedCarPanelProps = {
  car: TimingCar | null;
  selectedCarNumber: string | null;
};

export function FeaturedCarPanel({ car, selectedCarNumber }: FeaturedCarPanelProps) {
  if (car === null) {
    return (
      <article className="panel featured-panel">
        <div className="panel-heading">
          <p className="eyebrow">Selected car</p>
          <h2>{selectedCarNumber === null ? "Current leader" : `Car #${selectedCarNumber}`}</h2>
        </div>
        <p className="panel-note">
          Waiting for timing cars from the local backend. Once WIGE car packets arrive,
          selecting a row in the leaderboard will pin that car here.
        </p>
      </article>
    );
  }

  const carImageUrl = getCarImageUrl(car);
  const drivers = getCarDrivers(car);
  const driverSummary = drivers.length > 0 ? drivers.join(" / ") : "No driver metadata yet.";

  return (
    <article className="panel featured-panel">
      <div className="panel-heading">
        <p className="eyebrow">Selected car</p>
        <h2>{selectedCarNumber === null ? "Current leader" : `Car #${selectedCarNumber}`}</h2>
      </div>

      <div className="featured-car">
        <div className="featured-car__hero">
          <div>
            <strong>#{car.carNumber}</strong>
            <p>{getCarTeamName(car)}</p>
            <span>{getCarModel(car)}</span>
          </div>

          {carImageUrl !== null ? (
            <img src={carImageUrl} alt={`Car ${car.carNumber}`} />
          ) : (
            <div className="featured-car__image-placeholder" aria-hidden="true">
              No car image
            </div>
          )}
        </div>

        <div className="featured-car__content">
          <dl className="featured-stats">
            <div>
              <dt>Position</dt>
              <dd>P{formatOptional(car.position)}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>{getCarClassName(car)}</dd>
            </div>
            <div>
              <dt>Lap</dt>
              <dd>{formatOptional(car.lap)}</dd>
            </div>
            <div>
              <dt>Gap</dt>
              <dd>{formatOptional(car.gapToLeader)}</dd>
            </div>
          </dl>
          <dl className="featured-details">
            <div>
              <dt>Current driver</dt>
              <dd>{getCarDriverName(car)}</dd>
            </div>
            <div>
              <dt>Pit stops</dt>
              <dd>{formatOptional(car.pitStopCount)}</dd>
            </div>
          </dl>
          <div className="driver-list" aria-label={`Drivers for car ${car.carNumber}`}>
            <span>Drivers</span>
            <p>{driverSummary}</p>
          </div>
        </div>
      </div>
    </article>
  );
}