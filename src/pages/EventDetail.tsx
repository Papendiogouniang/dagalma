import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { User, Phone, CreditCard } from 'lucide-react'; // Supprimé Calendar, MapPin, Clock
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  availableTickets: number;
  maxTickets: number;
  organizerName: string;
  organizerContact: string;
  tags: string[];
  isFeatured: boolean;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event, isLoading } = useQuery<Event>(
    ['event', id],
    () => axios.get(`${API_URL}/events/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  const handleReservation = () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour réserver');
      navigate('/auth');
      return;
    }

    if (event && event.availableTickets <= 0) {
      toast.error('Plus de billets disponibles');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!event) return;
    setIsProcessing(true);

    try {
      console.log('🚀 Initiating payment for event:', event._id);
      
      const response = await axios.post(`${API_URL}/payments/initiate`, {
        eventId: event._id
      });

      console.log('💳 Payment response:', response.data);
      // Redirection vers PayTech
      if (response.data.redirect_url) {
        toast.success('Redirection vers PayTech...');
        console.log('🔗 Redirecting to:', response.data.redirect_url);
        window.location.href = response.data.redirect_url;
      } else {
        toast.error('Impossible de récupérer l\'URL de paiement.');
        console.error('PayTech response:', response.data);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Payment error response:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
      } else {
        console.error('Payment error:', error);
        toast.error('Erreur inconnue lors du paiement');
      }
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h2>
          <button
            onClick={() => navigate('/events')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Retour aux événements
          </button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-black overflow-hidden">
        <img 
          src={event.image ? `${API_URL}${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg`}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </span>
              {event.isFeatured && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  À la une
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              {event.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Event & Booking Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails de l'événement</h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              {event.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organisateur</h2>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <User size={24} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{event.organizerName}</h3>
                <div className="flex items-center text-gray-600 mt-2">
                  <Phone size={16} className="mr-2" />
                  {event.organizerContact}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-8 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {event.price.toLocaleString()} {event.currency}
              </div>
              <p className="text-gray-600">par billet</p>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Billets disponibles:</span>
              <span className="font-semibold">{event.availableTickets} / {event.maxTickets}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${(event.availableTickets / event.maxTickets) * 100}%` }}
              ></div>
            </div>

            {isEventPassed ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-semibold">
                Événement passé
              </div>
            ) : event.availableTickets <= 0 ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-semibold">
                Complet
              </div>
            ) : (
              <button
                onClick={handleReservation}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 px-6 rounded-lg font-bold text-lg transition-colors"
              >
                Réserver maintenant
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Finaliser votre réservation</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <CreditCard className="text-blue-600 mr-2" size={20} />
                <span className="font-semibold text-blue-900">Paiement sécurisé avec PayTech</span>
              </div>
              <p className="text-blue-800 text-sm">
                Vous serez redirigé vers PayTech pour effectuer votre paiement en toute sécurité.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Redirection...' : 'Payer avec PayTech'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
