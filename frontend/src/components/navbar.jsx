import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Invalid user data in localStorage');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleProtectedRoute = (e) => {
    if (!user) {
      e.preventDefault();
      alert('⚠️ Please login first to access this feature!');
      window.location.href = '/auth';
    }
  };

  const getInitials = () => {
    if (!user?.name) return '';
    return user.name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-6 py-3 flex justify-between items-center font-sans">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 font-serif">
          <a href="/" className="font-serif">
            Study Spark
          </a>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium font-sans">
          {['summarize', 'flashcard', 'mindmap', 'qa', 'chatbot'].map((feature) => (
            <li key={feature}>
              <a
                href={`/${feature}`}
                onClick={handleProtectedRoute}
                className="hover:text-blue-500 relative group transition-colors duration-300"
              >
                {/* Underline animation */}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 transition-all group-hover:w-full"></span>
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 font-sans">
          <span className="text-xl">🌐</span>

          {/* History icon on chatbot page */}
          {location.pathname === '/chatbot' && (
            <button
              onClick={() => navigate('/historychatbot')}
              title="View Chat History"
              className="text-xl hover:text-blue-600 transition"
            >
              <FaHistory className="text-xl cursor-pointer hover:text-blue-600" title="Chat History" />
            </button>
          )}

          {/* User dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                {getInitials()}
              </div>

              {/* Dropdown with fade + scale */}
              <div
                className={`absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10 font-sans
                  transform origin-top-right transition-all duration-200
                  ${
                    dropdownOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }
                `}
              >
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <a href="/auth">
              <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 font-sans transition">
                Get started
              </button>
            </a>
          )}
        </div>
      </nav>

      {/* Spacer div to push content below fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
