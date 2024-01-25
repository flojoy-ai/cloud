"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { type z } from "zod";
import DeleteProject from "./delete-project";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "~/components/icons";
import { publicUpdateProjectSchema } from "~/types/project";

type Props = {
  projectId: string;
};

const GeneralForm = ({ projectId }: Props) => {
  const { data: project } = api.project.getProjectById.useQuery({
    projectId: projectId,
  });

  const router = useRouter();

  const defaultValues = {
    projectId: projectId,
    name: "",
  };

  const form = useForm<z.infer<typeof publicUpdateProjectSchema>>({
    resolver: zodResolver(publicUpdateProjectSchema),
    defaultValues,
  });

  const updateProject = api.project.updateProject.useMutation({
    onSuccess: () => {
      form.reset(defaultValues);
      router.refresh();
    },
  });

  function onSubmit(values: z.infer<typeof publicUpdateProjectSchema>) {
    toast.promise(
      updateProject.mutateAsync({
        ...values,
      }),
      {
        loading: "Updating your project...",
        success: "Your project is updated.",
        error: "Something went wrong :(",
      },
    );
  }

  if (!project) {
    return <Icons.spinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} data-1p-ignore />
              </FormControl>
              <FormDescription>Give your project a new name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="py-4" />

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Update Project
          </Button>
          <DeleteProject projectId={projectId} />
        </div>
      </form>
    </Form>
  );
};

export default GeneralForm;
