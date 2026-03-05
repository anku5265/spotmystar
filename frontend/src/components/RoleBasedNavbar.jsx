import { Link, useNavigate } from 'react-router-dom';
import { getCurrentRole, hasRole } from '../hooks/useAuth';

export default function RoleBasedNavbar() {
  const navigate = useNavigate();
  const currentRole = getCurrentRole();
  
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    navigate('/', { replace: true });
  };

  const handleRoleSwitch = (targetRole) => {
    handleLogout();
    if (targetRole === 'user') {
      navigate('/user/login');
    } else if (targetRole === 'artist') {
      navigate('/artist/login');
    }
  };

  // User-specific navigation
  if (hasRole('user')) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/star-logo.svg" alt="SpotMyStar" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-purple-600">SpotMyStar</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-purple-600">
                Discover Artists
              </Link>
              <Link to="/search" className="text-gray-700 hover:text-purple-600">
                Search
              </Link>
              <Link to="/user/dashboard" className="text-gray-700 hover:text-purple-600">
                My Dashboard
              </Link>
              <Link to="/wishlist" className="text-gray-700 hover:text-purple-600">
                Wishlist
              </Link>
              
              <div className="relative group">
                <button className="text-gray-700 hover:text-purple-600 flex items-center">
                  Account
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Logged in as User
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('artist')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Switch to Artist
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Artist-specific navigation
  if (hasRole('artist')) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/artist/dashboard" className="flex items-center">
                <img src="/star-logo.svg" alt="SpotMyStar" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-purple-600">SpotMyStar</span>
                <span className="ml-2 text-sm text-gray-500">Artist Portal</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/artist/dashboard" className="text-gray-700 hover:text-purple-600">
                Dashboard
              </Link>
              <Link to="/artist/profile" className="text-gray-700 hover:text-purple-600">
                My Profile
              </Link>
              <Link to="/artist/bookings" className="text-gray-700 hover:text-purple-600">
                Bookings
              </Link>
              <Link to="/artist/analytics" className="text-gray-700 hover:text-purple-600">
                Analytics
              </Link>
              
              <div className="relative group">
                <button className="text-gray-700 hover:text-purple-600 flex items-center">
                  Account
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Logged in as Artist
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('user')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Switch to User
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Public navigation (no role)
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/star-logo.svg" alt="SpotMyStar" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-purple-600">SpotMyStar</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-purple-600">
              Home
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-purple-600">
              Search Artists
            </Link>
            
            <div className="flex items-center space-x-2">
              <Link
                to="/user/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                User Login
              </Link>
              <Link
                to="/artist/login"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Artist Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}