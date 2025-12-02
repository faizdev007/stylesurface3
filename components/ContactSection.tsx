import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import LeadForm from './ui/LeadForm';
import { useContent } from '../utils/content';

const ContactSection: React.FC = () => {
  const { content } = useContent();

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-industrial-light rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            
            {/* Contact Info */}
            <div className="space-y-10">
                <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent-100 text-accent-800 font-bold text-xs uppercase tracking-wider mb-6">
                    Wholesale & Bulk Orders
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Ready to Scale?</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                    Get the best factory-direct rates. Fill out the form or reach us directly via phone or WhatsApp for instant quotes.
                    </p>
                </div>

                <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-brand-100 hover:shadow-md transition-all">
                    <div className="bg-brand-50 p-3.5 rounded-xl text-brand-600">
                    <Phone className="w-6 h-6" />
                    </div>
                    <div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Call Us (24/7)</h3>
                    <p className="text-slate-600 font-medium text-lg">{content.global.phone}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-brand-100 hover:shadow-md transition-all">
                    <div className="bg-green-50 p-3.5 rounded-xl text-green-600">
                    <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">WhatsApp Support</h3>
                    <p className="text-slate-600 font-medium text-lg">{content.global.whatsapp}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-brand-100 hover:shadow-md transition-all">
                    <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
                    <Mail className="w-6 h-6" />
                    </div>
                    <div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Email Us</h3>
                    <p className="text-slate-600 font-medium text-lg">{content.global.email}</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Enquiry</h3>
                <LeadForm />
            </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;