import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from "../components/ui/label";
import { registerFormSchema, type RegisterFormValues } from '../lib/schemas/auth.schemas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import type { UserRole } from '@swipe/shared';

const RegisterPage = () => {
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // For reading URL query params
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
    const form = useForm<RegisterFormValues>({ // RegisterFormValues is now imported
      resolver: zodResolver(registerFormSchema), // registerFormSchema is now imported
      defaultValues: {
        username: "",
        email: "",
        password: "",
        
      },
    });

    useEffect(() => {
        const roleFromQuery = searchParams.get('role') as UserRole;
        if (roleFromQuery && (roleFromQuery === 'freelancer' || roleFromQuery === 'client')) {
          setSelectedRole(roleFromQuery);
          console.log("Selected role:", roleFromQuery);
        } else {
          // Optional: Redirect to homepage or show role selection if no role is passed
          console.warn("No valid role specified in URL, defaulting or consider redirecting.");
          // navigate('/'); // Example redirect
        }
      }, [searchParams, navigate]);
    
      const onSubmit = async (values: RegisterFormValues) => {
        if (!selectedRole) {
          setApiError("Please select a role first (e.g., by starting from the homepage).");
          return;
        }
        setIsLoading(true);
        setApiError(null);
    
        try {
          const response = await fetch('http://localhost:3002/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...values, role: selectedRole }), // <-- ADD ROLE HERE
          });
    
          const responseData = await response.json();
          if (!response.ok) {
            throw new Error(responseData.message || 'Failed to register');
          }
    
          console.log('Registration successful:', responseData);
          navigate('/login?status=registration_success');
    
        } catch (err: any) {
          console.error('Registration error:', err);
          setApiError(err.message || 'An unknown error occurred during registration.');
        } finally {
          setIsLoading(false);
        }
      };
    

  return (
    <div className="container mx-auto min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 
  px-4 md:px-8 py-0 
  border-t border-b border-gray-300 rounded-lg">
      {/* Left Column (Inspirational Content) */}
      <div className="w-full md:w-1/2 lg:w-2/5 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          "The journey of a thousand miles begins with a single step."
        </h1>
        <p className="text-lg text-muted-foreground mb-8">- Lao Tzu</p>
        
        {/* You can decide what this button does later */}
        
      </div>

      {/* Right Column (Registration Form) */}
      <div className="w-full md:w-1/2 lg:w-2/5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Or <Link to="/login" className="text-primary hover:underline font-medium">sign in</Link> if you already have an account.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Form {...form}> {/* Spread the form methods */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username Field (You already did this one perfectly!) */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} disabled={isLoading} />
                      </FormControl>
                      {/* <FormDescription>This will be your public display name.</FormDescription> */}
                      <FormMessage /> {/* Displays validation errors for 'username' */}
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage /> {/* Displays validation errors for 'email' */}
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a strong password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage /> {/* Displays validation errors for 'password' */}
                    </FormItem>
                  )}
                />
                
                {apiError && <p className="text-sm text-destructive pt-2">{apiError}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground text-center block">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-primary">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;