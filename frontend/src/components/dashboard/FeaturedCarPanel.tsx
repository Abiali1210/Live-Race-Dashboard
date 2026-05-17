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
        <p className="panel-note">Waiting for timing cars.</p>
      </article>
    );
  }

  const carImageUrl = getCarImageUrl(car);
  const drivers = getCarDrivers(car);

  return (
    <article className="panel featured-panel">
      <div className="panel-heading">
        <p className="eyebrow">Selected car</p>
        <h2>{selectedCarNumber === null ? "Current leader" : `Car #${selectedCarNumber}`}</h2>
      </div>

      <div className="featured-car">
        {carImageUrl !== null ? (
          <img src={carImageUrl} alt={`Car ${car.carNumber}`} />
        ) : (
          <div className="featured-car__image-placeholder" aria-hidden="true">
            No car image
          </div>
        )}
        <div className="featured-car__content">
          <strong>#{car.carNumber}</strong>
          <p>{getCarTeamName(car)}</p>
          <span>{getCarModel(car)}</span>
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
              <dt>Team</dt>
              <dd>{getCarTeamName(car)}</dd>
            </div>
            <div>
              <dt>Entrant ID</dt>
              <dd>{formatOptional(car.metadata?.entrantId)}</dd>
            </div>
            <div>
              <dt>Pit stops</dt>
              <dd>{formatOptional(car.pitStopCount)}</dd>
            </div>
          </dl>
          <div className="driver-list" aria-label={`Drivers for car ${car.carNumber}`}>
            <span>Drivers</span>
            {drivers.length > 0 ? (
              <ul>
                {drivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            ) : (
              <p>No driver metadata yet.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}