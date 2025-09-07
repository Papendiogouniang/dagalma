import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Auth from './pages/Auth';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import PaymentSuccess from './pages/PaymentSuccess';
import VerifyTicket from './pages/VerifyTicket';

// Admin Pages
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEvents from './pages/Admin/Events';
import AdminSlides from './pages/Admin/Slides';
import AdminTickets from './pages/Admin/Tickets';
import AdminUsers from './pages/Admin/Users';
import AdminSettings from './pages/Admin/Settings';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #ffd700',
                },
              }}
            />
            
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/events" element={<AdminEvents />} />
                      <Route path="/slides" element={<AdminSlides />} />
                      <Route path="/tickets" element={<AdminTickets />} />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/settings" element={<AdminSettings />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/verify-ticket/:qrCode" element={<VerifyTicket />} />
                      <Route path="/my-tickets" element={
                        <ProtectedRoute>
                          <MyTickets />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/payment-success" element={
                        <ProtectedRoute>
                          <PaymentSuccess />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;