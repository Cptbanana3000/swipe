// swipe/packages/server/src/server.ts
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import cors from 'cors';
import express, { Request, Response, Application, RequestHandler } from 'express';
import bcrypt from 'bcryptjs'; // <-- IMPORT BCRYPTJS
import connectDB from './config/db';
import UserProfileModel, { IUserProfileDocument } from './models/User.model';
import authMiddleware from './middleware/auth.middleware';
import { UserProfile } from '@swipe/shared';
// ... (any other imports)

connectDB();

const app: Application = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors()); // Make sure CORS is still here if you added it

// --- MODIFIED: POST Route for User Registration ---
// Consider renaming the route from /api/users to /api/auth/register
app.post('/api/auth/register', (async (req: Request, res: Response) => { // Renamed route
  try {
    const { username, email, password, isVerifiedFreelancer, bio, skills, portfolioLinks } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    if (password.length < 6) { // Match minlength in schema if you set it
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await UserProfileModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt (10 rounds is generally good)
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUserProfileDocument = new UserProfileModel({
      username,
      email,
      password: hashedPassword, // <-- STORE THE HASHED PASSWORD
      isVerifiedFreelancer,
      bio,
      skills,
      portfolioLinks,
    });

    const savedUser = await newUser.save();
    // The toJSON transform in your model will remove the password before sending
    res.status(201).json(savedUser); 
  } catch (error) {
    console.error('Error during registration:', error);
    if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    if (error instanceof Error && (error as any).code === 11000) {
        return res.status(409).json({ message: 'Duplicate key error (username or email likely already exists)'});
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
}) as RequestHandler);

app.post('/api/auth/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserProfileModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (user not found)' });
    }

    // Compare submitted password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password as string); // user.password will be the hash from DB

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (password incorrect)' });
    }

    // User is authenticated, create JWT payload
    const payload = {
      user: {
        id: user.id, // or user._id.toString() if you don't have the virtual 'id'
        username: user.username,
        // You can add more non-sensitive info to the payload if needed
      },
    };

    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];


    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in .env file!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Sign the token
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: jwtExpiresIn },
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send the token back to the client
      }
    );

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}) as RequestHandler);

app.put('/api/profile/me', authMiddleware, (async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Fields that users are allowed to update
    const {
      firstName, 
      lastName,  
      profilePictureUrl,
      location,
      headline,
      bio,
      skills,
      portfolioLinks,
      hourlyRate,
      availability,
      companyName,
      companyWebsite,
      socialLinks
    } = req.body;

    const updatedFields: Partial<UserProfile> = {};
    if (firstName !== undefined) updatedFields.firstName = firstName; // <-- CHANGED
    if (lastName !== undefined) updatedFields.lastName = lastName;   // <-- CHANGED
    if (profilePictureUrl !== undefined) updatedFields.profilePictureUrl = profilePictureUrl;
    if (location !== undefined) updatedFields.location = location;
    if (headline !== undefined) updatedFields.headline = headline;
    if (bio !== undefined) updatedFields.bio = bio;
    if (skills !== undefined) updatedFields.skills = skills;
    if (portfolioLinks !== undefined) updatedFields.portfolioLinks = portfolioLinks;
    if (hourlyRate !== undefined) updatedFields.hourlyRate = hourlyRate;
    if (availability !== undefined) updatedFields.availability = availability;
    if (companyName !== undefined) updatedFields.companyName = companyName;
    if (companyWebsite !== undefined) updatedFields.companyWebsite = companyWebsite;
    if (socialLinks !== undefined) updatedFields.socialLinks = socialLinks;

    const userProfile = await UserProfileModel.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error updating profile', details: error.message });
    }
    res.status(500).json({ message: 'Server error updating profile' });
  }
}) as RequestHandler);


// Your GET /api/users route (should still work, will fetch users but won't show password)
app.get('/api/users', (async (req: Request, res: Response) => {
  try {
    const users = await UserProfileModel.find(); 
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users); // The toJSON transform in the model will remove passwords
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}) as RequestHandler);

app.get('/api/hello', ((req: Request, res: Response) => {
  res.json({ message: 'Server says hello! Your setup is working! 🙌' });
}) as RequestHandler);


app.listen(PORT, () => {
  console.log(`✅ Server is live and listening on http://localhost:${PORT}`);
});