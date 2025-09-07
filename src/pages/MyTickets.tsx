import React from 'react';
import { useQuery } from 'react-query';
import { Calendar, MapPin, Download, QrCode, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  _id: string;
  ticketId: string;
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    image: string;
  };
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  pdfPath?: string;
}

const MyTickets: React.FC = () => {
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>(
    'myTickets',
    () => axios.get(`${API_URL}/tickets/my-tickets`).then(res => res.data)
  );

  const downloadTicket = async (ticketId: string, ticketNumber: string) => {
    try {
      const response = await axios.get(`${API_URL}/tickets/${ticketId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `billet-${ticketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Billet téléchargé avec succès!');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du billet');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'used':
        return 'Utilisé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Mes Billets
            </h1>
            <p className="text-xl text-gray-300">
              Gérez vos billets et accédez à vos événements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun billet trouvé
            </h3>
            <p className="text-gray-600 mb-8">
              Vous n'avez pas encore acheté de billets. Découvrez nos événements !
            </p>
            <a
              href="/events"
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Découvrir les événements
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={ticket.event.image ? `http://localhost:5000${ticket.event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    alt={ticket.event.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {ticket.event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      {new Date(ticket.event.date).toLocaleDateString('fr-FR')}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-2" />
                      {ticket.event.time}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2" />
                      {ticket.event.venue}, {ticket.event.city}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                      <span>N° de billet:</span>
                      <span className="font-mono text-xs">{ticket.ticketId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-yellow-600">
                        {ticket.price.toLocaleString()} {ticket.currency}
                      </span>
                      <span className="text-sm text-gray-500">
                        Acheté le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  {ticket.status === 'confirmed' && ticket.pdfPath && (
                    <button
                      onClick={() => downloadTicket(ticket._id, ticket.ticketId)}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                    >
                      <Download size={16} className="mr-2" />
                      Télécharger le billet
                    </button>
                  )}

                  {ticket.status === 'pending' && (
                    <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg text-center font-semibold">
                      Paiement en cours...
                    </div>
                  )}

                  {ticket.status === 'used' && (
                    <div className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg text-center font-semibold">
                      ✓ Billet utilisé
                    </div>
                  )}

                  {ticket.status === 'cancelled' && (
                    <div className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg text-center font-semibold">
                      ✗ Annulé
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;