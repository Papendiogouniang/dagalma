import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Eye, Scan, CheckCircle, XCircle, Calendar, User, Ticket as TicketIcon, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  _id: string;
  ticketId: string;
  qrCode: string;
  event: {
    _id: string;
    title: string;
    date: string;
    venue: string;
    city: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  usedAt?: string;
}

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        fetchTickets();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tickets/admin/all`, {
        params: {
          page,
          limit: 20,
          status: statusFilter,
          search: searchTerm
        }
      });
      setTickets(response.data.tickets || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erreur lors de la récupération des billets');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setShowScanner(true);
    setScannerResult(null);
    setIsScanning(true);
    
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setShowScanner(false);
    setScannerResult(null);
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      setIsScanning(false);
      
      // Extract QR code from URL if it's a full URL
      const qrCode = decodedText.includes('/verify-ticket/') 
        ? decodedText.split('/verify-ticket/')[1]
        : decodedText;

      console.log('🔍 Scanning QR Code:', qrCode);

      const response = await axios.post(`${API_URL}/tickets/scan`, { qrCode });
      
      setScannerResult({
        success: true,
        data: response.data,
        message: 'Billet scanné et validé avec succès!',
        ticket: response.data.ticket,
        event: response.data.event,
        user: response.data.user
      });
      
      toast.success('✅ Billet validé avec succès!');
      fetchTickets(); // Refresh the list
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors du scan';
      setScannerResult({
        success: false,
        message,
        error: error.response?.data
      });
      toast.error(`❌ ${message}`);
    }
    
    // Don't stop scanner immediately, allow for multiple scans
    setTimeout(() => {
      if (scannerRef.current) {
        setIsScanning(true);
      }
    }, 3000);
  };

  const onScanFailure = (error: string) => {
    // Handle scan failure silently - don't show error for every failed scan attempt
    console.log('Scan attempt failed:', error);
  };

  const verifyTicket = async (qrCode: string) => {
    try {
      const response = await axios.post(`${API_URL}/tickets/verify`, { qrCode });
      toast.success('✅ Billet vérifié avec succès');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la vérification';
      toast.error(`❌ ${message}`);
      throw error;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Billets</h1>
          <p className="text-gray-600 mt-2">Gérez et scannez les billets des événements</p>
        </div>
        <button
          onClick={startScanner}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg"
        >
          <Camera className="mr-2" size={20} />
          Scanner un Billet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ou ID de billet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="used">Utilisé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Camera className="mr-3 text-yellow-500" size={28} />
                Scanner QR Code
              </h2>
              <button 
                onClick={stopScanner} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  📱 Positionnez le QR code du billet devant la caméra pour le scanner automatiquement.
                </p>
              </div>
              
              <div id="qr-reader" className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"></div>
              
              {isScanning && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Recherche de QR code...
                  </div>
                </div>
              )}
            </div>
            
            {scannerResult && (
              <div className={`p-6 rounded-xl border-2 ${
                scannerResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-4">
                  {scannerResult.success ? (
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                  ) : (
                    <XCircle className="text-red-500 mr-3" size={24} />
                  )}
                  <span className={`font-bold text-lg ${
                    scannerResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {scannerResult.success ? '✅ Billet Valide' : '❌ Billet Invalide'}
                  </span>
                </div>
                
                <p className={`text-sm mb-4 ${
                  scannerResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {scannerResult.message}
                </p>
                
                {scannerResult.success && scannerResult.data && (
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Événement:</span>
                        <p className="text-gray-900">{scannerResult.event?.title}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Participant:</span>
                        <p className="text-gray-900">
                          {scannerResult.user?.firstName} {scannerResult.user?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">N° Billet:</span>
                        <p className="text-gray-900 font-mono text-xs">
                          {scannerResult.ticket?.ticketId}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Prix:</span>
                        <p className="text-gray-900 font-semibold">
                          {scannerResult.ticket?.price?.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!scannerResult.success && scannerResult.error && (
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="text-red-800 text-sm">
                      <strong>Détails:</strong> {JSON.stringify(scannerResult.error)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setScannerResult(null);
                  setIsScanning(true);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Scanner un autre billet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          </div>
        ) : tickets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'achat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TicketIcon size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.ticketId}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {ticket.qrCode.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.event?.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(ticket.event?.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.event?.venue}, {ticket.event?.city}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.user?.firstName} {ticket.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.user?.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.user?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.price?.toLocaleString()} {ticket.currency}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.paymentMethod}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          ticket.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ticket.paymentStatus === 'completed' ? 'Payé' : 'En attente'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                        {ticket.usedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Utilisé le {new Date(ticket.usedAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/verify-ticket/${ticket.qrCode}`, '_blank')}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Voir le billet"
                          >
                            <Eye size={16} />
                          </button>
                          {ticket.status === 'confirmed' && (
                            <button
                              onClick={() => verifyTicket(ticket.qrCode)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Vérifier le billet"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> sur{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Précédent
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === i + 1
                              ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <TicketIcon size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun billet trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter 
                ? 'Aucun billet ne correspond à vos critères de recherche.'
                : 'Aucun billet n\'a encore été vendu.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;