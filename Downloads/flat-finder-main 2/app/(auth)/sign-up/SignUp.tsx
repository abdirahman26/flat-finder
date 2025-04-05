"use client";
import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
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
import { Check } from "lucide-react";
import StyledDropdown from "@/components/StyledDropdown";
import { signUpFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState(0);
  const [checked, setChecked] = useState(false);

  const form = useForm();
  const router = useRouter();

  const handleSignUp = async () => {
    const { data, error } = await signUpFunc(
      email,
      password,
      idNumber,
      name,
      role
    );

    if (error) {
      console.log(error);
    } else {
      router.replace("/consultant");
      console.log(data);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="space-y-4"
          >
            <div className="space-y-4">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StyledInput
                        placeholder="First Name"
                        validationProps={field}
                        type="text"
                        onInput={(e) => {
                          // @ts-ignore
                          setName(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StyledInput
                        placeholder="ID Number"
                        validationProps={field}
                        type="text"
                        onInput={(e) => {
                          // @ts-ignore
                          setIdNumber(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StyledDropdown
                        options={["Consultant", "Landlord"]}
                        selected={role}
                        onChange={(value) => {
                          setRole(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm mt-1" />
                  </FormItem>
                )}
              />

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

              {/* checkbox */}
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center bg-white/5 cursor-pointer">
                  <input
                    required
                    checked={checked}
                    onChange={(e) => {
                      setChecked(!checked);
                    }}
                    type="checkbox"
                    className="opacity-0 absolute h-5 w-5 cursor-pointer"
                  />
                  {checked && <Check className="h-4 w-4 text-custom-lime" />}
                </div>

                <label className="text-sm text-white/80 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-custom-lime hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-custom-lime hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <StyledButton
              label="Create Account"
              additionalProps={{
                type: "submit",
              }}
            />
          </form>
        </Form>

        <div className="flex flex-col items-center mt-8 animate-fade-in">
          <p className="text-white/80">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-custom-lime hover:underline hover:brightness-110 transition-all duration-300"
            >
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-12 flex justify-center items-center gap-4 text-sm text-white/60 animate-fade-in">
          <a className="text-lime hover:underline hover:brightness-110 transition-all duration-300">
            Terms of Use
          </a>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <a className="text-lime hover:underline hover:brightness-110 transition-all duration-300">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
