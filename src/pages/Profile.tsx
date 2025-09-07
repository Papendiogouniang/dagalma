import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Mon Profil
            </h1>
            <p className="text-xl text-gray-300">
              Gérez vos informations personnelles
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
            <div className="flex items-center">
              <div className="bg-white p-4 rounded-full">
                <User size={32} className="text-gray-600" />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-black">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-black/70">{user.email}</p>
                <span className="inline-block bg-black/20 text-black px-3 py-1 rounded-full text-sm font-medium mt-2">
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Informations personnelles
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit size={16} className="mr-2" />
                  Modifier
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none ${
                        isEditing 
                          ? 'border-gray-300 focus:border-yellow-400' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none ${
                        isEditing 
                          ? 'border-gray-300 focus:border-yellow-400' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none ${
                      isEditing 
                        ? 'border-gray-300 focus:border-yellow-400' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-6">
                  <button
                    type="submit"
                    className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save size={16} className="mr-2" />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} className="mr-2" />
                    Annuler
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Statistiques du compte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                --
              </div>
              <p className="text-gray-600">Billets achetés</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                --
              </div>
              <p className="text-gray-600">Événements assistés</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-gray-600">Membre depuis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;