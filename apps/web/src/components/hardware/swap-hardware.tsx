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
  HardwareTree,
  SwapHardwareComponent,
  swapHardwareComponent,
} from "@cloud/server/src/types/hardware";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { getHardwaresQueryOpts } from "@/lib/queries/hardware";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type FormSchema = SwapHardwareComponent;

type Props = {
  workspace: Workspace;
  hardware: HardwareTree;
};

const SwapHardware = ({ workspace, hardware }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(swapHardwareComponent),
    defaultValues: {
      hardwareId: hardware.id,
    },
  });

  const swapHardware = useMutation({
    mutationFn: async (values: FormSchema) => {
      const { error } = await client
        .hardware({ hardwareId: hardware.id })
        .index.patch(values, {
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hardware", hardware.id] });
    },
  });

  const { data: availableHardware } = useQuery(
    getHardwaresQueryOpts({ onlyAvailable: true, context: { workspace } }),
  );

  function onSubmit(values: FormSchema) {
    toast.promise(swapHardware.mutateAsync(values), {
      loading: "Creating hardware revision...",
      success: "Revision created.",
      error: (err) => `${err}`,
    });
  }

  // Devices can't have revisions if they don't have components
  if (hardware.components.length === 0) {
    return null;
  }

  const selectedComponent = form.watch("oldHardwareComponentId");
  const selectedModel = hardware.components.find(
    (c) => c.id === selectedComponent,
  )?.modelId;
  const swappable = selectedModel
    ? availableHardware?.filter((h) => h.modelId === selectedModel)
    : availableHardware;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit size={24} className="stroke-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a hardware revision</DialogTitle>
          <DialogDescription>Swap components out.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="oldHardwareComponentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Component</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hardware.components.map((child) => (
                          <SelectItem value={child.id} key={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Which component do you want to take out?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newHardwareComponentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Component</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={selectedModel === undefined}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(swappable ?? []).map((h) => (
                          <SelectItem value={h.id} key={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Which component do you want to put in its place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    What&apos;s the reason for this swap?
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
              <Button type="submit">Swap</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SwapHardware;
