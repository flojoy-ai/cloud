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

const CreateDevice = ({ project }: Props) => {
  const router = useRouter();
  const [name, setName] = useState<string>("");

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createDevice = api.device.createDevice.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setIsDialogOpen(false);
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new device</DialogTitle>
          <DialogDescription>
            Which hardware device of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What is the name of your hardware device?"
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
                createDevice.mutateAsync({
                  name,
                  projectId: project.id,
                }),
                {
                  loading: "Creating your device...",
                  success: "Your device is ready.",
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

export default CreateDevice;
