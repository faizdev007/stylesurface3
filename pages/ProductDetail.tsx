import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CMS } from '../utils/cms';
import { Product } from '../types';
import Button from '../components/ui/Button';
import { Loader2, CheckCircle, ArrowRight, Table, ChevronRight, LayoutGrid, Info, Sparkles } from 'lucide-react';
import ContactSection from '../components/ContactSection';
import SEOHead from '../components/SEOHead';

interface ProductDetailProps {
  onOpenModal: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onOpenModal }) => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'apps'>('desc');

  useEffect(() => {
    const loadProduct = async () => {
        if (!slug) return;
        setLoading(true);
        const data = await CMS.getProductBySlug(slug);
        if (data) {
            setProduct(data);
            setActiveImage(data.image);
        }
        setLoading(false);
    };
    loadProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  
  if (!product) return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Product Not Found</h1>
          <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/"><Button variant="primary">Return Home</Button></Link>
      </div>
  );

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);

  return (
    <>
      <SEOHead seo={{
          title: `${product.name} | StylenSurface`,
          description: product.description,
          keywords: product.category + ', ' + product.name
      }} />
      
      <div className="pt-28 bg-white min-h-screen">
        
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 md:px-6 py-6">
            <div className="inline-flex items-center text-sm font-medium text-slate-500 gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="capitalize">{product.category}</span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-slate-900">{product.name}</span>
            </div>
        </div>

        {/* Product Main Area */}
        <div className="container mx-auto px-4 md:px-6 mb-20">
            <div className="bg-white md:bg-gray-50/50 md:border border-gray-100 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    
                    {/* Left: Gallery */}
                    <div className="p-6 md:p-10 bg-white">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 mb-6 relative group shadow-sm">
                             <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setActiveImage(img)}
                                        className={`w-24 h-24 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all ${activeImage === img ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-100 hover:border-brand-200'}`}
                                    >
                                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="p-6 md:p-10 lg:p-12 flex flex-col bg-white lg:bg-transparent">
                        <div className="mb-6">
                             <span className="bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                                 <Sparkles className="w-3 h-3" /> {product.category}
                             </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">{product.name}</h1>
                        <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
                            {product.description}
                        </p>

                        <div className="space-y-4 mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                             {product.features.slice(0, 4).map((feat, i) => (
                                 <div key={i} className="flex items-start gap-3">
                                     <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                     </div>
                                     <span className="text-slate-700 font-semibold">{feat}</span>
                                 </div>
                             ))}
                        </div>

                        <div className="mt-auto">
                             <div className="flex flex-col sm:flex-row gap-4">
                                 <Button size="lg" variant="primary" onClick={onOpenModal} className="flex-1 justify-center shadow-brand-500/20">
                                     Get Wholesale Quote
                                 </Button>
                                 <Button size="lg" variant="outline" onClick={onOpenModal} className="flex-1 justify-center">
                                     Order Sample
                                 </Button>
                             </div>
                             <p className="text-xs text-slate-400 mt-6 text-center sm:text-left font-medium">
                                 * Minimum Order Quantity (MOQ) applies. Fast shipping across India.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Details Tabs */}
        <div className="container mx-auto px-4 md:px-6 mb-24">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'desc', label: 'Description & Features' },
                        // { id: 'specs', label: 'Technical Specs' },
                        // { id: 'apps', label: 'Applications' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-6 px-8 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-700 hover:bg-gray-50'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8 md:p-12 min-h-[400px]">
                    {activeTab === 'desc' && (
                        <div className="prose max-w-none text-slate-600">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Product Overview</h3>
                            <p className="text-lg leading-relaxed mb-8">{product.description}</p>
                            
                            <h4 className="text-xl font-bold text-slate-900 mb-6">Why choose this product?</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                                        <span className="font-semibold text-slate-700">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <Table className="w-6 h-6 text-brand-500" /> Technical Data
                            </h3>
                            {product.specs && product.specs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {product.specs.map((spec, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg">
                                            <span className="font-semibold text-slate-500">{spec.label}</span>
                                            <span className="font-bold text-slate-900">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Info className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Contact us for detailed technical data sheets (TDS).</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'apps' && (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <LayoutGrid className="w-6 h-6 text-brand-500" /> Suitable Applications
                            </h3>
                            {product.applications && product.applications.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {product.applications.map((app, i) => (
                                        <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all font-bold text-slate-700 flex items-center gap-4 group">
                                            <div className="bg-brand-50 p-2 rounded-lg group-hover:bg-brand-500 transition-colors">
                                                <CheckCircle className="w-5 h-5 text-brand-500 group-hover:text-white" />
                                            </div>
                                            {app}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                     <Info className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                     <p className="text-slate-500">No specific applications listed.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <ContactSection />
      </div>
    </>
  );
};

export default ProductDetail;