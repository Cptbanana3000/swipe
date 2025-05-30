// swipe/packages/server/src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { UserProfile, Project, UserRole } from '@swipe/shared'; // Import Project and UserRole

// Interface for the Project subdocument (used within UserProfile)
// It extends your shared Project interface and Mongoose's Document (for _id, etc.)
export interface IProjectSubdocument extends Omit<Project, '_id'>, Document {}

// Main UserProfile Document Interface
// It extends your shared UserProfile (which includes 'role', 'profileSetupComplete', and now 'projects')
// and Mongoose's Document. We also add the server-side 'password'.
// We use Omit to prevent 'id' from UserProfile conflicting with Mongoose's '_id' handling before virtuals.
export interface IUserProfileDocument extends Omit<UserProfile, 'id' | 'projects'>, Document {
  password?: string; // Password hash is stored in DB, not in shared UserProfile for API responses
  projects?: mongoose.Types.DocumentArray<IProjectSubdocument>; // Correctly typed array of Project subdocuments
  // 'role' and 'profileSetupComplete' are inherited from the UserProfile shared type
}

// Schema for the Project subdocument
const ProjectSchema: Schema<IProjectSubdocument> = new Schema({
  title: { type: String, required: true, trim: true },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  technologies: { type: [String], default: [] },
  projectUrl: { type: String, trim: true },
  repositoryUrl: { type: String, trim: true },
}, { 
  _id: true, // Mongoose adds _id to subdocuments by default. Explicitly true.
  // timestamps: true, // You can add timestamps to sub-projects if needed
});

// Main UserProfile Schema
const UserProfileSchema: Schema<IUserProfileDocument> = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }, // minlength was in your registration logic
    role: { type: String, enum: ['freelancer', 'client'] as UserRole[], required: true }, // Use UserRole[] for enum typing
    
    // Fields from shared UserProfile
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    profilePictureUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true },
    bio: { type: String, trim: true },
    skills: { type: [String], default: [] },
    
    projects: { // Structured projects array
      type: [ProjectSchema],
      default: [],
      validate: [
        (val: any[]) => val.length <= 3, // Validator to limit to 3 projects
        '{PATH} exceeds the limit of 3 projects'
      ]
    },
    // portfolioLinks: { type: [String], default: [] }, // REMOVE this if 'projects' replaces it

    experienceLevel: { type: String, trim: true },
    hourlyRate: { type: Number },
    availability: { type: String, trim: true },
    companyName: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    isVerifiedFreelancer: { type: Boolean, default: false }, // From shared User type
    ProfileSetupComplete: { type: Boolean, default: false }, // From shared UserProfile type
  },
  {
    timestamps: true, // Adds createdAt and updatedAt to the UserProfile document
  }
);

// Virtual for 'id' (transforms _id to id)
UserProfileSchema.virtual('id').get(function(this: IUserProfileDocument) {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

// Optional: Virtual for 'fullName'
UserProfileSchema.virtual('fullName').get(function(this: IUserProfileDocument) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  // ... (rest of your fullName logic) ...
  return '';
});

// toJSON transform to clean up API output
UserProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    // Transform subdocument _id to id if needed for projects
    if (ret.projects) {
      ret.projects = ret.projects.map((project: any) => {
        if (project._id) {
          project.id = project._id.toString(); // Add 'id' field
          delete project._id; // Remove '_id'
        }
        delete project.__v;
        return project;
      });
    }
  },
});

const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);

export default UserProfileModel;