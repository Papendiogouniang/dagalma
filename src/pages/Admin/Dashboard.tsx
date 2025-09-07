import React from 'react';
import { useQuery } from 'react-query';
import { Calendar, Users, Ticket, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const { data: events = [] } = useQuery(
    'adminEvents',
    () => axios.get(`${API_URL}/events?limit=5`).then(res => res.data.events)
  );

  const { data: tickets = [] } = useQuery(
    'adminTickets',
    () => axios.get(`${API_URL}/tickets/admin/all?limit=5`).then(res => res.data.tickets)
  );

  const { data: userStats } = useQuery(
    'userStats',
    () => axios.get(`${API_URL}/users/admin/stats`).then(res => res.data)
  );

  const stats = [
    {
      title: 'Total Événements',
      value: events.length,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Utilisateurs Actifs',
      value: userStats?.activeUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Billets Vendus',
      value: tickets.filter(t => t.status === 'confirmed').length,
      icon: Ticket,
      color: 'bg-yellow-500',
      change: '+25%'
    },
    {
      title: 'Revenus',
      value: '2.4M',
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+18%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-8 text-black">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue dans l'administration Kanzey
        </h1>
        <p className="text-lg opacity-90">
          Gérez vos événements, billets et utilisateurs depuis cette interface
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-green-500 text-sm font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Événements Récents
            </h2>
          </div>
          <div className="p-6">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun événement trouvé
              </p>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center space-x-4">
                    <img
                      src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=100`}
                      alt={event.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar size={12} className="mr-1" />
                        {new Date(event.date).toLocaleDateString('fr-FR')}
                        <MapPin size={12} className="ml-2 mr-1" />
                        {event.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {event.price.toLocaleString()} F
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.availableTickets} places
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Billets Récents
            </h2>
          </div>
          <div className="p-6">
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun billet trouvé
              </p>
            ) : (
              <div className="space-y-4">
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {ticket.event?.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'used'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status === 'confirmed' ? 'Confirmé' : 
                         ticket.status === 'used' ? 'Utilisé' : 'En attente'}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {ticket.price?.toLocaleString()} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/events"
            className="bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-lg font-semibold text-center transition-colors"
          >
            Créer un événement
          </a>
          <a
            href="/admin/slides"
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-semibold text-center transition-colors"
          >
            Gérer les slides
          </a>
          <a
            href="/admin/tickets"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-semibold text-center transition-colors"
          >
            Scanner un billet
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;