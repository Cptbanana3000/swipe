// swipe/packages/server/src/server.ts
import express, { Request, Response, Application, RequestHandler } from 'express';
import dotenv from 'dotenv';
// Remove mock UserProfile import if it's no longer directly used here for mock data
// import { UserProfile } from '@swipe/shared'; // Keep if UserProfile is used for req.body typing, or use IUserProfileDocument
import connectDB from './config/db';
import cors from 'cors';
import UserProfileModel, { IUserProfileDocument } from './models/User.model';



dotenv.config()
connectDB();


const app: Application = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json()); // Make sure this middleware is here to parse JSON request bodies

// --- NEW: POST Route to Create a User ---
app.post('/api/users', (async (req: Request, res: Response) => {
  try {
    // We expect the request body to match the structure of UserProfile from @swipe/shared
    // For stricter typing, you could use Pick<UserProfile, 'username' | 'email' | ... other required fields>
    const { username, email, isVerifiedFreelancer, bio, skills, portfolioLinks } = req.body;

    // Basic validation (you'll want more robust validation later)
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Check if user already exists (optional, but good practice)
    const existingUser = await UserProfileModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    const newUser: IUserProfileDocument = new UserProfileModel({
      username,
      email,
      isVerifiedFreelancer,
      bio,
      skills,
      portfolioLinks,
      // createdAt will be added by timestamps:true in your schema
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // Send back the created user
  } catch (error) {
    console.error('Error creating user:', error);
    // Check if it's a Mongoose validation error or duplicate key error
    if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    if (error instanceof Error && (error as any).code === 11000) { // MongoDB duplicate key error
        return res.status(409).json({ message: 'Duplicate key error (e.g., username or email already exists)'});
    }
    res.status(500).json({ message: 'Server error while creating user' });
  }
}) as RequestHandler);

// --- MODIFIED: GET Route to Fetch All Users ---
app.get('/api/users', (async (req: Request, res: Response) => {
  try {
    const users = await UserProfileModel.find(); // Fetches all documents from the UserProfile collection
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}) as RequestHandler);

// Your existing hello route
app.get('/api/hello', ((req: Request, res: Response) => {
  res.json({ message: 'Server says hello! Your setup is working! 🙌' });
}) as RequestHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is live and listening on http://localhost:${PORT}`);
});