import { type SelectTest } from "~/types/test";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getPrettyTime } from "~/lib/time";

type Props = {
  test: SelectTest;
};

const TestCard = ({ test }: Props) => {
  return (
    <Link href={`/test/${test.id}`}>
      <Card className="transition-all duration-300 hover:bg-secondary/80">
        <CardHeader>
          <CardTitle>{test.name}</CardTitle>
          <CardDescription>{test.id}</CardDescription>
        </CardHeader>
        <CardFooter>
          <div>
            <div>Last updated:</div>
            {test.updatedAt ? getPrettyTime(test.updatedAt) : "Never"}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TestCard;
