export default function Measurement({
  params,
}: {
  params: { measurementId: string };
}) {
  return <div>Measurement {params.measurementId}</div>;
}
