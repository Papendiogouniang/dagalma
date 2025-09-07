import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Ticket, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRludf5sOS8al64SwRP8pkF_R1hqpDfkAFgA&s"
                alt="Kanzey Logo"
                className="h-10 w-10 mr-3"
              />
              <span className="text-2xl font-bold text-yellow-400">KANZEY</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              to="/events" 
              className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Événements
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/my-tickets" 
                  className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Mes Billets
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <User size={18} className="mr-2" />
                    {user?.firstName}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profil
                      </Link>
                      
                      <Link
                        to="/my-tickets"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Ticket size={16} className="mr-2" />
                        Mes Billets
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} className="mr-2" />
                          Administration
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-yellow-400 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/events"
              className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Événements
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-tickets"
                  className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Mes Billets
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profil
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;