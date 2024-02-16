import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloud/ui/components/ui/card";
// import { getPrettyTime } from "~/lib/time";
import { Badge } from "@cloud/ui/components/ui/badge";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@cloud/ui/components/ui/context-menu";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
import { Test } from "~/schemas/public/Test";

type Props = {
  test: Test;
  namespace: string;
};

const TestCard = ({ test, namespace }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          href={{
            pathname: `/workspace/${namespace}/test/${test.id}`,
            query: { back: true },
          }}
        >
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>{test.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{test.measurementType}</Badge>
            </CardContent>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={test.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TestCard;
