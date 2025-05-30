// swipe/packages/client/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, UserRole } from '@swipe/shared'; // Assuming your shared UserProfile type

// Define the shape of your user object (you might want to refine this)
// For now, let's assume the decoded JWT payload gives us id and username.
// The full profile will be fetched separately.
interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  profileSetupComplete: boolean;
  // Add other fields you get directly from the JWT payload if any
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null; // User data from the JWT payload
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial loading of token from localStorage
  login: (newToken: string, userData: AuthUser) => void;
  logout: () => void;
  markProfileSetupComplete: () => void; 
  // We might add a function to fetch and set the full UserProfile later
}

// Create the context with a default undefined value (or a sensible default)
// We use '!' because the AuthProvider will always provide a value.
const AuthContext = createContext<AuthContextType>(null!);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // Try to load token from localStorage on initial app load
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        // In a real app, you'd verify the token's expiry here
        // and decode it to get user data.
        // For simplicity now, if a token exists, we'll assume it's valid
        // and we'd typically decode it to get basic user info.
        // Let's simulate decoding for now if we had stored user info alongside token,
        // or we'd make an API call to /api/profile/me to validate token & get user.

        // For now, if token exists, we need to get user data.
        // A better approach: after getting token, call /api/profile/me to validate
        // and get user details. Let's placeholder that.
        // For this step, if token exists, we'll set it. User data will be set upon login.
        setToken(storedToken);
        // setUser(decodedUserFromToken); // This part would come from decoding the token
      } catch (error) {
        console.error("Error processing stored token", error);
        localStorage.removeItem('authToken'); // Clear invalid token
      }
    }
    setIsLoading(false); // Done checking localStorage
  }, []);

  const login = (newToken: string, userDataFromToken: AuthUser) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(userDataFromToken); // User data obtained after successful login (from JWT payload)
    console.log("AuthContext: Logged in, user set:", userDataFromToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    // Optionally: navigate to login page or homepage
    // navigate('/login'); // You'd get navigate from useNavigate() if this was a component using router
    console.log("AuthContext: Logged out");
  };

  const markProfileSetupComplete = () => {
    setUser(prevUser => prevUser ? ({ ...prevUser, profileSetupComplete: true }) : null);
  };

  return (
    <AuthContext.Provider value={{ 
        token, 
        user, 
        isAuthenticated: !!token, // True if token exists
        isLoading, 
        login, 
        logout,
        markProfileSetupComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // Added null check
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};