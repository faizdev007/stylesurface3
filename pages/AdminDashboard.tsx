
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Save, LogOut, Code, Layout, FileText, Copy, Trash2, Plus, Globe, Settings, Image as ImageIcon, Menu as MenuIcon, MapPin, Box, X, Check, Upload, Table, ChevronDown, ChevronUp, Users, RefreshCw, Zap, Database, Edit3, MessageCircle, Link as LinkIcon, Images, Mail, Cloud, Key, ExternalLink, HelpCircle } from 'lucide-react';
import { CMS, getInitialSectionsForTemplate } from '../utils/cms';
import { CMSPage, MenuStructure, Product, MediaItem, Lead, GlobalSettings, PageSection } from '../types';
import { syncLeadToCRM, exchangeZohoAuthCode } from '../utils/crm';

// --- Sub-component: Status Indicator ---
const StatusIndicator = ({ status }: { status: { status: string, message: string } }) => {
    if (status.status === 'ok') return <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-green-200"><Check className="w-3 h-3" /> {status.message}</span>;
    if (status.status === 'error') return <span className="ml-auto text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-red-200"><X className="w-3 h-3" /> {status.message}</span>;
    return <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold border border-gray-200">{status.message}</span>;
};

// --- Sub-component: Image Picker Modal ---
interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            CMS.getMedia().then(setMedia);
        }
    }, [isOpen]);

    const handleAddUrl = async () => {
        if (!newUrl) return;
        await CMS.saveMedia({
            id: crypto.randomUUID(),
            name: 'Imported URL',
            type: 'image',
            url: newUrl
        });
        const m = await CMS.getMedia();
        setMedia(m);
        setNewUrl('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 800000) { 
            alert("File too large. Please use images under 800KB for now, or use external URLs.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            await CMS.saveMedia({
                id: crypto.randomUUID(),
                name: file.name,
                type: 'image',
                url: base64
            });
            const m = await CMS.getMedia();
            setMedia(m);
        };
        reader.readAsDataURL(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-industrial-dark">Select Image</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                <div className="p-4 border-b bg-white space-y-3">
                    {/* Upload Buttons */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Paste image URL..." 
                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                            <Button size="sm" onClick={handleAddUrl} variant="secondary">Add URL</Button>
                        </div>
                        <div className="w-px bg-gray-300 mx-2"></div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} variant="primary">
                            <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {media.map(item => (
                            <div key={item.id} className="group relative aspect-square rounded-lg border-2 border-transparent hover:border-brand-500 overflow-hidden cursor-pointer shadow-sm bg-white" onClick={() => { onSelect(item.url); onClose(); }}>
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.name}
                                </div>
                            </div>
                        ))}
                    </div>
                    {media.length === 0 && <p className="text-center text-gray-400 py-8">No images in library.</p>}
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pages' | 'products' | 'menu' | 'media' | 'code' | 'leads' | 'integrations'>('pages');
  const [saved, setSaved] = useState(false);

  // Data State
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [menus, setMenus] = useState<MenuStructure>({ header: [], footer: [] });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  
  // Validation State
  const [integrationStatus, setIntegrationStatus] = useState({
    zoho: { status: 'inactive', message: 'Disabled' },
    smtp: { status: 'inactive', message: 'Disabled' },
    zapier: { status: 'inactive', message: 'Not Configured' }
  });

  const [scripts, setScripts] = useState({ header: '', footer: '' });
  
  // Editor State
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Image Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState<(url: string) => void>(() => {});
  
  // Zoho Auth Modal State
  const [isZohoAuthOpen, setIsZohoAuthOpen] = useState(false);
  const [zohoAuthCode, setZohoAuthCode] = useState('');
  const [zohoLoading, setZohoLoading] = useState(false);

  // Ref for main media tab upload
  const mediaTabInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setPages(await CMS.getPages());
    setProducts(await CMS.getProducts());
    setMedia(await CMS.getMedia());
    setMenus(await CMS.getMenus());
    setLeads(await CMS.getLeads());
    
    // Load settings and validate
    const s = await CMS.getSettings();
    setSettings(s);
    validateSettings(s);

    setScripts({
        header: localStorage.getItem('site_header_code') || '',
        footer: localStorage.getItem('site_footer_code') || ''
    });
  };

  const validateSettings = (s: GlobalSettings) => {
      const status = {
          zoho: { status: 'inactive', message: 'Disabled' },
          smtp: { status: 'inactive', message: 'Disabled' },
          zapier: { status: 'inactive', message: 'Not Configured' }
      };

      // Zoho Check
      if (s.integrations?.zoho?.enabled) {
          const { clientId, clientSecret, refreshToken } = s.integrations.zoho;
          if (!clientId || !clientSecret || !refreshToken) {
              status.zoho = { status: 'error', message: 'Missing Credentials' };
          } else {
              status.zoho = { status: 'ok', message: 'Active' };
          }
      }

      // SMTP Check
      if (s.integrations?.smtp?.enabled) {
          const { user, pass, toEmail } = s.integrations.smtp;
          if (!user || !pass || !toEmail) {
               status.smtp = { status: 'error', message: 'Missing Config' };
          } else {
               status.smtp = { status: 'ok', message: 'Active' };
          }
      }

      // Zapier Check
      if (s.integrations?.zapierWebhook && s.integrations.zapierWebhook.length > 5) {
           status.zapier = { status: 'ok', message: 'Connected' };
      }

      setIntegrationStatus(status);
  };

  // Helper to open image picker for any field
  const openPicker = (callback: (url: string) => void) => {
      setPickerCallback(() => callback);
      setIsPickerOpen(true);
  };

  // --- Page Handlers ---
  const handleCreatePage = async (template: 'home' | 'content' | 'product' | 'location' = 'content') => {
    try {
        const titleMap = {
            'home': 'New Landing Page',
            'content': 'New Generic Page',
            'product': 'New Product Landing',
            'location': 'New Location Page'
        };
        const newPage: CMSPage = {
          id: crypto.randomUUID(),
          title: titleMap[template],
          slug: `/new-page-${Date.now()}`,
          template: template,
          isPublished: false,
          updatedAt: new Date().toISOString(),
          seo: { title: titleMap[template], description: '', keywords: '' },
          // Pre-populate sections if Home/Landing template is chosen so editor isn't empty
          sections: getInitialSectionsForTemplate(template)
        };
        await CMS.savePage(newPage);
        await loadData();
        setEditingPage(newPage);
    } catch (err) {
        console.error(err);
        alert("Failed to create page. Please check console for details.");
    }
  };

  const handleDuplicate = async (id: string) => {
    await CMS.duplicatePage(id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure? This cannot be undone.')) {
        await CMS.deletePage(id);
        loadData();
        if(editingPage?.id === id) setEditingPage(null);
    }
  };

  const handleSavePage = async () => {
    if (editingPage) {
      await CMS.savePage(editingPage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadData();
    }
  };

  // --- Section Editing Helper ---
  const updatePageSection = (sectionId: string, contentUpdate: any) => {
      if (!editingPage) return;
      const sections = editingPage.sections || [];
      const index = sections.findIndex(s => s.id === sectionId);
      
      let newSections = [...sections];
      
      if (index === -1) {
          // If section doesn't exist, create it. Type inferred from ID for now (simple logic)
          let type: any = 'text';
          if(sectionId === 'hero') type = 'hero';
          if(sectionId === 'products') type = 'product-grid';
          if(sectionId === 'applications') type = 'gallery';
          if(sectionId === 'testimonials') type = 'features';
          if(sectionId === 'faq') type = 'text';
          if(sectionId === 'location-content') type = 'location-content';
          if(sectionId === 'main-content') type = 'html';
          if(sectionId === 'product-hero') type = 'hero';
          if(sectionId === 'product-features') type = 'features';
          if(sectionId === 'social-proof') type = 'text';
          
          newSections.push({
              id: sectionId,
              type: type,
              content: contentUpdate
          });
      } else {
          newSections[index] = {
              ...newSections[index],
              content: { ...newSections[index].content, ...contentUpdate }
          };
      }
      setEditingPage({ ...editingPage, sections: newSections });
  };
  
  const getSectionContent = (id: string) => {
      return editingPage?.sections?.find(s => s.id === id)?.content || {};
  };

  // --- Product Handlers ---
  const handleCreateProduct = () => {
      const newProd: Product = {
          id: crypto.randomUUID(),
          name: 'New Product',
          category: 'acrylic',
          description: '',
          features: ['Feature 1', 'Feature 2'],
          specs: [],
          image: '',
          gallery: [],
          applications: []
      };
      setEditingProduct(newProd);
  };

  const handleSaveProduct = async () => {
      if (editingProduct) {
          const res = await CMS.saveProduct(editingProduct);
          if (res.error) {
              alert("Failed to save product. Check console or ensure ID format is UUID.");
          } else {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
              await loadData();
              setEditingProduct(null);
          }
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if(window.confirm('Delete this product?')) {
          await CMS.deleteProduct(id);
          loadData();
      }
  };

  const handleAddSpec = () => {
      if (!editingProduct) return;
      const currentSpecs = editingProduct.specs || [];
      setEditingProduct({
          ...editingProduct,
          specs: [...currentSpecs, { label: '', value: '' }]
      });
  };

  const handleUpdateSpec = (idx: number, field: 'label' | 'value', value: string) => {
      if (!editingProduct || !editingProduct.specs) return;
      const updatedSpecs = [...editingProduct.specs];
      updatedSpecs[idx] = { ...updatedSpecs[idx], [field]: value };
      setEditingProduct({...editingProduct, specs: updatedSpecs});
  };

  const handleDeleteSpec = (idx: number) => {
      if (!editingProduct || !editingProduct.specs) return;
      const updatedSpecs = [...editingProduct.specs];
      updatedSpecs.splice(idx, 1);
      setEditingProduct({...editingProduct, specs: updatedSpecs});
  };

  const handleAddFeature = () => {
      if (!editingProduct) return;
      const current = editingProduct.features || [];
      setEditingProduct({ ...editingProduct, features: [...current, ''] });
  };
  
  const handleUpdateFeature = (idx: number, val: string) => {
      if (!editingProduct || !editingProduct.features) return;
      const updated = [...editingProduct.features];
      updated[idx] = val;
      setEditingProduct({ ...editingProduct, features: updated });
  };
  
  const handleDeleteFeature = (idx: number) => {
      if (!editingProduct || !editingProduct.features) return;
      const updated = [...editingProduct.features];
      updated.splice(idx, 1);
      setEditingProduct({ ...editingProduct, features: updated });
  };

  // --- Media Handlers ---
  const handleDeleteMedia = async (id: string) => {
      if(window.confirm('Delete this image?')) {
          await CMS.deleteMedia(id);
          loadData();
      }
  };
  
  const handleAddMediaDirect = async (url: string) => {
     if(!url) return;
     await CMS.saveMedia({
         id: crypto.randomUUID(),
         name: 'Imported Image',
         type: 'image',
         url: url
     });
     loadData();
  };

  const handleTabFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 800000) { 
        alert("File too large (>800KB). Use a smaller file or a URL.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await CMS.saveMedia({
            id: crypto.randomUUID(),
            name: file.name,
            type: 'image',
            url: base64
        });
        loadData();
    };
    reader.readAsDataURL(file);
  };

  // --- Menu Handlers ---
  const handleMenuChange = (type: 'header' | 'footer', idx: number, field: string, value: string) => {
      const updated = { ...menus };
      (updated[type][idx] as any)[field] = value;
      setMenus(updated);
  };

  const handleAddMenuItem = (type: 'header' | 'footer') => {
      const updated = { ...menus };
      updated[type].push({ id: crypto.randomUUID(), label: 'New Link', url: '/' });
      setMenus(updated);
  };

  const handleDeleteMenuItem = (type: 'header' | 'footer', idx: number) => {
      const updated = { ...menus };
      updated[type].splice(idx, 1);
      setMenus(updated);
  };

  const handleSaveMenus = async () => {
      await CMS.saveMenus(menus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  };

  // --- Integration Handlers ---
  const handleSaveIntegrations = async () => {
      if (!settings) return;
      validateSettings(settings);
      await CMS.saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  };
  
  const handleSyncLead = async (lead: Lead) => {
      if(window.confirm("Push this lead to Configured CRM (Zoho/Zapier)?")) {
          const res = await syncLeadToCRM(lead);
          if(res.success) alert("Synced Successfully");
          else alert("Sync Failed: " + (res.message || "Check console"));
      }
  };
  
  const handleGenerateZohoToken = async () => {
      if (!zohoAuthCode) return;
      setZohoLoading(true);
      
      const res = await exchangeZohoAuthCode(zohoAuthCode);
      if (res.success && res.refresh_token) {
          setSettings(prev => {
              if(!prev) return null;
              const oldZoho = prev.integrations?.zoho || { enabled: true };
              const newSettings = {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, refreshToken: res.refresh_token}} as any};
              validateSettings(newSettings);
              return newSettings;
          });
          alert("Success! Refresh Token generated. Please click 'Save Integration Settings' to persist it.");
          setIsZohoAuthOpen(false);
          setZohoAuthCode('');
      } else {
          alert("Failed to generate token: " + (res.message || "Unknown Error. Check Console."));
      }
      setZohoLoading(false);
  };

  // --- Seed Data Handler ---
  const handleSeedData = async () => {
      if(window.confirm("This will push all the default Demo Data (Home Page Content, Products, Menus) into the Database. This is required to edit the Home Page. Continue?")) {
          const success = await CMS.seedInitialData();
          if (success) {
              alert("Demo Data Synced to Database! You can now edit the Home Page.");
              loadData();
          }
      }
  };

  // --- Script Handler ---
  const handleSaveScripts = () => {
      localStorage.setItem('site_header_code', scripts.header);
      localStorage.setItem('site_footer_code', scripts.footer);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col h-screen overflow-hidden">
      {/* Admin Nav */}
      <nav className="bg-industrial-dark shadow-md border-b border-gray-800 px-4 md:px-6 py-3 shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <div className="bg-brand-500 p-1.5 rounded text-white">
               <Settings className="w-5 h-5" />
            </div>
            <span>StylenCMS</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-1">
                <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'pages' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <FileText className="w-4 h-4" /> Pages
                </button>
                <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'products' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Box className="w-4 h-4" /> Products
                </button>
                <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'menu' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <MenuIcon className="w-4 h-4" /> Menus
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'leads' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Users className="w-4 h-4" /> Leads
                </button>
                <button onClick={() => setActiveTab('integrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'integrations' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Zap className="w-4 h-4" /> CRM / API
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'media' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ImageIcon className="w-4 h-4" /> Media
                </button>
                <button onClick={() => setActiveTab('code')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'code' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Code className="w-4 h-4" /> Scripts
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 relative">
            
            {/* --- PAGES TAB --- */}
            {activeTab === 'pages' && !editingPage && (
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-industrial-dark">Pages</h2>
                        <div className="group relative">
                             <Button size="sm"><Plus className="w-4 h-4 mr-2"/> Add New Page</Button>
                             <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg w-48 z-10">
                                 <button onClick={() => handleCreatePage('content')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Generic Content Page</button>
                                 <button onClick={() => handleCreatePage('home')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Home / Landing Page</button>
                                 <button onClick={() => handleCreatePage('product')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Product Landing</button>
                                 <button onClick={() => handleCreatePage('location')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Location Page</button>
                             </div>
                        </div>
                    </div>
                    {pages.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center mb-6">
                             <p className="text-yellow-800 mb-4 font-semibold">No pages found in database.</p>
                             <Button onClick={handleSeedData} variant="accent">Initialize with Default Home Page</Button>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-500">Title</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">Slug</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">Template</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pages.map(page => (
                                    <tr key={page.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{page.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs uppercase font-bold">{page.template}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setEditingPage(page)} className="text-brand-600 hover:text-brand-800 font-medium text-xs">Edit</button>
                                            <button onClick={() => handleDuplicate(page.id)} className="text-gray-400 hover:text-brand-600" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(page.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- PAGE EDITOR --- */}
            {activeTab === 'pages' && editingPage && (
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 bg-white z-20 shadow-sm">
                        <h3 className="font-bold text-lg">Editing: {editingPage.title}</h3>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setEditingPage(null)}>Cancel</Button>
                            <Button variant="primary" size="sm" onClick={handleSavePage}>
                                {saved ? 'Saved!' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-8 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Page Title</label>
                                <input type="text" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                                <input type="text" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} className="w-full border p-2 rounded font-mono text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEO Description</label>
                                <textarea value={editingPage.seo.description} onChange={e => setEditingPage({...editingPage, seo: {...editingPage.seo, description: e.target.value}})} className="w-full border p-2 rounded text-sm" />
                            </div>
                        </div>

                        {/* --- CONTENT EDITOR SWITCHER --- */}

                        {/* 1. HOME / LANDING TEMPLATE EDITOR */}
                        {editingPage.template === 'home' && (
                            <div className="space-y-6">
                                <h4 className="font-bold text-lg border-b pb-2">Page Content (Sections)</h4>
                                
                                {/* Hero Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Hero Section</h5>
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Title" value={getSectionContent('hero').title || ''} onChange={(e) => updatePageSection('hero', {title: e.target.value})} className="w-full border p-2 rounded" />
                                        <textarea placeholder="Subtitle" value={getSectionContent('hero').subtitle || ''} onChange={(e) => updatePageSection('hero', {subtitle: e.target.value})} className="w-full border p-2 rounded" />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Primary Button" value={getSectionContent('hero').btnPrimary || ''} onChange={(e) => updatePageSection('hero', {btnPrimary: e.target.value})} className="w-1/2 border p-2 rounded" />
                                            <input type="text" placeholder="Secondary Button" value={getSectionContent('hero').btnSecondary || ''} onChange={(e) => updatePageSection('hero', {btnSecondary: e.target.value})} className="w-1/2 border p-2 rounded" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <div className="text-xs font-bold text-gray-500">Background Image:</div>
                                             <Button size="sm" variant="outline" onClick={() => openPicker(url => updatePageSection('hero', { bgImage: url }))}>Select Image</Button>
                                             {getSectionContent('hero').bgImage && <span className="text-xs text-green-600 flex items-center"><Check className="w-3 h-3"/> Selected</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Trust Section</h5>
                                    <input type="text" placeholder="Section Title" value={getSectionContent('trust').title || ''} onChange={(e) => updatePageSection('trust', {title: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                </div>
                                
                                {/* About Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">About Section</h5>
                                    <input type="text" placeholder="Title" value={getSectionContent('about').title || ''} onChange={(e) => updatePageSection('about', {title: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                    <textarea placeholder="Description Text" value={getSectionContent('about').text || ''} onChange={(e) => updatePageSection('about', {text: e.target.value})} className="w-full border p-2 rounded h-24 mb-2" />
                                     <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openPicker(url => updatePageSection('about', { image: url }))}>Select Section Image</Button>
                                    </div>
                                </div>

                                {/* Applications Section (List) */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Applications Gallery</h5>
                                    <input type="text" placeholder="Section Title" value={getSectionContent('applications').title || ''} onChange={(e) => updatePageSection('applications', {title: e.target.value})} className="w-full border p-2 rounded mb-4" />
                                    
                                    <div className="space-y-4">
                                        {(getSectionContent('applications').items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-3 items-center bg-white p-2 rounded border border-gray-100">
                                                <div className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden rounded">
                                                    <img src={item.img} className="w-full h-full object-cover"/>
                                                </div>
                                                <input type="text" value={item.title} onChange={(e) => {
                                                    const items = [...(getSectionContent('applications').items || [])];
                                                    items[idx] = {...items[idx], title: e.target.value};
                                                    updatePageSection('applications', {items});
                                                }} className="flex-1 border p-1 rounded text-sm"/>
                                                
                                                <button onClick={() => openPicker(url => {
                                                    const items = [...(getSectionContent('applications').items || [])];
                                                    items[idx] = {...items[idx], img: url};
                                                    updatePageSection('applications', {items});
                                                })} className="p-1 hover:bg-gray-100 rounded text-xs text-brand-600">Change Img</button>

                                                <button onClick={() => {
                                                    const items = [...(getSectionContent('applications').items || [])];
                                                    items.splice(idx, 1);
                                                    updatePageSection('applications', {items});
                                                }} className="p-1 hover:bg-red-50 rounded text-red-500"><X className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="secondary" onClick={() => {
                                            const items = [...(getSectionContent('applications').items || [])];
                                            items.push({title: 'New Application', img: 'https://via.placeholder.com/300'});
                                            updatePageSection('applications', {items});
                                        }}>+ Add Application</Button>
                                    </div>
                                </div>

                                {/* Testimonials Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Testimonials</h5>
                                    <input type="text" placeholder="Section Title" value={getSectionContent('testimonials').title || ''} onChange={(e) => updatePageSection('testimonials', {title: e.target.value})} className="w-full border p-2 rounded mb-4" />
                                    
                                    <div className="space-y-4">
                                        {(getSectionContent('testimonials').items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded border border-gray-100 space-y-2">
                                                 <div className="flex gap-2">
                                                     <input type="text" placeholder="Name" value={item.name} onChange={(e) => {
                                                        const items = [...(getSectionContent('testimonials').items || [])];
                                                        items[idx] = {...items[idx], name: e.target.value};
                                                        updatePageSection('testimonials', {items});
                                                     }} className="w-1/3 border p-1 rounded text-sm"/>
                                                      <input type="text" placeholder="Role/Company" value={item.role} onChange={(e) => {
                                                        const items = [...(getSectionContent('testimonials').items || [])];
                                                        items[idx] = {...items[idx], role: e.target.value};
                                                        updatePageSection('testimonials', {items});
                                                     }} className="w-1/3 border p-1 rounded text-sm"/>
                                                     <button onClick={() => {
                                                        const items = [...(getSectionContent('testimonials').items || [])];
                                                        items.splice(idx, 1);
                                                        updatePageSection('testimonials', {items});
                                                    }} className="p-1 hover:bg-red-50 rounded text-red-500 ml-auto"><X className="w-4 h-4"/></button>
                                                 </div>
                                                 <textarea placeholder="Review Content" value={item.content} onChange={(e) => {
                                                        const items = [...(getSectionContent('testimonials').items || [])];
                                                        items[idx] = {...items[idx], content: e.target.value};
                                                        updatePageSection('testimonials', {items});
                                                 }} className="w-full border p-1 rounded text-sm h-16"/>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="secondary" onClick={() => {
                                            const items = [...(getSectionContent('testimonials').items || [])];
                                            items.push({name: 'New Reviewer', role: 'Customer', content: 'Great service!', rating: 5, image: 'https://via.placeholder.com/100'});
                                            updatePageSection('testimonials', {items});
                                        }}>+ Add Testimonial</Button>
                                    </div>
                                </div>
                                
                                {/* Social Proof (WhatsApp Screenshots) Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp / Review Screenshots
                                    </h5>
                                    <input type="text" placeholder="Section Title" value={getSectionContent('social-proof').title || ''} onChange={(e) => updatePageSection('social-proof', {title: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                    <textarea placeholder="Subtitle" value={getSectionContent('social-proof').subtitle || ''} onChange={(e) => updatePageSection('social-proof', {subtitle: e.target.value})} className="w-full border p-2 rounded h-16 mb-4" />
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                        {/* Use 'images' array for screenshots */}
                                        {(getSectionContent('social-proof').images || []).map((img: string, idx: number) => (
                                            <div key={idx} className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden aspect-[9/16]">
                                                <img src={img} alt="review" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        onClick={() => {
                                                            const images = [...(getSectionContent('social-proof').images || [])];
                                                            images.splice(idx, 1);
                                                            updatePageSection('social-proof', {images});
                                                        }}
                                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => openPicker(url => {
                                                const images = [...(getSectionContent('social-proof').images || [])];
                                                images.push(url);
                                                updatePageSection('social-proof', {images});
                                            })}
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-brand-500 hover:bg-brand-50 transition-colors aspect-[9/16]"
                                        >
                                            <Plus className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 text-center">Add Review Screenshot</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">Recommended format: Portrait screenshots (Mobile View)</p>
                                </div>

                                {/* FAQ Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">FAQs</h5>
                                    <input type="text" placeholder="Section Title" value={getSectionContent('faq').title || ''} onChange={(e) => updatePageSection('faq', {title: e.target.value})} className="w-full border p-2 rounded mb-4" />
                                    <div className="space-y-3">
                                        {(getSectionContent('faq').items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded border border-gray-100 space-y-2">
                                                <input type="text" placeholder="Question" value={item.question} onChange={(e) => {
                                                    const items = [...(getSectionContent('faq').items || [])];
                                                    items[idx] = {...items[idx], question: e.target.value};
                                                    updatePageSection('faq', {items});
                                                }} className="w-full border p-1 rounded text-sm font-semibold"/>
                                                <textarea placeholder="Answer" value={item.answer} onChange={(e) => {
                                                    const items = [...(getSectionContent('faq').items || [])];
                                                    items[idx] = {...items[idx], answer: e.target.value};
                                                    updatePageSection('faq', {items});
                                                }} className="w-full border p-1 rounded text-sm h-16"/>
                                                <button onClick={() => {
                                                    const items = [...(getSectionContent('faq').items || [])];
                                                    items.splice(idx, 1);
                                                    updatePageSection('faq', {items});
                                                }} className="text-xs text-red-500 underline">Remove FAQ</button>
                                            </div>
                                        ))}
                                         <Button size="sm" variant="secondary" onClick={() => {
                                            const items = [...(getSectionContent('faq').items || [])];
                                            items.push({question: 'New Question?', answer: 'New Answer'});
                                            updatePageSection('faq', {items});
                                        }}>+ Add FAQ</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. GENERIC CONTENT TEMPLATE */}
                        {editingPage.template === 'content' && (
                            <div>
                                <h4 className="font-bold text-lg mb-4">Body Content</h4>
                                <div className="text-xs text-gray-500 mb-2">Supports HTML. Use classes like `text-xl font-bold` for styling.</div>
                                <textarea 
                                    className="w-full h-96 border border-gray-300 rounded-lg p-4 font-mono text-sm"
                                    value={getSectionContent('main-content').html || ''}
                                    onChange={(e) => updatePageSection('main-content', {html: e.target.value})}
                                    placeholder="<p>Write your content here...</p>"
                                />
                            </div>
                        )}
                        
                        {/* 3. LOCATION PAGE TEMPLATE */}
                        {editingPage.template === 'location' && (
                             <div>
                                <h4 className="font-bold text-lg mb-4">Location Settings</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City Name</label>
                                        <input type="text" value={getSectionContent('location-content').city || ''} onChange={(e) => updatePageSection('location-content', {city: e.target.value})} className="w-full border p-2 rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highlight Text</label>
                                        <textarea value={getSectionContent('location-content').highlight || ''} onChange={(e) => updatePageSection('location-content', {highlight: e.target.value})} className="w-full border p-2 rounded" />
                                    </div>
                                </div>
                             </div>
                        )}

                        {/* 4. PRODUCT LANDING TEMPLATE */}
                         {editingPage.template === 'product' && (
                             <div className="space-y-6">
                                <h4 className="font-bold text-lg mb-4">Product Landing Configuration</h4>
                                
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Hero Section</h5>
                                    <input type="text" placeholder="Custom Title (Overrides Page Title)" value={getSectionContent('product-hero').title || ''} onChange={(e) => updatePageSection('product-hero', {title: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                    <textarea placeholder="Subtitle" value={getSectionContent('product-hero').subtitle || ''} onChange={(e) => updatePageSection('product-hero', {subtitle: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openPicker(url => updatePageSection('product-hero', { bgImage: url }))}>Select Hero Background</Button>
                                        {getSectionContent('product-hero').bgImage && <span className="text-xs text-green-600">Image Selected</span>}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h5 className="font-bold text-sm text-gray-700 mb-3">Feature Bullets</h5>
                                    <textarea placeholder="Intro Text" value={getSectionContent('product-features').text || ''} onChange={(e) => updatePageSection('product-features', {text: e.target.value})} className="w-full border p-2 rounded mb-2" />
                                    <div className="space-y-2">
                                        {(getSectionContent('product-features').items || []).map((item: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                 <input type="text" value={item} onChange={(e) => {
                                                    const items = [...(getSectionContent('product-features').items || [])];
                                                    items[idx] = e.target.value;
                                                    updatePageSection('product-features', {items});
                                                }} className="flex-1 border p-1 rounded text-sm"/>
                                                <button onClick={() => {
                                                    const items = [...(getSectionContent('product-features').items || [])];
                                                    items.splice(idx, 1);
                                                    updatePageSection('product-features', {items});
                                                }} className="text-red-500"><X className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                         <Button size="sm" variant="secondary" onClick={() => {
                                            const items = [...(getSectionContent('product-features').items || [])];
                                            items.push('New Feature');
                                            updatePageSection('product-features', {items});
                                        }}>+ Add Bullet</Button>
                                    </div>
                                </div>
                             </div>
                        )}

                    </div>
                </div>
            )}
            
            {/* --- LEADS, INTEGRATIONS, MEDIA, CODE TABS --- */}
            {activeTab === 'leads' && (
                 <div className="max-w-5xl mx-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-industrial-dark">Leads & Enquiries</h2>
                        <Button variant="secondary" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                  <tr>
                                      <th className="px-6 py-4 font-bold text-gray-500">Date</th>
                                      <th className="px-6 py-4 font-bold text-gray-500">Name</th>
                                      <th className="px-6 py-4 font-bold text-gray-500">Phone</th>
                                      <th className="px-6 py-4 font-bold text-gray-500">Requirement</th>
                                      <th className="px-6 py-4 font-bold text-gray-500 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {leads.map(lead => (
                                      <tr key={lead.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 font-medium">{lead.full_name} <span className="text-xs text-gray-400 block">{lead.user_type}</span></td>
                                          <td className="px-6 py-4 text-gray-600 font-mono">{lead.phone}</td>
                                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={lead.requirement}>{lead.requirement}</td>
                                          <td className="px-6 py-4 text-right">
                                              <button onClick={() => handleSyncLead(lead)} className="text-brand-600 hover:text-brand-800 text-xs font-bold flex items-center justify-end gap-1 ml-auto">
                                                  <Zap className="w-3 h-3" /> Sync CRM
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                                  {leads.length === 0 && (
                                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">No leads found yet.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                 </div>
            )}
            
            {activeTab === 'integrations' && (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-industrial-dark mb-6">Integrations & Settings</h2>
                    
                    <div className="space-y-6">
                        
                        {/* Zoho CRM Direct Integration (Secure) */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-500" /> Zoho CRM (Direct Integration)</h3>
                                <StatusIndicator status={integrationStatus.zoho} />
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Securely sync leads to Zoho CRM without Zapier. <br/>Requires a <strong>Self Client</strong> setup in <a href="https://api-console.zoho.com" target="_blank" className="text-brand-600 underline">Zoho Developer Console</a>.</p>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <input 
                                    type="checkbox" 
                                    id="enableZoho"
                                    checked={settings?.integrations?.zoho?.enabled || false}
                                    onChange={(e) => setSettings(prev => {
                                        if(!prev) return null;
                                        const oldZoho = prev.integrations?.zoho || { clientId: '', clientSecret: '', refreshToken: '', domain: 'in', enabled: false };
                                        return {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, enabled: e.target.checked}} as any}
                                    })}
                                    className="rounded text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="enableZoho" className="text-sm font-bold text-industrial-dark">Enable Zoho CRM Sync</label>
                            </div>
                            
                            <div className={`space-y-4 ${!settings?.integrations?.zoho?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domain</label>
                                        <select 
                                            value={settings?.integrations?.zoho?.domain || 'in'}
                                            onChange={(e) => setSettings(prev => {
                                                if(!prev) return null;
                                                const oldZoho = prev.integrations?.zoho || { enabled: true };
                                                return {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, domain: e.target.value}} as any}
                                            })}
                                            className="w-full border p-2 rounded text-sm"
                                        >
                                            <option value="in">.in (India)</option>
                                            <option value="com">.com (US/Global)</option>
                                            <option value="eu">.eu (Europe)</option>
                                            <option value="au">.au (Australia)</option>
                                        </select>
                                     </div>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client ID</label>
                                    <input 
                                        type="text" 
                                        value={settings?.integrations?.zoho?.clientId || ''} 
                                        onChange={(e) => setSettings(prev => {
                                            if(!prev) return null;
                                            const oldZoho = prev.integrations?.zoho || { enabled: true };
                                            return {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, clientId: e.target.value}} as any}
                                        })}
                                        className="w-full border p-2 rounded text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Secret</label>
                                    <input 
                                        type="password" 
                                        value={settings?.integrations?.zoho?.clientSecret || ''} 
                                        onChange={(e) => setSettings(prev => {
                                            if(!prev) return null;
                                            const oldZoho = prev.integrations?.zoho || { enabled: true };
                                            return {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, clientSecret: e.target.value}} as any}
                                        })}
                                        className="w-full border p-2 rounded text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Refresh Token</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="password" 
                                            value={settings?.integrations?.zoho?.refreshToken || ''} 
                                            onChange={(e) => setSettings(prev => {
                                                if(!prev) return null;
                                                const oldZoho = prev.integrations?.zoho || { enabled: true };
                                                return {...prev, integrations: {...prev.integrations, zoho: {...oldZoho, refreshToken: e.target.value}} as any}
                                            })}
                                            className="w-full border p-2 rounded text-sm font-mono"
                                            placeholder="Generate via Self Client"
                                        />
                                        <Button variant="secondary" size="sm" onClick={() => setIsZohoAuthOpen(true)} className="whitespace-nowrap flex items-center gap-1">
                                            <Key className="w-3 h-3" /> Generate Token
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Tip: Save Client ID/Secret first. Then click "Generate Token" and paste Auth Code.
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* CRM Config (Zapier) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Zapier Webhook (Legacy)</h3>
                                <StatusIndicator status={integrationStatus.zapier} />
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Connect leads to HubSpot, Wati, or Slack via Zapier.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Zapier Webhook URL</label>
                                    <input 
                                        type="text" 
                                        value={settings?.integrations?.zapierWebhook || ''} 
                                        onChange={(e) => setSettings(prev => prev ? {...prev, integrations: {...prev.integrations, zapierWebhook: e.target.value} as any} : null)}
                                        className="w-full border p-2 rounded text-sm font-mono text-gray-600"
                                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="autoSync"
                                        checked={settings?.integrations?.enableAutoSync || false}
                                        onChange={(e) => setSettings(prev => prev ? {...prev, integrations: {...prev.integrations, enableAutoSync: e.target.checked} as any} : null)}
                                        className="rounded text-brand-600 focus:ring-brand-500"
                                    />
                                    <label htmlFor="autoSync" className="text-sm font-medium text-gray-700">Automatically sync leads on submission</label>
                                </div>
                            </div>
                        </div>
                        
                        {/* Email Notification Config (Gmail SMTP) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Mail className="w-5 h-5 text-red-500" /> Gmail Notification Settings</h3>
                                <StatusIndicator status={integrationStatus.smtp} />
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Configure Gmail SMTP to receive email notifications when a lead is submitted.</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <input 
                                        type="checkbox" 
                                        id="enableSmtp"
                                        checked={settings?.integrations?.smtp?.enabled || false}
                                        onChange={(e) => setSettings(prev => {
                                            if(!prev) return null;
                                            const oldSmtp = prev.integrations?.smtp || { user: '', pass: '', toEmail: '', enabled: false };
                                            return {...prev, integrations: {...prev.integrations, smtp: {...oldSmtp, enabled: e.target.checked}} as any}
                                        })}
                                        className="rounded text-brand-600 focus:ring-brand-500"
                                    />
                                    <label htmlFor="enableSmtp" className="text-sm font-bold text-industrial-dark">Enable Email Notifications</label>
                                </div>
                                
                                <div className={`space-y-4 ${!settings?.integrations?.smtp?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gmail Address (Sender)</label>
                                        <input 
                                            type="email" 
                                            value={settings?.integrations?.smtp?.user || ''} 
                                            onChange={(e) => setSettings(prev => {
                                                if(!prev) return null;
                                                const oldSmtp = prev.integrations?.smtp || { enabled: true, pass: '', toEmail: '' };
                                                return {...prev, integrations: {...prev.integrations, smtp: {...oldSmtp, user: e.target.value}} as any}
                                            })}
                                            className="w-full border p-2 rounded text-sm"
                                            placeholder="your-email@gmail.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">App Password</label>
                                        <input 
                                            type="password" 
                                            value={settings?.integrations?.smtp?.pass || ''} 
                                            onChange={(e) => setSettings(prev => {
                                                if(!prev) return null;
                                                const oldSmtp = prev.integrations?.smtp || { enabled: true, user: '', toEmail: '' };
                                                return {...prev, integrations: {...prev.integrations, smtp: {...oldSmtp, pass: e.target.value}} as any}
                                            })}
                                            className="w-full border p-2 rounded text-sm font-mono"
                                            placeholder="xxxx xxxx xxxx xxxx"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Generate an App Password in Google Account &gt; Security.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notification Recipient Email</label>
                                        <input 
                                            type="email" 
                                            value={settings?.integrations?.smtp?.toEmail || ''} 
                                            onChange={(e) => setSettings(prev => {
                                                if(!prev) return null;
                                                const oldSmtp = prev.integrations?.smtp || { enabled: true, user: '', pass: '' };
                                                return {...prev, integrations: {...prev.integrations, smtp: {...oldSmtp, toEmail: e.target.value}} as any}
                                            })}
                                            className="w-full border p-2 rounded text-sm"
                                            placeholder="admin@stylensurface.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <Button size="lg" onClick={handleSaveIntegrations}>{saved ? 'Saved Successfully!' : 'Save Integration Settings'}</Button>
                        </div>

                        {/* Database Tools */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
                             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-brand-600" /> Database Tools</h3>
                             <p className="text-sm text-gray-500 mb-4">Initialize or reset your database with default content.</p>
                             <div className="flex gap-4">
                                 <Button variant="outline" onClick={handleSeedData}>Sync Demo Data to Database</Button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- PRODUCTS TAB --- */}
            {activeTab === 'products' && !editingProduct && (
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-industrial-dark">Products Listing</h2>
                        <Button size="sm" onClick={handleCreateProduct}><Plus className="w-4 h-4 mr-2"/> Add Product</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(prod => (
                            <div key={prod.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden border border-gray-100">
                                    {prod.image ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>}
                                </div>
                                <h3 className="font-bold text-industrial-dark">{prod.name}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs uppercase font-bold text-brand-500 bg-brand-50 px-2 py-1 rounded">{prod.category}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingProduct(prod)} className="p-2 hover:bg-gray-100 rounded-full text-brand-600"><Settings className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 hover:bg-red-50 rounded-full text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <div className="col-span-3 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 mb-4">No products found in database.</p>
                                <Button size="sm" onClick={handleSeedData}>Load Demo Products</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- PRODUCT EDITOR --- */}
            {activeTab === 'products' && editingProduct && (
                 <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-20">
                     <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 bg-white z-10">
                         <h3 className="font-bold text-lg">Product Details</h3>
                         <div className="flex gap-2">
                             <Button variant="secondary" size="sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
                             <Button variant="primary" size="sm" onClick={handleSaveProduct}>{saved ? 'Saved!' : 'Save Product'}</Button>
                         </div>
                     </div>
                     <div className="p-6 space-y-8">
                         
                         {/* Basic Info */}
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs">/product/</span>
                                    <input type="text" value={editingProduct.slug || ''} onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})} className="flex-1 border p-2 rounded text-sm font-mono" placeholder="auto-generated" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="w-full border p-2 rounded">
                                    <option value="acrylic">Acrylic</option>
                                    <option value="ubuntu">Ubuntu</option>
                                    <option value="cork">Cork</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                             <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border p-2 rounded h-24" />
                         </div>

                         {/* Images Section */}
                         <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                             <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-industrial-dark">
                                 <Images className="w-4 h-4" /> Product Images
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Main Image */}
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-2">Main Image (Thumbnail)</label>
                                     <div className="flex gap-3">
                                        <div className="w-24 h-24 bg-white rounded border border-gray-300 overflow-hidden flex-shrink-0">
                                            {editingProduct.image ? <img src={editingProduct.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xs text-gray-400">No Img</div>}
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <Button size="sm" variant="outline" onClick={() => openPicker(url => setEditingProduct({...editingProduct, image: url}))}>Select Main</Button>
                                        </div>
                                     </div>
                                 </div>

                                 {/* Gallery */}
                                 <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-gray-500">Gallery Images</label>
                                        <Button size="sm" variant="secondary" className="px-2 py-0.5 text-xs h-7" onClick={() => openPicker(url => {
                                            const gallery = [...(editingProduct.gallery || [])];
                                            gallery.push(url);
                                            setEditingProduct({...editingProduct, gallery});
                                        })}>+ Add Photo</Button>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 min-h-[6rem]">
                                        {(editingProduct.gallery || []).map((img, idx) => (
                                            <div key={idx} className="w-20 h-20 bg-white rounded border border-gray-300 overflow-hidden flex-shrink-0 relative group">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => {
                                                        const gallery = [...(editingProduct.gallery || [])];
                                                        gallery.splice(idx, 1);
                                                        setEditingProduct({...editingProduct, gallery});
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {(editingProduct.gallery || []).length === 0 && <p className="text-xs text-gray-400 italic mt-2">No extra images.</p>}
                                    </div>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Features Editor */}
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                             <h4 className="font-bold text-sm mb-2 flex justify-between">
                                 <span>Key Features (Bullet Points)</span>
                                 <button onClick={handleAddFeature} className="text-brand-600 text-xs hover:underline">+ Add Feature</button>
                             </h4>
                             <div className="space-y-2">
                                 {editingProduct.features?.map((feature, idx) => (
                                     <div key={idx} className="flex gap-2">
                                         <input 
                                            type="text" 
                                            value={feature} 
                                            onChange={e => handleUpdateFeature(idx, e.target.value)} 
                                            className="flex-1 border p-1 rounded text-sm" 
                                            placeholder="Feature (e.g. UV Resistant)"
                                         />
                                         <button onClick={() => handleDeleteFeature(idx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         {/* Specs Editor */}
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-bold text-sm mb-2 flex justify-between">
                                <span>Technical Specs</span>
                                <button onClick={handleAddSpec} className="text-brand-600 text-xs hover:underline">+ Add Spec</button>
                            </h4>
                            <div className="space-y-2">
                                {editingProduct.specs?.map((spec, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" placeholder="Label (e.g. Thickness)" value={spec.label} onChange={e => handleUpdateSpec(idx, 'label', e.target.value)} className="w-1/3 border p-1 rounded text-sm" />
                                        <input type="text" placeholder="Value (e.g. 2mm)" value={spec.value} onChange={e => handleUpdateSpec(idx, 'value', e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                                        <button onClick={() => handleDeleteSpec(idx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {(!editingProduct.specs || editingProduct.specs.length === 0) && <p className="text-xs text-gray-400 italic">No specs added.</p>}
                            </div>
                         </div>
                     </div>
                 </div>
            )}
            
            {/* --- MEDIA TAB --- */}
             {activeTab === 'media' && (
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-industrial-dark">Media Library</h2>
                    </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex gap-4 items-center">
                        <input type="text" placeholder="Paste Image URL..." className="flex-1 border border-gray-300 rounded px-3 py-2" onKeyDown={(e) => { if (e.key === 'Enter') handleAddMediaDirect((e.target as HTMLInputElement).value) }} />
                         <div className="h-8 w-px bg-gray-300 mx-2"></div>
                         <input type="file" ref={mediaTabInputRef} className="hidden" accept="image/*" onChange={handleTabFileUpload} />
                        <Button size="sm" onClick={() => mediaTabInputRef.current?.click()} variant="primary"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {media.map(item => (
                            <div key={item.id} className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden aspect-square">
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button onClick={() => handleDeleteMedia(item.id)} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {media.length === 0 && <p className="col-span-5 text-center text-gray-400">No images found.</p>}
                    </div>
                </div>
            )}
            
            {/* --- CODE TAB --- */}
             {activeTab === 'code' && (
                 <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-industrial-dark mb-6">Header & Footer Scripts</h2>
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <h3 className="font-bold text-lg mb-2 text-gray-700">Header Code</h3>
                             <p className="text-xs text-gray-500 mb-4">Injected into {`<head>`}. Good for Analytics, CSS, Meta Tags.</p>
                             <textarea 
                                className="w-full h-40 border border-gray-300 rounded-lg p-3 font-mono text-xs bg-gray-900 text-green-400"
                                value={scripts.header}
                                onChange={e => setScripts({...scripts, header: e.target.value})}
                                placeholder="<!-- Paste script tags here -->"
                            ></textarea>
                         </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <h3 className="font-bold text-lg mb-2 text-gray-700">Footer Code</h3>
                             <p className="text-xs text-gray-500 mb-4">Injected before {`</body>`}. Good for Chat Widgets, Tracking Pixels.</p>
                             <textarea 
                                className="w-full h-40 border border-gray-300 rounded-lg p-3 font-mono text-xs bg-gray-900 text-green-400"
                                value={scripts.footer}
                                onChange={e => setScripts({...scripts, footer: e.target.value})}
                                placeholder="<!-- Paste script tags here -->"
                            ></textarea>
                             <div className="mt-4 flex justify-end">
                                 <Button size="sm" onClick={handleSaveScripts}>{saved ? 'Saved!' : 'Save Scripts'}</Button>
                             </div>
                         </div>
                    </div>
                 </div>
            )}
            
            {/* --- MENU TAB --- */}
            {activeTab === 'menu' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-industrial-dark">Menu Management</h2>
                        <Button size="sm" onClick={handleSaveMenus}>{saved ? 'Saved!' : 'Save Menus'}</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Header Menu */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="font-bold text-lg">Header Menu</h3>
                                 <button onClick={() => handleAddMenuItem('header')} className="text-brand-600 text-xs font-bold">+ Add Link</button>
                             </div>
                             <div className="space-y-3">
                                 {menus.header.map((item, idx) => (
                                     <div key={item.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                                         <span className="text-gray-400 text-xs font-mono w-4">{idx+1}</span>
                                         <input type="text" value={item.label} onChange={e => handleMenuChange('header', idx, 'label', e.target.value)} className="flex-1 border p-1 rounded text-sm" placeholder="Label" />
                                         <input type="text" value={item.url} onChange={e => handleMenuChange('header', idx, 'url', e.target.value)} className="flex-1 border p-1 rounded text-sm text-gray-600 font-mono" placeholder="URL" />
                                         <button onClick={() => handleDeleteMenuItem('header', idx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Footer Menu */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="font-bold text-lg">Footer Menu</h3>
                                 <button onClick={() => handleAddMenuItem('footer')} className="text-brand-600 text-xs font-bold">+ Add Link</button>
                             </div>
                             <div className="space-y-3">
                                 {menus.footer.map((item, idx) => (
                                     <div key={item.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                                         <span className="text-gray-400 text-xs font-mono w-4">{idx+1}</span>
                                         <input type="text" value={item.label} onChange={e => handleMenuChange('footer', idx, 'label', e.target.value)} className="flex-1 border p-1 rounded text-sm" placeholder="Label" />
                                         <input type="text" value={item.url} onChange={e => handleMenuChange('footer', idx, 'url', e.target.value)} className="flex-1 border p-1 rounded text-sm text-gray-600 font-mono" placeholder="URL" />
                                         <button onClick={() => handleDeleteMenuItem('footer', idx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

        </main>

        <ImagePicker 
            isOpen={isPickerOpen} 
            onClose={() => setIsPickerOpen(false)} 
            onSelect={pickerCallback} 
        />
        
        {/* ZOHO AUTH MODAL */}
        {isZohoAuthOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                    <div className="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-xl border-blue-100">
                        <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2"><Key className="w-5 h-5"/> Zoho Token Exchange</h3>
                        <button onClick={() => setIsZohoAuthOpen(false)}><X className="w-5 h-5 text-blue-400 hover:text-blue-700" /></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4 text-sm text-gray-600">
                            <p className="font-bold text-gray-800">Follow these steps to generate a secure Refresh Token:</p>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">1</div>
                                <div className="flex-1">
                                    <p>Go to the <strong>Zoho API Console</strong> (Self Client tab).</p>
                                    <a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline text-xs mt-1 inline-flex items-center gap-1">Open Zoho Console <ExternalLink className="w-3 h-3"/></a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
                                <div>
                                    <p>Enter Scope: <code className="bg-gray-100 px-1 py-0.5 rounded border border-gray-300">ZohoCRM.modules.ALL</code></p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
                                <div>
                                    <p>Set Expiry to <strong>10 minutes</strong>. Click <strong>Generate</strong>.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">4</div>
                                <div className="w-full">
                                    <p className="mb-2">Copy the generated code and paste it below:</p>
                                    <input 
                                        type="text" 
                                        value={zohoAuthCode} 
                                        onChange={(e) => setZohoAuthCode(e.target.value)}
                                        className="w-full border border-blue-200 rounded p-3 focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-widest text-lg"
                                        placeholder="1000.xxxx.xxxx..."
                                    />
                                </div>
                            </div>
                        </div>

                        <Button fullWidth onClick={handleGenerateZohoToken} disabled={!zohoAuthCode || zohoLoading} variant="primary">
                            {zohoLoading ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/> Exchanging...</span> : "Exchange & Save Token"}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
