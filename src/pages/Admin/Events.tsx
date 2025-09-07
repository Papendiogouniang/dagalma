import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Upload, X, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  maxTickets: number;
  availableTickets: number;
  category: string;
  image: string;
  isFeatured: boolean;
  isActive: boolean;
  organizerName: string;
  organizerContact: string;
  tags: string[];
  createdAt: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    city: '',
    price: 0,
    maxTickets: 100,
    category: 'Concert',
    isFeatured: false,
    organizerName: '',
    organizerContact: '',
    tags: [] as string[]
  });

  const categories = ['Concert', 'Conference', 'Sport', 'Theatre', 'Festival', 'Autre'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events?limit=100`);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors de la récupération des événements');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      date: '',
      time: '',
      venue: '',
      address: '',
      city: '',
      price: 0,
      maxTickets: 100,
      category: 'Concert',
      isFeatured: false,
      organizerName: '',
      organizerContact: '',
      tags: []
    });
    setSelectedImage(null);
    setImagePreview('');
    setEditingEvent(null);
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription,
        date: event.date.split('T')[0],
        time: event.time,
        venue: event.venue,
        address: event.address,
        city: event.city,
        price: event.price,
        maxTickets: event.maxTickets,
        category: event.category,
        isFeatured: event.isFeatured,
        organizerName: event.organizerName,
        organizerContact: event.organizerContact,
        tags: event.tags || []
      });
      if (event.image) {
        setImagePreview(`http://localhost:5000${event.image}`);
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });

      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      let response;
      if (editingEvent) {
        response = await axios.put(`${API_URL}/events/${editingEvent._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Événement mis à jour avec succès');
      } else {
        response = await axios.post(`${API_URL}/events`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Événement créé avec succès');
      }

      closeModal();
      fetchEvents();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await axios.delete(`${API_URL}/events/${eventId}`);
        toast.success('Événement supprimé avec succès');
        fetchEvents();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos événements</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Nouvel Événement
        </button>
      </div>

      {/* Events Grid */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={event.image ? `http://localhost:5000${event.image}` : `https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      {event.category}
                    </span>
                    {event.isFeatured && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Star size={12} className="mr-1" />
                        À la une
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.shortDescription}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2" />
                      {event.venue}, {event.city}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={14} className="mr-2" />
                      {event.availableTickets} / {event.maxTickets} places
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-yellow-600">
                      {event.price.toLocaleString()} FCFA
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      event.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/events/${event._id}`, '_blank')}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal(event)}
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500">
              Commencez par créer votre premier événement.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de l'événement
                  </label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Aperçu" className="h-20 w-32 rounded-lg object-cover" />
                    )}
                    <label className="cursor-pointer bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center">
                      <Upload className="mr-2" size={16} />
                      Choisir une image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'événement *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Nom de l'événement"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description courte *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Description courte pour les cartes"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description complète *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Description détaillée de l'événement"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Nom du lieu"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Adresse complète"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Ville"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Prix du billet"
                    />
                  </div>

                  {/* Max Tickets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de places *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.maxTickets}
                      onChange={(e) => setFormData({ ...formData, maxTickets: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Nombre total de places"
                    />
                  </div>

                  {/* Organizer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'organisateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organizerName}
                      onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Nom de l'organisateur"
                    />
                  </div>

                  {/* Organizer Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact organisateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organizerContact}
                      onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Téléphone ou email"
                    />
                  </div>

                  {/* Featured */}
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Événement à la une (affiché en priorité sur l'accueil)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'En cours...' : editingEvent ? 'Mettre à jour' : 'Créer l\'événement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;