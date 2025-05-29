import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from './components/ui/sonner';

import HomePage from './pages/HomePage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css'
import EditProfilePage from './pages/EditProfilePage';








function App() {
  // We can add useAuth here later to conditionally show Login/Register or Profile/Logout links
  // const { isAuthenticated } = useAuth(); 

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="container mx-auto text-center w-full max-w-4xl">
        <Toaster richColors position="top-right" />
        {/* Basic Global Navigation (Optional for now, HomePage has links) */}
        <nav className="p-4 mb-6 flex justify-center space-x-6">
          <Link to="/" className="text-lg hover:text-primary">Home</Link>
          {/* We will make these links conditional later based on auth state */}
          <Link to="/login" className="text-lg hover:text-primary">Login</Link>
          <Link to="/register" className="text-lg hover:text-primary">Register</Link>
          <Link to="/profile" className="text-lg hover:text-primary">Profile</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Route for Profile */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} /> {/* <-- ADD THIS ROUTE */}
            {/* Add other protected routes here later */}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
