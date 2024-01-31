"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      return axios.post("/api/login", formData);
    },

    onError(error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
      if (error.response?.data && typeof error.response.data === "string") {
        toast.error(error.response.data);
      } else {
        toast.error(
          "Login is currently not available, please try again later :)",
        );
      }
    },

    onSuccess: () => {
      router.refresh();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </div>
        <Button type="submit" disabled={mutation.isLoading} className="w-full">
          {mutation.isLoading ? "Loading..." : "Log in"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
