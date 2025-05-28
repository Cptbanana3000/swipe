import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { Button } from "./components/ui/button"
import './App.css'


const HomePage = () => (
  <div>
    <h1 className="text-2xl font-bold">Home Page</h1>
    <nav className="mt-4 space-x-2">
      <Button asChild><Link to="/login">Login</Link></Button>
      <Button asChild><Link to="/register">Register</Link></Button>
      <Button asChild><Link to="/profile">My Profile</Link></Button>
    </nav>
  </div>
);


const ProfilePage = () => <h1 className="text-2xl font-bold">User Profile Page</h1>;
const NotFoundPage = () => <h1 className="text-2xl font-bold">404 - Page Not Found</h1>;


function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="container mx-auto text-center">
        {/* Basic Navigation (you'll build a proper Navbar component later) */}
        <nav className="p-4 mb-6 flex justify-center space-x-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/login" className="hover:text-primary">Login</Link>
          <Link to="/register" className="hover:text-primary">Register</Link>
        </nav>

        {/* Define Your Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} /> {/* LoginPage will be next! */}
          <Route path="/register" element={<RegisterPage />} /> {/* <--- USE IT HERE */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
