import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import GoogleAction from "@/components/GoogleActions";
import Seperator from "@/components/Sperator";
import StyledInput from "@/components/StyledInput";
import StyledButton from "@/components/StyledButton";

const Login = () => {
  const form = useForm();

  const handleLogin = () => {
    console.log("Logging in...");
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

        <GoogleAction
          handleClick={() => handleLogin()}
          text="Sign in with Google"
        />
        <Seperator>Or</Seperator>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      placeholder="Email"
                      validationProps={field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StyledInput
                      placeholder="Password"
                      validationProps={field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
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

export default Login;
