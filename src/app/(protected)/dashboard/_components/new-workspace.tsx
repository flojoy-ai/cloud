"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

import { api } from "~/trpc/react";

export default function NewWorkspace() {
  const router = useRouter();
  const [name, setName] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createPost = api.workspace.createWorkspace.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setIsDialogOpen(false);
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create your new workspace</DialogTitle>
          <DialogDescription>
            Your workspace is the home for all your projects.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How do you want to call your new workspace?"
            />
          </div>
        </div>
        <DialogFooter className="">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="default"
            onClick={() => createPost.mutate({ name })}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
