"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronsLeft } from "lucide-react";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button onClick={() => router.back()} variant="secondary">
      <ChevronsLeft className="mr-2" />
      Back
    </Button>
  );
};

export default BackButton;
