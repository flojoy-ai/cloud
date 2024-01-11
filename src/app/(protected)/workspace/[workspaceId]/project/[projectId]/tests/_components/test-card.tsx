import { type SelectTest } from "~/types/test";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getPrettyTime } from "~/lib/time";
import { Badge } from "~/components/ui/badge";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import CopyIdContextMenu from "~/components/copy-id-context-menu";

type Props = {
  test: SelectTest;
  workspaceId: string;
};

const TestCard = ({ test, workspaceId }: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${workspaceId}/test/${test.id}`}>
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>{test.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{test.measurementType}</Badge>
            </CardContent>
            <CardFooter>
              <div>
                Last updated:{" "}
                {test.updatedAt ? getPrettyTime(test.updatedAt) : "Never"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <CopyIdContextMenu value={test.id} />
    </ContextMenu>
  );
};

export default TestCard;
