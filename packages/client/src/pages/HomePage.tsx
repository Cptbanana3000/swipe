
import { Link, useNavigate } from 'react-router-dom'; // useNavigate might be useful
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'freelancer' | 'client') => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
      {/* Your Hero Section from the design */}
      <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
        Find Your Perfect<br />Freelance Match.
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-10">
        Swipe, Connect, <span className="text-primary font-semibold">Work.</span>
      </p>
      <div className="flex space-x-4 mb-8">
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg" // Make buttons larger
          onClick={() => handleRoleSelection('freelancer')}
        >
          I'm a Freelancer
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="px-8 py-6 text-lg" // Make buttons larger
          onClick={() => handleRoleSelection('client')}
        >
          I Need a Freelancer
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Join thousands of professionals already connecting on our platform.
      </p>
    </div>
  );
};

export default HomePage;