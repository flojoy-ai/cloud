import Link from "next/link";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
// import { Badge } from "@cloud/ui/components/ui/badge";
import {
  Card,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@cloud/ui/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@cloud/ui/components/ui/context-menu";
import { type SelectHardware } from "~/types/hardware";

type Props = {
  hardware: SelectHardware;
  namespace: string;
};

const HardwareCard = ({ hardware, namespace }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          href={{
            pathname: `/workspace/${namespace}/hardware/${hardware.id}`,
            query: {
              back: true,
            },
          }}
        >
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
