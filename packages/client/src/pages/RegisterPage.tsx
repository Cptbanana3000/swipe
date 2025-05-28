import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic client-side validation (add more as needed)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      console.log('Registration successful:', data);
      // Redirect to login page with a success message/state
      navigate('/login?status=registration_success');

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unknown error occurred during registration.');
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive pt-2">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
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