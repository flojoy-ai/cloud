import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type SelectDevice } from "~/types/device";

type Props = {
  device: SelectDevice;
};

const DeviceCard = ({ device }: Props) => {
  return (
    <Link href={`/device/${device.id}`}>
      <Card className="transition-all duration-300 hover:bg-secondary/80">
        <CardHeader>
          <CardTitle>{device.name}</CardTitle>
          <CardDescription>{device.id}</CardDescription>
        </CardHeader>
        <CardFooter>
          <div>
            <div>Last updated:</div>
            <div>{device.updatedAt?.toLocaleTimeString() ?? "Never"}</div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DeviceCard;
