"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

type EmailPassFieldsProps = {
  login: boolean;
};

const EmailPassFields = ({ login }: EmailPassFieldsProps) => {
  const formSchema = z
    .object({
      email: z.string().email({ message: "Please enter a valid email" }),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .refine(
          (value) => /\d/.test(value),
          "Password must contain at least one number",
        ),
      confirmPassword: z.string().optional(),
    })
    .refine((data) => (login ? true : data.password === data.confirmPassword), {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(!login && { confirmPassword: "" }),
    },
  });
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const actionURL = login ? "/api/login" : "/api/signup";
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    const response = await fetch(actionURL, {
      method: "POST",
      body: formData,
      redirect: "manual",
    });
    if (response.status === 0) {
      // redirected
      // when using `redirect: "manual"`, response status 0 is returned
      return router.refresh();
    }
    const resJson = (await response.json()) as Record<string, string>;
    form.setError("root", {
      message: resJson.error ?? "Something went wrong!",
    });
  };
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {form.formState.errors.root && (
          <FormMessage className="text-center">
            {form.formState.errors.root.message}
          </FormMessage>
        )}
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
        {!login && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button className="w-full" type="submit">
          {login ? "Log in" : "Create my account"}
        </Button>
      </form>
    </Form>
  );
};

export default EmailPassFields;
