import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { CMS } from '../utils/cms';
import { MenuItem, GlobalSettings } from '../types';

interface NavbarProps {
  onOpenModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const loadData = async () => {
        const menuData = await CMS.getMenus();
        setMenuItems(menuData.header);
        const settingsData = await CMS.getSettings();
        setSettings(settingsData);
    };
    loadData();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path; 
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="https://stylesurface-in.vercel.app/logo.webp" 
              alt="StylenSurface" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/70 p-1 rounded-full border border-gray-200/50 backdrop-blur-sm shadow-sm">
            {menuItems.map((link) => (
              <Link 
                key={link.id} 
                to={link.url} 
                target={link.target}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.url) ? 'bg-brand-500 text-white shadow-md' : 'text-gray-600 hover:text-brand-900 hover:bg-gray-100/50'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={`tel:${settings?.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-brand-700 font-bold transition-colors text-sm">
              <Phone className="w-4 h-4 text-brand-500" />
              <span>{settings?.phone}</span>
            </a>
            <Button variant="primary" size="sm" onClick={onOpenModal} className="shadow-brand-500/20">
              Get Quote
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-slate-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 lg:hidden animate-fade-in-up">
            <div className="flex flex-col gap-2">
            {menuItems.map((link) => (
                <Link 
                key={link.id} 
                to={link.url}
                className={`flex items-center justify-between font-medium p-4 rounded-xl transition-colors ${isActive(link.url) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-gray-50'}`}
                >
                {link.label}
                <ChevronRight className={`w-4 h-4 ${isActive(link.url) ? 'text-brand-500' : 'text-gray-300'}`} />
                </Link>
            ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
                <Button fullWidth variant="primary" size="lg" onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenModal();
                }}>
                    Get Bulk Quote
                </Button>
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-2">Need help? Call us directly</p>
                    <a href={`tel:${settings?.phone}`} className="text-lg font-bold text-slate-900 block">{settings?.phone}</a>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Navbar;