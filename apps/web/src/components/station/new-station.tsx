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

import { Project } from "@cloud/server/src/schemas/public/Project";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { InsertStation } from "@cloud/server/src/types/station";

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

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
      >
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            New Test Station
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your new test station</DialogTitle>
            <DialogDescription>
              A test station runs a series of tests on a given hardware model.
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
