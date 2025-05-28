// swipe/packages/client/src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-destructive mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page Not Found.</p>
      <Link to="/" className="text-primary hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;