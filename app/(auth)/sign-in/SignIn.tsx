"use client";
import React, { useState } from "react";
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
import { signInFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/utils/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Prevents multiple submissions

  const form = useForm();
  const router = useRouter();

  const handleLogin = async () => {
    try{
    setLoading(true);

    const { data, error } = await signInFunc(email, password);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }
  
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data?.user);
    console.log(data?.session)
    if(data?.user){
      console.log("User exists");
    } else {
      console.log("User does not exist");
    }
    router.refresh();
    router.push('/consultant');


    // case switch for roles: admin, consultant and landlord
    // switch (data?.user?.role) {
    //   case "Admin":
    //     router.push("/admin");
    //     break;
    //   case "Consultant":
    //     router.push("/consultant");
    //     break;
    //   case "Landlord":
    //     router.push("/landlord");
    //     break;
    //   default:
    //     router.push("/sign-in");

  } catch (error) {
    console.error("Login error:", error);
  } finally {
    setLoading(false);
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
                      onInput={(e) => {
                        // @ts-ignore
                        setEmail(e.target.value);
                      }}
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
                      onInput={(e) => {
                        // @ts-ignore
                        setPassword(e.target.value);
                      }}
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
