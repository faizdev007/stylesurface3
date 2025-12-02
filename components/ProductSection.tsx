import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Table, Eye, Sparkles } from 'lucide-react';
import Button from './ui/Button';
import { Product } from '../types';
import { useContent } from '../utils/content';
import { CMS } from '../utils/cms';
import { Link } from 'react-router-dom';

interface ProductSectionProps {
  onOpenModal: () => void;
  content?: any;
}

const ProductSection: React.FC<ProductSectionProps> = ({ onOpenModal, content: propContent }) => {
  const { content: defaultContent } = useContent();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
        const data = await CMS.getProducts();
        setProducts(data);
    };
    fetchProducts();
  }, []);

  const title = propContent?.title || defaultContent.home.productTitle;
  const subtitle = propContent?.subtitle || defaultContent.home.productSubtitle;

  return (
    <section id="products" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider mb-4">
             <Sparkles className="w-3 h-3" /> Our Range
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{title}</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-500 flex flex-col overflow-hidden border border-gray-100 hover:border-brand-100">
              {/* Image Area */}
              <div className="relative h-64 overflow-hidden bg-gray-50">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="absolute top-4 left-4">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">{product.category}</span>
                </div>
                
                <Link to={`/product/${product.slug}`} className="absolute bottom-4 right-4 bg-white text-slate-900 p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-500 hover:text-white">
                    <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                  {product.description}
                </p>
                
                <div className="mb-6 space-y-2 bg-gray-50/50 p-3 rounded-xl">
                  {/* Prioritize Features, if not available, show top 2 specs */}
                  {product.features && product.features.length > 0 ? (
                      product.features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                          {feature}
                        </div>
                      ))
                  ) : (
                      product.specs?.slice(0, 2).map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                          <span className="text-slate-400">{spec.label}:</span> {spec.value}
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-auto flex gap-3">
                  <Link to={`/product/${product.slug}`} className="flex-1">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        fullWidth 
                        className="bg-white hover:bg-gray-50 border-gray-200"
                      >
                        Details
                      </Button>
                  </Link>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="flex-1"
                    onClick={onOpenModal}
                  >
                    Quote
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center bg-gradient-to-br from-brand-900 to-brand-800 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-2xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Need something specific?</h3>
            <p className="text-brand-100 mb-8 text-lg">We offer custom manufacturing services for specific industrial requirements, including bespoke sizes and material compositions.</p>
            <Button variant="white" size="lg" onClick={onOpenModal} className="text-brand-900 font-bold border-none shadow-xl">
              Request Custom Catalog
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;