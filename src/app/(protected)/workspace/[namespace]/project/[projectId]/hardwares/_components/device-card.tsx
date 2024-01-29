import Link from "next/link";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
// import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "~/components/ui/context-menu";
import { type SelectHardware } from "~/types/hardware";

type Props = {
  hardware: SelectHardware;
  namespace: string;
};

const HardwareCard = ({ hardware, namespace }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${namespace}/hardware/${hardware.id}`}>
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{hardware.name}</CardTitle>
              <CardDescription>{hardware.id}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={hardware.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default HardwareCard;
