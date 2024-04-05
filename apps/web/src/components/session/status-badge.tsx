import { Badge } from "@/components/ui/badge";

type Props = {
  status: boolean | null;
};

export function StatusBadge({ status }: Props) {
  if (status === true) {
    return (
      <Badge className="bg-green-300 text-green-900 hover:bg-green-400">
        Pass
      </Badge>
    );
  } else if (status === false) {
    return (
      <Badge className="bg-red-300 text-red-900 hover:bg-red-400">Fail</Badge>
    );
  } else {
    return (
      <Badge className="bg-gray-300 text-gray-600 hover:bg-gray-400">
        Unevaluated
      </Badge>
    );
  }
}
