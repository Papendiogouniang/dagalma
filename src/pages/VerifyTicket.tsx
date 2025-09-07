import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CheckCircle, XCircle, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerifyTicket: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();

  const { data, isLoading, error } = useQuery(
    ['verifyTicket', qrCode],
    () => axios.post(`${API_URL}/tickets/verify`, { qrCode }).then(res => res.data),
    { 
      enabled: !!qrCode,
      retry: false
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du billet...
          </h2>
          <p className="text-gray-600">
            Validation en cours
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Billet invalide
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error?.response?.data?.message || 'Ce billet n\'est pas valide ou n\'existe pas.'}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm font-medium">
                Accès refusé
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { ticket, event, user } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Billet valide ✓
          </h1>
          
          <p className="text-xl text-green-600 font-semibold">
            Ce billet est authentique et peut être accepté
          </p>
        </div>

        {/* Ticket Information */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Informations du billet
            </h2>
            <p className="text-green-100">
              N° {ticket.ticketId}
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Événement
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h4 className="text-xl font-bold text-gray-900">
                  {event.title}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span> {' '}
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div>
                    <span className="font-medium">Heure:</span> {event.time}
                  </div>
                  
                  <div className="md:col-span-2">
                    <span className="font-medium">Lieu:</span> {event.venue}, {event.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Holder Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Titulaire
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-900 font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">{user.phone}</p>
              </div>
            </div>

            {/* Ticket Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statut du billet
              </h3>
              
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold text-green-900">Billet confirmé</p>
                    <p className="text-green-700 text-sm">Prêt à être utilisé</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {ticket.price.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Acheté le:</span> {' '}
                  {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <span className="font-medium">Méthode de paiement:</span> {' '}
                  {ticket.paymentMethod.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Instructions pour l'accès
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✅ Ce billet est valide et peut être accepté</li>
            <li>📱 Le QR code a été vérifié avec succès</li>
            <li>🆔 Vérifiez l'identité du porteur si nécessaire</li>
            <li>⚠️ Ce billet ne peut être utilisé qu'une seule fois</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicket;