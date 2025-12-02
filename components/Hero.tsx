import React from 'react';
import { CheckCircle, ShieldCheck, Truck, Award, Star, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import LeadForm from './ui/LeadForm';
import { useContent } from '../utils/content';

interface HeroProps {
  onOpenModal: () => void;
  content?: any;
}

const Hero: React.FC<HeroProps> = ({ onOpenModal, content: propContent }) => {
  const { content: defaultContent } = useContent();
  
  const title = propContent?.title || defaultContent.home.heroTitle;
  const subtitle = propContent?.subtitle || defaultContent.home.heroSubtitle;
  const btnPrimary = propContent?.btnPrimary || defaultContent.home.heroBtnPrimary;
  const btnSecondary = propContent?.btnSecondary || defaultContent.home.heroBtnSecondary;
  const bgImage = propContent?.bgImage;

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
      {/* Background Elements */}
      {bgImage ? (
          <div className="absolute inset-0">
              <img src={bgImage} alt="Hero Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/60"></div>
          </div>
      ) : (
          <div className="absolute inset-0 bg-industrial-light">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] bg-brand-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-accent-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow delay-1000"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* Left Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-brand-100 text-brand-800 text-sm font-bold tracking-wide animate-fade-in-up">
              <Award className="w-4 h-4 text-accent-500" />
              <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">ISO 9001:2015 Certified Manufacturer</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
               {title.split(' ').slice(0, 2).join(' ')} <br/>
               <span className="text-gradient">{title.split(' ').slice(2).join(' ')}</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Button size="lg" variant="primary" onClick={onOpenModal} className="w-full sm:w-auto shadow-brand-500/25">
                {btnPrimary} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="white" onClick={onOpenModal} className="w-full sm:w-auto">
                {btnSecondary}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-200/60 mt-8">
               {[
                 { label: "Factory Direct", icon: FactoryIcon },
                 { label: "Pan-India", icon: Truck },
                 { label: "Custom Sizes", icon: RulerIcon },
                 { label: "Secure", icon: ShieldCheck }
               ].map((item, idx) => (
                 <div key={idx} className="flex flex-col items-center lg:items-start gap-2">
                    <item.icon className="w-6 h-6 text-brand-600" />
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:w-[460px] relative z-10 animate-fade-in-up delay-200">
             {/* Decorative blob behind form */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-3xl blur opacity-20"></div>
            
            <div className="relative glass-card rounded-2xl overflow-hidden p-1">
              <div className="bg-white/50 p-6 md:p-8 rounded-xl">
                <div className="text-center mb-6">
                  <h3 className="text-slate-900 font-bold text-2xl">Get Wholesale Quote</h3>
                  <p className="text-slate-500 text-sm mt-1">Fill the form to get price list instantly</p>
                </div>
                
                <LeadForm />
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                     <ShieldCheck className="w-3 h-3" /> 
                     <span>Your data is 100% secure</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// Simple Icons for local use
const FactoryIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>;
const RulerIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>;

export default Hero;