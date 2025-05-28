// swipe/packages/client/src/pages/HomePage.tsx

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming you might use it

const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to SWIPE Home!</h1>
      <p className="mb-4">Your journey to connect starts here.</p>
      <div className="space-x-4">
        <Button asChild variant="outline">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
        <Button asChild variant="secondary">
            <Link to="/profile">View My Profile (Protected)</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;