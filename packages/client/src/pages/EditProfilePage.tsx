// swipe/packages/client/src/pages/EditProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // We'll use 'token' from here
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from '@swipe/shared';
import { getMyProfile, updateMyProfile } from '@/services/userService'; // Make sure path is correct
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define experience level options
const experienceLevels = [
    "Entry-Level (0-1 year)",
    "Junior (1-3 years)",
    "Mid-Level (3-5 years)",
    "Senior (5+ years)",
    "Expert (10+ years)"
  ];

const EditProfilePage = () => {
  const { token } = useAuth(); // Get token to ensure user is logged in before fetching
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    skills: [],
    portfolioLinks: [],
    hourlyRate: undefined, // Or 0 if you prefer a number default
    availability: '',
    companyName: '',
    companyWebsite: '',
    socialLinks: { linkedin: '', github: '', website: ''},
    experienceLevel: '',
    // profilePictureUrl is not handled in this basic form for simplicity
  });
  const [isLoading, setIsLoading] = useState(true); // For initial data load
  const [isSaving, setIsSaving] = useState(false);  // For form submission
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) { // Only fetch if token exists (user is likely logged in)
        try {
          setIsLoading(true);
          const currentProfile = await getMyProfile();
          setFormData({
            firstName: currentProfile.firstName || '',
            lastName: currentProfile.lastName || '',
            headline: currentProfile.headline || '',
            bio: currentProfile.bio || '',
            skills: currentProfile.skills || [],
            portfolioLinks: currentProfile.portfolioLinks || [],
            hourlyRate: currentProfile.hourlyRate,
            availability: currentProfile.availability || '',
            companyName: currentProfile.companyName || '',
            companyWebsite: currentProfile.companyWebsite || '',
            socialLinks: currentProfile.socialLinks || { linkedin: '', github: '', website: ''},
            experienceLevel: currentProfile.experienceLevel || '',
          });
          setError(null);
        } catch (err: any) {
          console.error("EditProfilePage: Failed to load profile data.", err);
          setError(err.message || "Failed to load your profile data for editing.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Should be handled by ProtectedRoute, but good to have a fallback
        setError("Not authenticated. Cannot load profile for editing.");
        setIsLoading(false);
        // navigate('/login'); // Or redirect
      }
    };
    loadProfile();
  }, [token]); // Re-run if token changes (e.g., on login/logout, though ProtectedRoute handles access)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle nested socialLinks
    if (name.startsWith("socialLinks.")) {
        const socialKey = name.split(".")[1] as keyof UserProfile['socialLinks'];
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [socialKey]: value
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }));
  };

  const handlePortfolioLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, portfolioLinks: e.target.value.split(',').map(s => s.trim()).filter(s => s) }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      // Filter out empty strings for optional fields if backend expects them to be absent or null
      const dataToSubmit: Partial<UserProfile> = { ...formData };
      if (typeof dataToSubmit.hourlyRate === 'string' && dataToSubmit.hourlyRate === '') {
        dataToSubmit.hourlyRate = undefined;
      }

      await updateMyProfile(dataToSubmit);
      // TODO: Consider updating AuthContext user if it stores full profile,
      // or rely on ProfilePage re-fetching.
      toast.success('Profile updated successfully');

      setTimeout(() => {
        navigate('/profile'); // Navigate back to view profile
      }, 1500);
    } catch (err: any) {
      console.error("EditProfilePage: Failed to update profile.", err);
      toast.error('Failed to update profile.');
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading your profile for editing...</div>;
  if (error && !formData.firstName) return <div className="text-center p-10 text-destructive">Error: {error}</div>; // Show main error if profile couldn't load

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Edit Your Profile</CardTitle>
          <CardDescription>Keep your information up to date.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} disabled={isSaving} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input name="headline" id="headline" placeholder="e.g., Passionate React Developer" value={formData.headline} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea name="bio" id="bio" placeholder="Tell us a bit about yourself..." value={formData.bio} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input name="skills" id="skills" placeholder="e.g., React, Node.js, Figma" value={formData.skills?.join(', ') || ''} onChange={handleSkillsChange} disabled={isSaving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolioLinks">Portfolio Links (comma-separated URLs)</Label>
              <Input name="portfolioLinks" id="portfolioLinks" placeholder="e.g., https://github.com/you, https://yourportfolio.com" value={formData.portfolioLinks?.join(', ') || ''} onChange={handlePortfolioLinksChange} disabled={isSaving} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                    <Input name="hourlyRate" id="hourlyRate" type="number" placeholder="e.g., 25" value={formData.hourlyRate || ''} onChange={handleChange} disabled={isSaving} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="availability">Availability</Label>
                    <Input name="availability" id="availability" placeholder="e.g., Full-time, Part-time (20hrs/week)" value={formData.availability} onChange={handleChange} disabled={isSaving} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Input name="experienceLevel" id="experienceLevel" placeholder="e.g., Entry, Mid, Senior" value={formData.experienceLevel} onChange={handleChange} disabled={isSaving} />
                </div>
            </div>
            {/* Add more fields like companyName, companyWebsite, socialLinks here */}
            <h3 className="text-lg font-medium pt-2">Social Links</h3>
            <div className="space-y-1.5">
                <Label htmlFor="socialLinks.linkedin">LinkedIn Profile URL</Label>
                <Input name="socialLinks.linkedin" id="socialLinks.linkedin" value={formData.socialLinks?.linkedin || ''} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="socialLinks.github">GitHub Profile URL</Label>
                <Input name="socialLinks.github" id="socialLinks.github" value={formData.socialLinks?.github || ''} onChange={handleChange} disabled={isSaving} />
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="socialLinks.website">Personal/Company Website URL</Label>
                <Input name="socialLinks.website" id="socialLinks.website" value={formData.socialLinks?.website || ''} onChange={handleChange} disabled={isSaving} />
            </div>

            {error && !isLoading && <p className="text-sm text-destructive pt-2">{error}</p>} 
            {/* Show general form error if not loading initial data */}

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePage;