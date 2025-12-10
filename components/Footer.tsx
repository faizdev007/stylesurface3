import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Download, Phone, Mail, MapPin, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { CMS } from '../utils/cms';
import { GlobalSettings, MenuItem } from '../types';

interface FooterProps {
  onOpenModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
      const loadData = async () => {
          const s = await CMS.getSettings();
          const m = await CMS.getMenus();
          setSettings(s);
          setMenuItems(m.footer);
      };
      loadData();
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-industrial-dark text-white pt-24 pb-12 border-t border-brand-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Company Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-2.5">
               <img 
                  src="/logo.webp"
                  alt={settings.siteName} 
                  className="h-10 w-auto object-contain" 
                />
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              India's leading manufacturer of high-quality Acrylic, Ubuntu, and Cork sheets. Engineered for precision and built for durability.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="bg-gray-800 p-3 rounded-xl hover:bg-brand-600 hover:text-white text-gray-400 transition-all duration-300 hover:-translate-y-1 ring-1 ring-white/10 hover:ring-brand-500">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              {menuItems.map((link) => (
                <li key={link.id}>
                    <Link to={link.url} className="text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-2 group text-sm">
                        <ArrowRight className="w-3 h-3 text-brand-600 group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                        {link.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-gray-800 p-2 rounded-lg text-brand-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Head Office</span>
                  <span className="text-sm text-gray-300 block leading-relaxed">{settings.address}</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-gray-800 p-2 rounded-lg text-brand-400 shrink-0">
                    <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Phone</span>
                  <span className="text-sm text-gray-300 block">{settings.phone}</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-gray-800 p-2 rounded-lg text-brand-400 shrink-0">
                    <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Email</span>
                  <span className="text-sm text-gray-300 block">{settings.email}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-wider">Catalog</h4>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700/50">
              <p className="text-gray-400 mb-6 text-xs leading-relaxed">Download our comprehensive product catalog with technical specifications and pricing.</p>
              <Button variant="primary" fullWidth className="flex items-center justify-center gap-2 text-xs font-bold shadow-lg" onClick={onOpenModal}>
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;