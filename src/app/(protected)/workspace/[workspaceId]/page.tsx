"use client";

import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { workspaceId: string } }) {
  const router = useRouter();
  router.replace(`/workspace/${params.workspaceId}/general`);
}
