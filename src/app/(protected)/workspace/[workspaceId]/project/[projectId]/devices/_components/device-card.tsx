import Link from "next/link";
import CopyIdContextMenu from "~/components/copy-id-context-menu";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { getPrettyTime } from "~/lib/time";
import { type SelectDevice } from "~/types/device";

type Props = {
  device: SelectDevice;
  workspaceId: string;
};

const DeviceCard = ({ device, workspaceId }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${workspaceId}/device/${device.id}`}>
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
      <CopyIdContextMenu value={device.id} />
    </ContextMenu>
  );
};

export default DeviceCard;
