// swipe/packages/server/src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { UserProfile} from '@swipe/shared'; // Import your shared interface

// We'll create an interface that extends both Mongoose's Document and your UserProfile
// This gives you Mongoose document methods (like .save()) and strong typing from your shared interface.
export interface IUserProfileDocument extends Omit<UserProfile, 'id'>, Document {
    password?: string;
    role: 'freelancer' | 'client';
  // You can add any instance methods for your Mongoose model here if needed later
  // For example:
  // getFullName(): string;
}

const UserProfileSchema: Schema<IUserProfileDocument> = new Schema(
  {
    // id: String, // MongoDB will automatically create an _id. We can use virtuals later if you want 'id'
    username: {
      type: String,
      required: true,
      unique: true, // Ensures usernames are unique
      trim: true,   // Removes whitespace from both ends
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Stores email in lowercase
      // You might add a match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] for validation
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['freelancer', 'client'],
      required: true,
    },


    isVerifiedFreelancer: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String], // An array of strings
      default: [],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },

    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    profilePictureUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true },
    hourlyRate: { type: Number },
    availability: { type: String, trim: true },
    companyName: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    socialLinks: { // Example for an object
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
    },
   
  
    // createdAt is automatically handled by timestamps: true
  },
  {
    // Automatically add `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);



// Optional: If you want 'id' to be available as a virtual instead of just '_id'
UserProfileSchema.virtual('id').get(function(this: IUserProfileDocument) {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

UserProfileSchema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) {
      return this.firstName;
    }
    if (this.lastName) {
      return this.lastName;
    }
    return ''; // Or undefined, or null
  });

UserProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id; // remove _id
    delete ret.__v; // remove __v
    delete ret.password; // remove password
  },
});


// Create and export the Mongoose model
const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);

export default UserProfileModel;