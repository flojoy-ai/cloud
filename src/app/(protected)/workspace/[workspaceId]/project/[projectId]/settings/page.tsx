"use client";

import { useRouter } from "next/navigation";

export default function Page({
  params,
}: {
  params: { projectId: string; workspaceId: string };
}) {
  const router = useRouter();
  router.replace(
    `/workspace/${params.workspaceId}/project/${params.projectId}/settings/general`,
  );
}
