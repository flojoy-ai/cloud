"use client";

import { type SelectProject } from "~/types/project";

import { toast } from "sonner";
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

type Props = {
  project: SelectProject;
};

const CreateTest = ({ project }: Props) => {
  // TODO: remake this component into a proper form
  const router = useRouter();
  const [name, setName] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createTest = api.test.createTest.useMutation({
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
          New Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new test</DialogTitle>
          <DialogDescription>What do you want to test today?</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How do you want to call your new test?"
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
            onClick={() =>
              toast.promise(
                createTest.mutateAsync({
                  name,
                  projectId: project.id,
                  measurementType: "boolean",
                }),
                {
                  loading: "Creating your test...",
                  success: "Your test is ready.",
                  error: "Something went wrong :(",
                },
              )
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTest;
