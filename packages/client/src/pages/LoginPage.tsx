// swipe/packages/client/src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // For form handling
import { zodResolver } from '@hookform/resolvers/zod'; // For Zod validation
import { jwtDecode } from 'jwt-decode'; // For decoding JWT
import type { UserRole } from '@swipe/shared';

// Import your Zod schema and inferred type
import { loginFormSchema, type LoginFormValues } from '../lib/schemas/auth.schemas'; 
// Assuming auth.schemas.ts is in ../lib/schemas/

// Import shadcn/ui components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

// Import AuthContext
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// Define an interface for the expected JWT payload structure
interface DecodedToken {
  user: {
    id: string;
    username: string;
    role: UserRole;
    profileSetupComplete: boolean;
  };
  iat: number;
  exp: number;
}

const LoginPage = () => {
  const [apiError, setApiError] = useState<string | null>(null); // For errors from API
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button loading state
  
  const authContext = useAuth();
  const navigate = useNavigate();

  // 1. Set up React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define your submit handler
  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values), // Send validated form values
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to login');
      }

      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
        const decodedToken = jwtDecode<DecodedToken>(responseData.token);
        authContext.login(responseData.token, decodedToken.user);
        
        console.log('Login successful, token stored, auth context updated.');
       // NEW NAVIGATION LOGIC
    if (decodedToken.user.profileSetupComplete) {
        // Navigate to role-specific dashboard or main profile view
        if (decodedToken.user.role === 'freelancer') {
          navigate('/profile'); // Or /freelancer-dashboard
        } else if (decodedToken.user.role === 'client') {
          navigate('/client-dashboard'); // Or /client-profile (you'll create this)
        } else {
          navigate('/profile'); // Fallback
        }
      } else {
        // Profile setup is not complete, navigate to edit profile page
        toast.info("Let's complete your profile setup!");
        navigate('/profile/edit'); 
      }
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setApiError(err.message || 'An unknown error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-8">
      {/* Left Column (Inspirational Content) */}
      <div className="w-full md:w-1/2 lg:w-2/5 text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          "Welcome back! Your next great match awaits."
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
            {/* 3. Use the Form component from shadcn/ui */}
            <Form {...form}> {/* Spread the form methods */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage /> {/* Displays Zod validation errors for email */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage /> {/* Displays Zod validation errors for password */}
                    </FormItem>
                  )}
                />
                {apiError && <p className="text-sm font-medium text-destructive">{apiError}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
              </form>
            </Form>
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