// swipe/packages/shared/src/types/user.types.ts
export interface User {
    id: string;
    username: string;
    email: string;
    isVerifiedFreelancer: boolean;
    createdAt: Date;
  }
  
  export interface UserProfile extends User { // Example of extending an interface
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  portfolioLinks?: string[];
  // Freelancer specific (optional for now)
  hourlyRate?: number;
  availability?: string;
  // Client specific (optional for now)
  companyName?: string;
  companyWebsite?: string;
  // Add other social links if needed, e.g., as an object
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string; // Personal portfolio or company site
  }
  }