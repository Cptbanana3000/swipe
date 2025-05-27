// swipe/packages/shared/src/types/user.types.ts
export interface User {
    id: string;
    username: string;
    email: string;
    isVerifiedFreelancer: boolean;
    createdAt: Date;
  }
  
  export interface UserProfile extends User { // Example of extending an interface
    bio?: string;
    skills?: string[];
    portfolioLinks?: string[];
  }