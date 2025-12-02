import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../types';

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Production Manager",
    company: "Urban Furniture Ltd.",
    content: "We have been procuring Ubuntu sheets for our modular kitchens for 2 years. The moisture resistance and finish are top-notch. Highly recommended for bulk buyers.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Sarah Pinto",
    role: "Interior Designer",
    company: "Design Studio X",
    content: "Their clear acrylic sheets are perfect for the high-end signage projects we handle. Delivery is always on time in Mumbai, which is crucial for our deadlines.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Amit Verma",
    role: "Purchase Head",
    company: "Industrial Solutions",
    content: "Excellent cork sheets for our industrial gasket requirements. Very consistent density and pricing is competitive compared to other suppliers in the market.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/85.jpg"
  }
];

interface TestimonialsProps {
  content?: any;
}

const Testimonials: React.FC<TestimonialsProps> = ({ content }) => {
  const title = content?.title || "Trusted by Professionals";
  const subtitle = content?.subtitle || "Join over 500+ businesses who trust StylenSurface for their material needs.";
  const items = content?.items || defaultTestimonials;

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item: Testimonial) => (
            <div key={item.id} className="bg-industrial-light/30 p-8 rounded-3xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative group">
              <div className="absolute top-8 right-8 text-brand-200 group-hover:text-brand-100 transition-colors transform scale-150 opacity-50">
                   <Quote className="w-10 h-10 fill-current" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-accent-500 fill-accent-500' : 'text-gray-200'}`} />
                ))}
              </div>
              
              <p className="text-slate-700 text-lg leading-relaxed relative z-10 font-medium mb-8">"{item.content}"</p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md" />
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-wide">{item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;