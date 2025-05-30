// swipe/packages/client/src/lib/schemas/profile.schemas.ts
import { z } from "zod";

// Project schema for individual projects
export const projectFormSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  technologies: z.array(z.string()),
  projectUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  repositoryUrl: z.string().url("Invalid URL").optional().or(z.literal(""))
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Social links schema
const socialLinksSchema = z.object({
  linkedin: z.string().refine(val => !val || val.startsWith('http'), "Please enter a valid URL").optional(),
  github: z.string().refine(val => !val || val.startsWith('http'), "Please enter a valid URL").optional(),
  website: z.string().refine(val => !val || val.startsWith('http'), "Please enter a valid URL").optional()
});

// Main profile form schema with proper defaults
export const editProfileFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  headline: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  projects: z.array(projectFormSchema).max(3, "Maximum of 3 projects allowed"),
  experienceLevel: z.string(),
  hourlyRate: z.number().positive("Hourly rate must be positive").optional(),
  availability: z.string(),
  companyName: z.string(),
  companyWebsite: z.string().url("Invalid website URL").optional().or(z.literal("")),
  socialLinks: socialLinksSchema
});

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

// Updated default values function to match schema
export const createDefaultFormValues = (): EditProfileFormValues => ({
  firstName: '',
  lastName: '',
  headline: '',
  bio: '',
  skills: [],
  projects: [],
  experienceLevel: '',
  hourlyRate: undefined,
  availability: '',
  companyName: '',
  companyWebsite: '',
  socialLinks: {
    linkedin: '',
    github: '',
    website: ''
  }
});