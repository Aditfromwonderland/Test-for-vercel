import { z } from "zod";

/**
 * Schema for the user input form data
 */
export const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .trim(),
  
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .trim(),
  
  workExperience: z.string()
    .min(10, { message: "Please provide at least 10 characters about your work experience" })
    .trim(),
  
  industryExperience: z.string()
    .min(5, { message: "Please provide at least 5 characters about your industry experience" })
    .trim(),
  
  motivation: z.string()
    .min(10, { message: "Please share at least 10 characters about your motivation" })
    .trim(),
  
  networkingChallenge: z.string()
    .min(10, { message: "Please describe your networking challenge in at least 10 characters" })
    .trim(),
});

/**
 * TypeScript type derived from the form schema
 */
export type FormData = z.infer<typeof formSchema>;
