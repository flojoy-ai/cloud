import { Icons } from "~/components/icons";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <Icons.spinner className="mx-auto animate-spin" />;
}
