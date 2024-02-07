"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createUserInvite } from "~/types/user";
import { workspaceRoles } from "~/config/workspace_user";
import { toast } from "sonner";

const formSchema = createUserInvite;

type Props = {
  workspaceId: string;
};

const InviteUser = ({ workspaceId }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId,
    },
  });
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const inviteUser = api.user.addUserToWorkspace.useMutation({
    onSuccess: async () => {
      setOpen(false);
      toast.message("User invited, an email has been sent.");
      void utils.user.getUsersInWorkspace.invalidate();
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    inviteUser.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        id="invite-user-form"
      >
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
          <DialogTrigger asChild>
            <Button size="sm">Invite user</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a user to this workspace</DialogTitle>
              <DialogDescription>
                You can also set the role of the user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 space-x-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="joey@flojoy.io"
                          {...field}
                          data-1p-ignore
                        />
                      </FormControl>
                      <FormDescription>
                        An email will be sent shortly to this address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workspaceRoles
                              .filter((role) => role !== "owner")
                              .map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" form="invite-user-form">
              Invite
            </Button>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
};

export default InviteUser;
