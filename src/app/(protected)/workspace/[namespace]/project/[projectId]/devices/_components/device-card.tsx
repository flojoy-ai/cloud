import Link from "next/link";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "~/components/ui/context-menu";
import { getPrettyTime } from "~/lib/time";
import { type SelectDevice } from "~/types/device";

type Props = {
  device: SelectDevice;
  namespace: string;
};

const DeviceCard = ({ device, namespace }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/${namespace}/device/${device.id}`}>
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{device.name}</CardTitle>
              <CardDescription>{device.id}</CardDescription>
            </CardHeader>
            <CardFooter>
              <div>
                Last updated:{" "}
                {device.updatedAt ? getPrettyTime(device.updatedAt) : "Never"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={device.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default DeviceCard;
