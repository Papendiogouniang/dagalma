import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Image, Ticket, Users, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Événements', path: '/admin/events' },
    { icon: Image, label: 'Slides', path: '/admin/slides' },
    { icon: Ticket, label: 'Billets', path: '/admin/tickets' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black shadow-lg">
        <div className="p-6">
          <div className="flex items-center">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRludf5sOS8al64SwRP8pkF_R1hqpDfkAFgA&s"
              alt="Kanzey Logo"
              className="h-10 w-10 mr-3"
            />
            <span className="text-2xl font-bold text-yellow-400">KANZEY</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Administration</p>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-black border-r-4 border-yellow-600'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-400 p-2 rounded-full">
              <Users size={16} className="text-black" />
            </div>
            <div className="ml-3">
              <p className="text-white text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-300 text-xs">Administrateur</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-300 hover:text-white text-sm transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Administration'}
              </h1>
              
              <Link
                to="/"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Voir le site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;