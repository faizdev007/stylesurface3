import React from 'react';
import { Factory, Clock, Users, Ruler, MapPin, Award } from 'lucide-react';

const defaultFeatures = [
  { icon: Factory, title: "Manufacturer Direct", desc: "No middlemen, get factory prices." },
  { icon: Clock, title: "10+ Years Experience", desc: "Expertise in sheet manufacturing." },
  { icon: Users, title: "500+ Happy Clients", desc: "Trusted by top furniture brands." },
  { icon: Ruler, title: "Custom Sizes", desc: "Cut-to-size service available." },
  { icon: MapPin, title: "Pan-India Delivery", desc: "Fast logistics partner network." },
  { icon: Award, title: "ISO 9001 Certified", desc: "Guaranteed quality standards." },
];

const iconMap: any = { Factory, Clock, Users, Ruler, MapPin, Award };

interface TrustSectionProps {
    content?: any;
}

const TrustSection: React.FC<TrustSectionProps> = ({ content }) => {
  const features = content?.features || defaultFeatures;
  const title = content?.title || "Why Industry Leaders Choose Us";

  return (
    <section className="py-24 bg-industrial-light relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">{title}</h2>
          <div className="w-20 h-1.5 bg-brand-500 mx-auto rounded-full opacity-80"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {features.map((feature: any, idx: number) => {
             const IconComponent = typeof feature.icon === 'string' ? (iconMap[feature.icon] || Award) : feature.icon;
             
             return (
                <div key={idx} className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 hover:-translate-y-2">
                    <div className="bg-brand-50 p-4 rounded-xl mb-4 group-hover:bg-brand-500 transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-snug">{feature.desc}</p>
                </div>
             );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;