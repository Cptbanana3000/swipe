// swipe/packages/client/src/lib/schemas/auth.schemas.ts
import { z } from "zod";

export const registerFormSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 6 characters long." })
    .max(20, { message: "Username cannot be longer than 20 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long." }),
  // If you add confirmPassword later:
  // confirmPassword: z.string().min(6, { message: "Please confirm your password." })
});
// .refine((data) => data.password === data.confirmPassword, { // Example for confirmPassword
//   message: "Passwords don't match",
//   path: ["confirmPassword"], // Path of error
// });


export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// You can add your loginFormSchema here later too!
export const loginFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }), // Basic check, backend does the real auth
  });
export type LoginFormValues = z.infer<typeof loginFormSchema>;
// export type LoginFormValues = z.infer<typeof loginFormSchema>;