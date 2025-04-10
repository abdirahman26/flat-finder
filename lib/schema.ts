import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, {
    message: "First name must be at least 2 characters long.",
  })    
  .regex(/^[A-Za-z]+$/, {
    message: "Name must contain only letters.",
  }), 
  idNumber: z
    .coerce
    .number({
      invalid_type_error: "ID Number must be a number.",
      required_error: "ID Number is required.",
    })
    .int({ message: "ID Number must be a whole number." })
    .gte(1000, { message: "ID Number must be exactly 4 digits." })
    .lte(9999, { message: "ID Number must be exactly 4 digits." }),
  email: z.string().trim().email({
    message: "Please enter a valid email address.",
  }),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters long." })
    .superRefine((password, ctx) => {
        const containsUppercase = /[A-Z]/;
        const containsLowercase = /[a-z]/;
        const containsSpecialChar = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
        const containsNumber = /\d/;
      
        if (
          !containsUppercase.test(password) ||
          !containsLowercase.test(password) ||
          !containsSpecialChar.test(password) ||
          !containsNumber.test(password)
        ) {
          ctx.addIssue({
            code: "custom",
            message:
              "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
          });
        }
      })
      ,

    role: z.enum(["Consultant", "Landlord"], {
        errorMap: (issue) => {
          if (issue.code === 'invalid_enum_value') {
            return {
              message: "Please select a valid role.",
            };
          }
          return { message: "No role selected." };
        },
      }),
      mobile_number: z
      .coerce
      .number({
        invalid_type_error: "Mobile number must be a number.",
        required_error: "Mobile number is required.",
      })
      .int({ message: "Mobile number must be a whole number." })
      .refine((num) => num.toString().length === 10, {
        message: "Mobile number must be exactly 10 digits long.",
      }),

  
});


export const signInSchema = z.object({
    email: z.string().trim().email({
        message: "Please enter a valid email address.",
      }),

      password: z
      .string()
      .trim()
      .min(6, { message: "Password must be at least 6 characters long." })
      .superRefine((password, ctx) => {
          const containsUppercase = /[A-Z]/;
          const containsLowercase = /[a-z]/;
          const containsSpecialChar = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
          const containsNumber = /\d/;
        
          if (
            !containsUppercase.test(password) ||
            !containsLowercase.test(password) ||
            !containsSpecialChar.test(password) ||
            !containsNumber.test(password)
          ) {
            ctx.addIssue({
              code: "custom",
              message:
                "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
            });
          }
        })
        ,
})


