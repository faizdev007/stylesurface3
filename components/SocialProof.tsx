
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

// Default placeholders if no images are uploaded
const defaultImages = [
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop', // Instagram Mock
  'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&auto=format&fit=crop', // WhatsApp Mock
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400&auto=format&fit=crop', // Another Mock
  'https://images.unsplash.com/photo-1611162618071-eead6eb8d587?q=80&w=400&auto=format&fit=crop',
];

interface SocialProofProps {
    content?: any;
}

const SocialProof: React.FC<SocialProofProps> = ({ content }) => {
  const title = content?.title || "Don't Just Take Our Word For It";
  const subtitle = content?.subtitle || "See what our clients are saying about us directly on WhatsApp and Instagram.";
  // Support both legacy 'items' (complex objects) and new 'images' (simple strings)
  // We prefer 'images' for the new screenshot slider.
  const images: string[] = content?.images || defaultImages;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Approx card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-24 bg-brand-50 relative overflow-hidden">
       {/* Background Decorative Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
         <div className="absolute top-20 -left-20 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
         <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
       </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Real Client Feedback</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-industrial-dark mt-2 mb-6">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto group">
            {/* Nav Buttons */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-industrial-dark opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-0 hidden md:flex"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-industrial-dark opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-0 hidden md:flex"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Scroll Area */}
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x snap-mandatory hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-[280px] md:w-[320px] snap-center">
                        {/* Phone Mockup Frame */}
                        <div 
                            className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl transform transition-transform duration-300 hover:-translate-y-2 cursor-zoom-in relative group/card border-4 border-gray-800"
                            onClick={() => setLightboxImage(img)}
                        >
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-900 rounded-b-xl z-10"></div>
                            
                            {/* Screen */}
                            <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19] relative">
                                <img 
                                    src={img} 
                                    alt={`Review ${idx + 1}`} 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity transform scale-75 group-hover/card:scale-100">
                                        <ZoomIn className="w-6 h-6 text-brand-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {images.length === 0 && (
                    <div className="w-full text-center py-12 text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-300">
                        No screenshots uploaded yet. Add them from Admin Panel.
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={() => setLightboxImage(null)}>
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
              >
                  <X className="w-8 h-8" />
              </button>
              <img 
                src={lightboxImage} 
                alt="Full review" 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
      )}
    </section>
  );
};

export default SocialProof;
