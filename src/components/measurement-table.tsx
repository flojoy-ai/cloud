import { type SelectMeasurement } from "~/types/measurement";

type Props = {
  measurements: SelectMeasurement[];
};

const MeasurementTable = ({ measurements }: Props) => {
  return (
    <div>
      {measurements.map((measurement) => {
        return <div key={measurement.id}>{measurement.name}</div>;
      })}
    </div>
  );
};

export default MeasurementTable;
