import { Badge } from "@/components/ui/badge";

type Props = {
  status: boolean | null;
};

export function StatusBadge({ status }: Props) {
  if (status === true) {
    return <Badge variant="green">Pass</Badge>;
  } else if (status === false) {
    return <Badge variant="red">Fail</Badge>;
  } else {
    return <Badge variant="gray">Unevaluated</Badge>;
  }
}
