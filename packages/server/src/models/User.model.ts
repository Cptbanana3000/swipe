// swipe/packages/server/src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { UserProfile } from '@swipe/shared'; // Import your shared interface

// We'll create an interface that extends both Mongoose's Document and your UserProfile
// This gives you Mongoose document methods (like .save()) and strong typing from your shared interface.
export interface IUserProfileDocument extends Omit<UserProfile, 'id'>, Document {
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

UserProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id; // remove _id
    delete ret.__v; // remove __v
  },
});


// Create and export the Mongoose model
const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);

export default UserProfileModel;