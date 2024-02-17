"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@cloud/ui/components/ui/radio-group";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@cloud/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cloud/ui/components/ui/form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cloud/ui/components/ui/dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@cloud/ui/components/ui/input";
import { api } from "~/trpc/react";
import { insertTestSchema } from "~/types/test";
import { type z } from "zod";
import { allMeasurementDataTypes } from "~/types/data";
import { handleError } from "~/lib/utils";
import { Project } from "~/schemas/public/Project";

type Props = {
  project: Project;
};

const CreateTest = ({ project }: Props) => {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createTest = api.test.createTest.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsDialogOpen(false);
    },
  });

  const form = useForm<z.infer<typeof insertTestSchema>>({
    resolver: zodResolver(insertTestSchema),
    defaultValues: {
      projectId: project.id,
      measurementType: "dataframe",
    },
  });

  function onSubmit(values: z.infer<typeof insertTestSchema>) {
    toast.promise(
      createTest.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your test...",
        success: "Your test is ready.",
        error: handleError,
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Create Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new test</DialogTitle>
          <DialogDescription>What do you want to test today?</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pass/Fail Test"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    How do you want to call your test?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Measurement Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {allMeasurementDataTypes.map((supportedType) => (
                        <FormItem
                          key={supportedType}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={supportedType} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {supportedType}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <FormDescription>
                    What type of measurement will this test receive?
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
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTest;
