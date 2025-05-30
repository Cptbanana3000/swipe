// swipe/packages/client/src/lib/schemas/auth.schemas.ts
import { z } from "zod";
import type { UserRole } from "@swipe/shared"; // If role was part of registration schema

export const registerFormSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long." }) // Corrected min length message
    .max(20, { message: "Username cannot be longer than 20 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long." }),
  // Role is typically handled separately from form data, passed via query param or state
  // If you were to include it in this form's Zod schema, it would be:
  // role: z.enum(['freelancer', 'client'], { required_error: "Role is required." }),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;