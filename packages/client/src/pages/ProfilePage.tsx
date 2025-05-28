// swipe/packages/client/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from '@swipe/shared'; // Your shared type
import { getMyProfile } from '@/services/userService'; // Adjust path as needed

const ProfilePage = () => {
  const { user: authUser, logout, isAuthenticated, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && token) {
        try {
          setIsLoading(true);
          setError(null);
          const data = await getMyProfile();
          setProfile(data);
        } catch (err: any) {
          console.error("Failed to fetch profile:", err);
          setError(err.message || "Could not load your profile.");
          if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('unauthorized')) {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError("You are not authenticated. Please login.");
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, logout]);

  if (isLoading) {
    return <div className="text-center p-10">Loading your profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-10">Could not load profile. Are you logged in?</div>;
  }

  // This is the single, correct return statement for the component's JSX
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row justify-between items-center"> {/* Flex for title and button */}
          <div>
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription>Welcome back, {profile.username}!</CardDescription>
          </div>
          <Button asChild>
            <Link to="/profile/edit">Edit Profile</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>First Name:</strong> {profile.firstName || 'Not set'}</p>
          <p><strong>Last Name:</strong> {profile.lastName || 'Not set'}</p>
          <p><strong>Headline:</strong> {profile.headline || 'Not set'}</p>
          <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
          <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'Not set'}</p>
          <p><strong>Availability:</strong> {profile.availability || 'Not set'}</p>
          <p><strong>Hourly Rate:</strong> {profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not set'}</p>
          <p><strong>Verified Freelancer:</strong> {profile.isVerifiedFreelancer ? 'Yes' : 'No'}</p>
          {/* Display social links if they exist */}
          {profile.socialLinks && (
            <div className="pt-2">
                <p className="font-semibold">Social Links:</p>
                {profile.socialLinks.linkedin && <p className="ml-4">LinkedIn: {profile.socialLinks.linkedin}</p>}
                {profile.socialLinks.github && <p className="ml-4">GitHub: {profile.socialLinks.github}</p>}
                {profile.socialLinks.website && <p className="ml-4">Website: {profile.socialLinks.website}</p>}
            </div>
          )}
          {/* Display portfolio links if they exist */}
           {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
            <div className="pt-2">
                <p className="font-semibold">Portfolio Links:</p>
                <ul className="list-disc ml-8">
                    {profile.portfolioLinks.map((link, index) => (
                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link}</a></li>
                    ))}
                </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={logout} variant="destructive">Logout</Button> {/* Changed variant for logout */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;