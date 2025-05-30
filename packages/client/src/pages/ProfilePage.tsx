// swipe/packages/client/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // CardDescription not used in new design for these
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Linkedin, Globe } from 'lucide-react';

import type { UserProfile } from '@swipe/shared'; // Assuming this type might eventually support richer portfolioLinks
import { getMyProfile } from '@/services/userService';

const getInitials = (firstName?: string, lastName?: string, username?: string) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return 'U';
};

const ProfilePage = () => {
  const { logout, isAuthenticated, token } = useAuth();
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
    return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Loading your profile...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p className="text-destructive">Error: {error}</p></div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>Could not load profile. Are you logged in?</p></div>;
  }

  const displayName = profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.username;

  // Fallback for portfolio links if they are strings, to attempt to make them a bit more presentable
  // This part is a compromise due to the "don't change functions" constraint.
  // Ideally, portfolioLinks would be an array of objects.
  const formatLinkText = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      let text = parsedUrl.hostname + (parsedUrl.pathname === '/' ? '' : parsedUrl.pathname);
      if (text.length > 50) text = text.substring(0, 47) + '...';
      return text;
    } catch {
      return url; // fallback to full URL if parsing fails
    }
  };


  return (
    <div className="bg-slate-50 py-8 md:py-12"> {/* Overall page background */}
      <div className="container mx-auto px-4 max-w-6xl"> {/* Wider container */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left Sidebar / Profile Header */}
          <div className="w-full md:w-1/3 flex flex-col items-center text-center p-2 md:p-0">
            <Avatar className="w-36 h-36 md:w-40 md:h-40 mb-4 shadow-md"> {/* Slightly larger avatar, no border based on design */}
              <AvatarImage src={profile.profilePictureUrl || undefined} alt={displayName} />
              <AvatarFallback>{getInitials(profile.firstName, profile.lastName, profile.username)}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-800">{displayName}</h1>
            {profile.isVerifiedFreelancer && (
              <Badge variant="default" className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                ✓ Verified
              </Badge>
            )}
            <p className="text-gray-500 text-sm mt-2">{profile.location || 'Location not specified'}</p>
            
            <Button asChild className="mt-6 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-6 rounded-md text-sm w-full sm:w-auto md:w-full">
              <Link to="/profile/edit">Edit Profile</Link>
            </Button>
            
            <div className="mt-8 text-center w-full">
              <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">Connect</h3>
              <div className="flex justify-center space-x-4">
                {profile.socialLinks?.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                    <Linkedin size={22} />
                  </a>
                )}
                {profile.socialLinks?.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <Github size={22} />
                  </a>
                )}
                {profile.socialLinks?.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600">
                    <Globe size={22} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="w-full md:w-2/3 space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-lg"> {/* Main content card style */}
            {profile.headline && (
              <div>
                {/* <h2 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Headline</h2> */}
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{profile.headline}</p>
              </div>
            )}

            {/* Key Information - Not a Card, as per design */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Key Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="font-medium text-gray-700">{profile.email}</p>
                </div>
                {/* Example for Phone (if you add it to UserProfile) */}
                {/* <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="font-medium text-gray-700">{profile.phone || '(123) 456-7890'}</p> 
                </div> */}
                 
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Experience</p>
                  <p className="font-medium text-gray-700">{profile.experienceLevel || '5+ Years'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hourly Rate</p>
                  <p className="font-medium text-gray-700">
                    {profile.hourlyRate ? 
                      <><span className="text-green-600 font-bold">${profile.hourlyRate}</span>/hr</> : 
                      'Not set'}
                  </p>
                </div>
              </div>
            </div>
            
            {profile.skills && profile.skills.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-700">Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {profile.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1 text-xs sm:text-sm font-medium rounded-md hover:bg-slate-200">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {profile.bio && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-700">About Me</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Projects Section - Styling to match design's project card appearance as much as possible */}
            {/* Given constraints, content of each "project" will be limited */}
            {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-700">Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  {profile.portfolioLinks.map((link, index) => (
                    // Each link item styled as a card.
                    // For full design match (title, description, tags), 'link' would need to be an object.
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 group hover:shadow-md transition-shadow duration-150 ease-in-out">
                      {/* The design shows project titles, descriptions, and tags. This cannot be achieved if 'link' is just a URL string. */}
                      {/* We'll display the link URL in a way that implies it's a project. */}
                       {/* Placeholder for structured content if data model changes later */}
                       {typeof link === 'string' && link.startsWith('example:') ? (
                        // This is a speculative part, if you had a way to encode title in the link string
                        // For now, this won't trigger with plain URLs.
                        <>
                          <h3 className="font-semibold text-md text-gray-800 mb-1">{link.split(':')[1]}</h3>
                           {/* <p className="text-xs text-gray-500 mb-2">Description would go here...</p>
                           <div className="flex flex-wrap gap-1 mb-2">
                             <Badge variant="secondary" className="text-xs">Tag1</Badge>
                             <Badge variant="secondary" className="text-xs">Tag2</Badge>
                           </div> */}
                           <a href={link.split(':')[2]} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center">
                            View Project <ExternalLink size={14} className="ml-1.5" />
                          </a>
                        </>
                      ) : (
                        // Default rendering for string URLs
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center">
                          {/* Attempt to make the link text a bit nicer */}
                          {formatLinkText(link)}
                          <ExternalLink size={14} className="ml-1.5 flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
                        </a>
                      )}
                    </div>
                  ))}
                  {/* Static example of how project cards from the design would look IF data was available */}
                  {/* This is for visual reference and would require data changes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 group hover:shadow-md transition-shadow duration-150 ease-in-out opacity-50">
                      <h3 className="font-semibold text-md text-gray-800 mb-1">E-commerce Platform (Design Example)</h3>
                      <p className="text-xs text-gray-500 mb-2">A full featured online store with user authentication, product listings, cart functionality, and payment integration.</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">React</Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">Node.js</Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">Stripe API</Badge>
                      </div>
                      <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center">
                          View Project <ExternalLink size={14} className="ml-1.5" />
                      </a>
                  </div>
                   <div className="bg-white border border-gray-200 rounded-lg p-4 group hover:shadow-md transition-shadow duration-150 ease-in-out opacity-50">
                      <h3 className="font-semibold text-md text-gray-800 mb-1">Task Management App (Design Example)</h3>
                      <p className="text-xs text-gray-500 mb-2">A collaborative tool for teams to organize, track, and manage projects and tasks efficiently.</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">Vue.js</Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">Firebase</Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">Tailwind CSS</Badge>
                      </div>
                      <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center">
                          View Demo <ExternalLink size={14} className="ml-1.5" />
                      </a>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end mt-8">
              <Button onClick={logout} variant="outline" className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;