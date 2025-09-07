import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Calendar, MapPin, Star, ChevronRight, Music, Users, Trophy, ArrowRight, Clock, Ticket, Play } from 'lucide-react';
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

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  linkUrl: string;
  linkText: string;
  event?: Event;
}

const Home: React.FC = () => {
  const { data: slides = [] } = useQuery<Slide[]>(
    'slides',
    () => axios.get(`${API_URL}/slides`).then(res => res.data),
    { refetchInterval: 30000 } // Refresh every 30 seconds to get new slides
  );

  const { data: featuredEvents = [] } = useQuery<Event[]>(
    'featuredEvents',
    () => axios.get(`${API_URL}/events?featured=true&limit=6`).then(res => res.data.events)
  );

  const { data: upcomingEvents = [] } = useQuery<Event[]>(
    'upcomingEvents',
    () => axios.get(`${API_URL}/events?limit=8&sortBy=date`).then(res => res.data.events)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      {slides.length > 0 && (
        <section className="relative h-[90vh] bg-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
          <img 
            src={`http://localhost:5000${slides[0].image}`}
            alt={slides[0].title}
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <div className="mb-4">
                  <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                    À la une
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight animate-fade-in">
                  {slides[0].title}
                </h1>
                <p className="text-2xl text-gray-200 mb-4 font-medium">
                  {slides[0].subtitle}
                </p>
                <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed">
                  {slides[0].description}
                </p>
                <Link
                  to={slides[0].linkUrl || '/events'}
                  className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-12 py-6 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/25"
                >
                  <Play size={24} className="mr-3" />
                  {slides[0].linkText || 'Découvrir'}
                  <ChevronRight size={24} className="ml-3" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Slide indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
              <div className="flex space-x-3">
                {slides.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === 0 ? 'bg-yellow-400 w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Additional Featured Section for "À la une" events */}
      {featuredEvents.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-black/20 text-black px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
                <Star size={16} className="mr-2" />
                Événements à la Une
              </div>
              <h2 className="text-5xl font-bold text-black mb-6">
                Ne Ratez Rien !
              </h2>
              <p className="text-xl text-black/80 max-w-3xl mx-auto">
                Découvrez les événements les plus attendus et réservez vos places avant qu'il ne soit trop tard
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredEvents.slice(0, 2).map((event) => (
                <div key={event._id} className="group bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative h-80">
                    <img 
                      src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center">
                        <Star size={14} className="mr-2" />
                        À la une
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-white/90 text-sm mb-2">
                        <Calendar size={16} className="mr-2" />
                        {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                      </div>
                      <div className="flex items-center text-white/90 text-sm">
                        <MapPin size={16} className="mr-2" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {event.shortDescription}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-yellow-600">
                        {event.price.toLocaleString()} {event.currency}
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center"
                      >
                        Réserver
                        <ArrowRight size={18} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-black">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg font-medium">Événements organisés</div>
            </div>
            <div className="text-black">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg font-medium">Billets vendus</div>
            </div>
            <div className="text-black">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg font-medium">Utilisateurs actifs</div>
            </div>
            <div className="text-black">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg font-medium">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Réservez vos billets en 3 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Choisissez votre événement</h3>
              <p className="text-gray-600">
                Parcourez notre catalogue d'événements et trouvez celui qui vous intéresse
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Réservez et payez</h3>
              <p className="text-gray-600">
                Sélectionnez vos billets et payez en toute sécurité avec Orange Money, Wave ou Free Money
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Profitez de l'événement</h3>
              <p className="text-gray-600">
                Recevez votre billet par email et présentez-vous à l'entrée avec votre QR code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Autres Événements Populaires
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Continuez à explorer nos événements populaires
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(2, 8).map((event) => (
                <div key={event._id} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    <img 
                      src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400`}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Star size={14} className="mr-1" />
                        À la une
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.shortDescription}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar size={16} className="mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin size={16} className="mr-2" />
                      {event.venue}, {event.city}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-yellow-600">
                        {event.price.toLocaleString()} {event.currency}
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/events"
                className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Voir tous les événements
                <ChevronRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ne ratez aucun événement !
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Inscrivez-vous à notre newsletter pour être informé des nouveaux événements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Aminata Diallo",
                role: "Étudiante",
                content: "Interface très intuitive, paiement rapide et sécurisé. J'ai pu acheter mes billets en quelques clics !",
                rating: 5
              },
              {
                name: "Moussa Seck",
                role: "Entrepreneur",
                content: "Excellent service client et billets reçus instantanément par email. Je recommande vivement !",
                rating: 5
              },
              {
                name: "Fatou Ba",
                role: "Professeure",
                content: "Plateforme fiable avec de nombreux événements intéressants. Les prix sont très compétitifs.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Catégories d'Événements
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez l'événement qui vous correspond
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <Music size={48} className="text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Concerts</h3>
              <p className="text-gray-600 mb-6">
                Les meilleurs artistes locaux et internationaux
              </p>
              <Link 
                to="/events?category=Concert"
                className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
              >
                Découvrir →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <Users size={48} className="text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Conférences</h3>
              <p className="text-gray-600 mb-6">
                Développez vos compétences et votre réseau
              </p>
              <Link 
                to="/events?category=Conference"
                className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
              >
                Découvrir →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sport</h3>
              <p className="text-gray-600 mb-6">
                Vivez l'émotion des plus grands matchs
              </p>
              <Link 
                to="/events?category=Sport"
                className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
              >
                Découvrir →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Événements à Venir
              </h2>
              <p className="text-xl text-gray-600">
                Ne ratez aucun événement proche de vous
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 8).map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <img 
                    src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300`}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {event.city}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600 font-bold">
                        {event.price.toLocaleString()} F
                      </span>
                      <Link
                        to={`/events/${event._id}`}
                        className="text-black hover:text-yellow-600 text-sm font-medium transition-colors"
                      >
                        Voir →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à vivre des expériences inoubliables ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à Kanzey pour leurs événements
          </p>
          <Link
            to="/events"
            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Découvrir les événements
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Partenaires de Paiement
            </h2>
            <p className="text-gray-600">
              Payez en toute sécurité avec vos moyens de paiement préférés
            </p>
          </div>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-orange-500">Orange Money</div>
            <div className="text-2xl font-bold text-blue-500">Wave</div>
            <div className="text-2xl font-bold text-green-500">Free Money</div>
            <div className="text-2xl font-bold text-purple-500">Touch Point</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;