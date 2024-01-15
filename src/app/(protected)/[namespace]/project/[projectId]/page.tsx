"use client";

import { useRouter } from "next/navigation";

export default function Page({
  params,
}: {
  params: { projectId: string; namespace: string };
}) {
  const router = useRouter();
  router.replace(`/${params.namespace}/project/${params.projectId}/devices`);
}
