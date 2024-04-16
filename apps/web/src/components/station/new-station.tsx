import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { handleError } from "@/lib/utils";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { Project, InsertStation } from "@cloud/shared";
import { Plus } from "lucide-react";
import { useProjectUser } from "@/hooks/use-project-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Info } from "lucide-react";

type Props = {
  project: Project;
};

export default function NewStationButton({ project }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const form = useForm<InsertStation>({
    resolver: typeboxResolver(InsertStation),
    defaultValues: {
      projectId: project.id,
    },
  });

  const createStation = useMutation({
    mutationFn: async (values: InsertStation) => {
      const { data, error } = await client.station.index.post(values, {
        query: { projectId: project.id },
        headers: {
          "flojoy-workspace-id": project.workspaceId,
        },
      });
      if (error) {
        switch (error.status) {
          case 500:
            throw error.value;
          default:
            throw error.value;
        }
      }
      return data;
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      form.reset();
    },
  });

  function onSubmit(values: InsertStation) {
    toast.promise(
      createStation.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your test station...",
        success: "Your test station is ready.",
        error: handleError,
      },
    );
  }

  const { projectUserPerm } = useProjectUser();

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
      >
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              disabled={!projectUserPerm.canWrite()}
              size="icon"
            >
              <Plus />
            </Button>
          </DialogTrigger>
          {!projectUserPerm.canWrite() && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Info className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent>
                  Please contact your workspace or project admin to create a
                  test station :)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your new test station</DialogTitle>
            <DialogDescription>
              A test station runs a series of tests on a part variation.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2"
              id="new-station-form"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Station 1"
                        {...field}
                        data-1p-ignore
                      />
                    </FormControl>
                    <FormDescription>
                      How do you want to call your test station?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <Button type="submit" form="new-station-form">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
