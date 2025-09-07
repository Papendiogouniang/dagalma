import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Calendar, MapPin, Search, Filter, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Event {
  _id: string;
  title: string;
  shortDescription: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  isFeatured: boolean;
  availableTickets: number;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);

  const { data: eventsData, isLoading } = useQuery(
    ['events', searchTerm, selectedCategory, sortBy, page],
    () => axios.get(`${API_URL}/events`, {
      params: {
        page,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        sortBy
      }
    }).then(res => res.data),
    { keepPreviousData: true }
  );

  const { data: categories = [] } = useQuery<string[]>(
    'categories',
    () => axios.get(`${API_URL}/events/utils/categories`).then(res => res.data)
  );

  const events = eventsData?.events || [];
  const totalPages = eventsData?.totalPages || 1;

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tous les Événements
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Découvrez les meilleurs événements au Sénégal et réservez vos billets en ligne
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 appearance-none bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 appearance-none bg-white"
            >
              <option value="date">Trier par date</option>
              <option value="price">Trier par prix</option>
              <option value="title">Trier par nom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600 mb-8">
              Essayez de modifier vos critères de recherche ou de navigation
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('date');
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event: Event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    {event.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Star size={12} className="mr-1" />
                          À la une
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                        {event.category}
                      </span>
                    </div>
                    {event.availableTickets === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                          COMPLET
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.shortDescription}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar size={14} className="mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin size={14} className="mr-2" />
                      {event.venue}, {event.city}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-yellow-600">
                        {event.price.toLocaleString()} {event.currency}
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-center text-sm ${
                          event.availableTickets === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        {event.availableTickets === 0 ? 'Complet' : 'Réserver'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        page === i + 1
                          ? 'bg-yellow-400 text-black'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;