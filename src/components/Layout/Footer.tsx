import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRludf5sOS8al64SwRP8pkF_R1hqpDfkAFgA&s"
                alt="Kanzey Logo"
                className="h-12 w-12 mr-3"
              />
              <span className="text-3xl font-bold text-yellow-400">KANZEY</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              La plateforme de référence pour vos événements au Sénégal. 
              Découvrez, réservez et vivez des expériences inoubliables.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Mes Billets
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Mon Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail size={16} className="text-yellow-400 mr-2" />
                <span className="text-gray-300">contact@kanzey.co</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="text-yellow-400 mr-2" />
                <span className="text-gray-300">+221 77 123 45 67</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="text-yellow-400 mr-2 mt-1" />
                <span className="text-gray-300">
                  Dakar, Sénégal<br />
                  Plateau - VDN
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Kanzey. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;