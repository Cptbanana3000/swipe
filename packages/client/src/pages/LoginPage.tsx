// swipe/packages/client/src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Define an interface for the expected JWT payload structure
// This should match what you put in the payload on the server
interface DecodedToken {
    user: {
      id: string;
      username: string;
      // Add other fields if they are in your JWT user payload
    };
    iat: number; // Issued at
    exp: number; // Expires at
  }

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authContext = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const response = await fetch('http://localhost:3002/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || 'Failed to login');
        }
  
        if (data.token) {
          // Store the token (as before)
          localStorage.setItem('authToken', data.token);
          
          // Decode the token to get user data for the context
          // The 'user' object inside the decoded token should match AuthUser in AuthContext
          const decodedToken = jwtDecode<DecodedToken>(data.token); 
          
          // Call the login function from AuthContext
          authContext.login(data.token, decodedToken.user); 
          
          console.log('Login successful, token stored, auth context updated.');
          navigate('/profile'); 
        } else {
          throw new Error('No token received');
        }
  
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'An unknown error occurred during login.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="container mx-auto min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-8">
      {/* Left Column (Inspirational Content) */}
      <div className="w-full md:w-1/2 lg:w-2/5 text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          "Welcome back! Your next great match awaits." 
          {/* Or choose another quote! */}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">- swipe</p>
        
        <p className="text-muted-foreground">
          Ready to find your next opportunity or talent? Let's get you signed in.
        </p>
      </div>

      {/* Right Column (Login Form) */}
      <div className="w-full md:w-1/2 lg:w-2/5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Login to Your Account</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive pt-2">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging In...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground text-center block">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
export default LoginPage;