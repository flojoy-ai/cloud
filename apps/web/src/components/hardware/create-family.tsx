import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { handleError } from "@/lib/utils";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Static } from "elysia";
import { Cpu } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Autocomplete } from "../ui/autocomplete";
import { insertFamily, Product } from "@cloud/shared";
import { getProductsQueryKey } from "@/lib/queries/product";
import { getFamiliesQueryKey } from "@/lib/queries/family";

type FormSchema = Static<typeof insertFamily>;

type Props = {
  workspaceId: string;
  products: Product[];
};

const CreateFamily = ({ workspaceId, products }: Props) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createFamily = useMutation({
    mutationFn: async (vals: FormSchema) => {
      const { error } = await client.family.index.post(vals, {
        headers: { "flojoy-workspace-id": workspaceId },
      });
      if (error) {
        if (typeof error.value === "string") {
          throw new Error(error.value);
        } else {
          throw new Error(error.value.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getFamiliesQueryKey() });
      setIsDialogOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(insertFamily),
    defaultValues: {
      workspaceId,
    },
  });

  function onSubmit(values: FormSchema) {
    toast.promise(createFamily.mutateAsync(values), {
      loading: "Creating your part family...",
      success: "Part family created.",
      error: handleError,
    });
  }

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
        <Button variant="default" size="sm">
          <Cpu className="mr-2 text-muted" size={20} />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new hardware family</DialogTitle>
          <DialogDescription>
            What family of hardware models are you working on?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="M1234" {...field} data-1p-ignore />
                  </FormControl>
                  <FormDescription>
                    What are you calling this family of parts?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={products.map((p) => p.name)}
                      {...field}
                      value={field.value}
                      onChange={(val) => form.setValue("productName", val)}
                      placeholder="Search or create new..."
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    Which product does this fall under? You can enter one that
                    doesn't exist yet to create it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-1p-ignore />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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

export default CreateFamily;
