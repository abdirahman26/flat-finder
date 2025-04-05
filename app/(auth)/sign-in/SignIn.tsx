"use client";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import GoogleAction from "@/components/GoogleActions";
import Seperator from "@/components/Seperator";
import StyledInput from "@/components/StyledInput";
import StyledButton from "@/components/StyledButton";
import { signInFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInSchema } from "@/lib/schema";

export type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<SignInFormData> = async (
    data: SignInFormData
  ) => {
    const { email, password } = data;

    const { error } = await signInFunc(email, password);

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
          <p className="text-white/80 mb-1 text-lg font-light">Log in to</p>
          <h1 className="text-custom-lime text-4xl custom-limeont-bold">
            FlatHopper
          </h1>
        </div>

        <GoogleAction handleClick={() => {}} text="Sign in with Google" />
        <Seperator>Or</Seperator>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="cursor-pointer"
              label="Sign In"
              additionalProps={{
                type: "submit",
              }}
            />
          </form>
        </Form>

        <div className="flex flex-col items-center mt-8 space-y-3 animate-fade-in">
          <button className="text-custom-lime hover:underline hover:brightness-110 transition-all duration-300">
            Forgot Password?
          </button>
          <p className="text-white/80">
            Don't have an account?{" "}
            <a
              href="/sign-up"
              className="text-custom-lime hover:underline hover:brightness-110 transition-all duration-300"
            >
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-12 flex justify-center items-center gap-4 text-sm text-white/60 animate-fade-in">
          <a className="text-custom-lime hover:underline hover:brightness-110 transition-all duration-300">
            Terms of Use
          </a>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <a className="text-custom-lime hover:underline hover:brightness-110 transition-all duration-300">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
