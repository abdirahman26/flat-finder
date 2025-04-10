"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signUpFunc } from "@/app/(auth)/actions";
import { signUpSchema } from "@lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import StyledInput from "@/components/StyledInput";
import StyledButton from "@/components/StyledButton";
import GoogleAction from "@/components/GoogleActions";
import Seperator from "@/components/Seperator";
import { z } from "zod";
import { StyledDropdown } from "@/components/StyledDropdown";

export type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      idNumber: "" as unknown as number,
      email: "",
      password: "",
      role: "" as unknown as "Consultant" | "Landlord",
      mobile_number: "" as unknown as number,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<SignUpFormData> = async (
    data: SignUpFormData
  ) => {
    const { name, idNumber, email, password, role, mobile_number } = data;

    const { error } = await signUpFunc(
      email,
      password,
      idNumber,
      name,
      role,
      mobile_number
    );

    if (error) {
      console.log(error);
    } else {
      router.replace("/sign-up");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel max-w-md w-full p-8 md:p-10 shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <p className="text-white/80 mb-1 text-lg font-light">
            Get started today with
          </p>
          <h1 className="text-custom-lime text-4xl font-bold">FlatFinder</h1>
        </div>

        <GoogleAction
          handleClick={() => console.log("Google Sign Up")}
          text="Sign up with Google"
        />
        <Seperator>Or</Seperator>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      {...register("name")}
                      placeholder="First Name"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage>{errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="idNumber"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      {...register("idNumber")}
                      placeholder="ID Number"
                      type="string"
                    />
                  </FormControl>
                  <FormMessage>{errors.idNumber?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="role"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledDropdown
                      options={["Consultant", "Landlord"]}
                      selected={form.watch("role") || ""}
                      onChange={(value) => {
                        form.setValue("role", value, { shouldValidate: true });
                      }}
                    />
                  </FormControl>
                  <FormMessage>{errors.role?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="mobile_number"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      {...register("mobile_number")}
                      placeholder="Mobile Number"
                      type="string"
                    />
                  </FormControl>
                  <FormMessage>{errors.mobile_number?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="email"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      {...register("email")}
                      placeholder="Email"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage>{errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      {...register("password")}
                      placeholder="Password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage>{errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />

            <StyledButton
              label="Create Account"
              additionalProps={{ type: "submit" }}
            />
          </form>
        </Form>

        <div className="flex flex-col items-center mt-8 animate-fade-in">
          <p className="text-white/80">
            Already have an account?{" "}
            <a href="/sign-in" className="text-custom-lime hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
