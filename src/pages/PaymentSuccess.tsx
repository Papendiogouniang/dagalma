import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CheckCircle, Download, Calendar, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');

  const { data: ticket, isLoading } = useQuery(
    ['paymentStatus', ticketId],
    () => axios.get(`${API_URL}/payments/status/${ticketId}`).then(res => res.data),
    {
      enabled: !!ticketId,
      refetchInterval: (data) => {
        // Stop refetching if payment is completed or failed
        if (data?.paymentStatus === 'completed' || data?.paymentStatus === 'failed') {
          return false;
        }
        return 3000; // Refetch every 3 seconds while pending
      }
    }
  );

  if (isLoading || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Nous vérifions le statut de votre paiement
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = ticket.paymentStatus === 'completed' && ticket.status === 'confirmed';
  const isPending = ticket.paymentStatus === 'pending';
  const isFailed = ticket.paymentStatus === 'failed';

  if (isFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement échoué
          </h1>
          
          <p className="text-gray-600 mb-8">
            Votre paiement n'a pas pu être traité. Veuillez réessayer.
          </p>
          
          <div className="space-y-4">
            <Link
              to={`/events/${ticket.event._id}`}
              className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Réessayer
            </Link>
            <Link
              to="/events"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Retour aux événements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <div className="animate-pulse w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement en cours
          </h1>
          
          <p className="text-gray-600 mb-8">
            Votre paiement est en cours de traitement. Vous recevrez une confirmation par email dès que le paiement sera validé.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>N° de billet:</strong> {ticket.ticketId}
            </p>
          </div>
          
          <Link
            to="/my-tickets"
            className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Voir mes billets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>
          
          <p className="text-xl text-gray-600">
            Félicitations, votre billet a été confirmé avec succès
          </p>
        </div>

        {/* Ticket Information */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-black mb-2">
              Votre billet électronique
            </h2>
            <p className="text-black/70">
              Un email avec votre billet PDF vous a été envoyé
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Détails de l'événement
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {ticket.event.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar size={20} className="mr-3" />
                    <span>
                      {new Date(ticket.event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={20} className="mr-3" />
                    <span>{ticket.event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin size={20} className="mr-3" />
                    <span>{ticket.event.venue}, {ticket.event.city}</span>
                  </div>
                </div>
              </div>
              
              {/* Ticket Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations du billet
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">N° de billet:</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {ticket.ticketId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix:</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {ticket.event.price?.toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut:</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Confirmé
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          {ticket.pdfPath && (
            <button
              onClick={() => {
                // Download ticket logic would go here
              }}
              className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold mr-4 transition-colors"
            >
              <Download size={20} className="mr-2" />
              Télécharger le billet
            </button>
          )}
          
          <Link
            to="/my-tickets"
            className="inline-flex items-center border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Voir tous mes billets
          </Link>
        </div>

        {/* Important Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📱 Informations importantes
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Présentez-vous à l'entrée 30 minutes avant l'événement</li>
            <li>• Ayez votre billet PDF ou smartphone prêt pour le scan du QR code</li>
            <li>• Une pièce d'identité pourra vous être demandée à l'entrée</li>
            <li>• Ce billet est personnel et incessible</li>
            <li>• En cas de problème, contactez notre support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;