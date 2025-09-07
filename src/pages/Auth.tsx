import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate(from, { replace: true });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRludf5sOS8al64SwRP8pkF_R1hqpDfkAFgA&s"
            alt="Kanzey Logo"
            className="mx-auto h-16 w-16"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Connectez-vous' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Accédez à votre compte Kanzey'
              : 'Rejoignez la communauté Kanzey'
            }
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg px-8 py-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <div className="mt-1 relative">
                    <User size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={!isLogin}
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                      placeholder="Prénom"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <div className="mt-1 relative">
                    <User size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required={!isLogin}
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                      placeholder="Nom"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="mt-1 relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                  placeholder="adresse@email.com"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone *
                </label>
                <div className="mt-1 relative">
                  <Phone size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                    placeholder="771234567"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="mt-1 relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe *
                </label>
                <div className="mt-1 relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 focus:z-10"
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors"
              >
                {isLogin ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                {isLogin 
                  ? 'Pas encore de compte ? Créer un compte'
                  : 'Déjà un compte ? Se connecter'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;