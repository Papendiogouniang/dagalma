import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Mail, Globe, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Site Settings
    siteName: 'Kanzey',
    siteDescription: 'Plateforme de billetterie événementielle au Sénégal',
    siteUrl: 'https://kanzey.co',
    contactEmail: 'contact@kanzey.co',
    contactPhone: '+221 77 123 45 67',
    
    // Email Settings
    emailFrom: 'noreply@kanzey.co',
    emailReplyTo: 'support@kanzey.co',
    
    // Payment Settings
    currency: 'XOF',
    taxRate: 0,
    
    // Feature Flags
    enableRegistration: true,
    enablePayments: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    
    // InTouch Settings
    intouchMerchantId: 'KANZ26379',
    intouchLoginAgent: '777101085',
    
    // Limits
    maxFileSize: 5, // MB
    maxTicketsPerUser: 10,
    ticketValidityDays: 365
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Here you would typically save to your backend
      // await axios.put(`${API_URL}/admin/settings`, { section, settings });
      
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Paramètres ${section} sauvegardés avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Configurez les paramètres de votre plateforme</p>
      </div>

      {/* Site Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <Globe className="text-blue-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Paramètres du Site</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du site
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du site
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleInputChange('siteUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du site
            </label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone de contact
            </label>
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleSave('site')}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 inline-flex items-center"
          >
            <Save className="mr-2" size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <Mail className="text-green-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Paramètres Email</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email expéditeur
            </label>
            <input
              type="email"
              value={settings.emailFrom}
              onChange={(e) => handleInputChange('emailFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de réponse
            </label>
            <input
              type="email"
              value={settings.emailReplyTo}
              onChange={(e) => handleInputChange('emailReplyTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) => handleInputChange('enableEmailNotifications', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Activer les notifications par email
            </span>
          </label>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleSave('email')}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 inline-flex items-center"
          >
            <Save className="mr-2" size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="text-purple-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Paramètres de Paiement</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="XOF">Franc CFA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar US (USD)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux de taxe (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Marchand InTouch
            </label>
            <input
              type="text"
              value={settings.intouchMerchantId}
              onChange={(e) => handleInputChange('intouchMerchantId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login Agent InTouch
            </label>
            <input
              type="text"
              value={settings.intouchLoginAgent}
              onChange={(e) => handleInputChange('intouchLoginAgent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enablePayments}
              onChange={(e) => handleInputChange('enablePayments', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Activer les paiements
            </span>
          </label>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleSave('payment')}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 inline-flex items-center"
          >
            <Save className="mr-2" size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Security & Features */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <Shield className="text-red-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Sécurité & Fonctionnalités</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableRegistration}
              onChange={(e) => handleInputChange('enableRegistration', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Permettre les nouvelles inscriptions
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Mode maintenance (désactive l'accès public)
            </span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille max fichier (MB)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxFileSize}
              onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max billets par utilisateur
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxTicketsPerUser}
              onChange={(e) => handleInputChange('maxTicketsPerUser', parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validité billet (jours)
            </label>
            <input
              type="number"
              min="1"
              max="3650"
              value={settings.ticketValidityDays}
              onChange={(e) => handleInputChange('ticketValidityDays', parseInt(e.target.value) || 365)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleSave('security')}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 inline-flex items-center"
          >
            <Save className="mr-2" size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <SettingsIcon className="text-gray-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Informations Système</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Version</h3>
            <p className="text-gray-600">Kanzey v1.0.0</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Environnement</h3>
            <p className="text-gray-600">Production</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Base de données</h3>
            <p className="text-gray-600">MongoDB Atlas</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibent text-gray-900 mb-2">Dernière sauvegarde</h3>
            <p className="text-gray-600">Aujourd'hui à 03:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;