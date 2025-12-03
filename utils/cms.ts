

import { CMSPage, MenuStructure, GlobalSettings, Product, MediaItem, Lead, PageSection, SEOData } from '../types';
import { supabase } from './supabaseClient';

// --- INITIAL FALLBACK DATA ---

const INITIAL_SETTINGS: GlobalSettings = {
  siteName: "StylenSurface",
  phone: "+91 98765 43210",
  email: "sales@stylensurface.com",
  address: "Plot No. 123, Industrial Area, Phase 2, New Delhi, 110020",
  whatsapp: "+91 98765 43210",
  integrations: {
    enableAutoSync: false,
    zapierWebhook: '',
    smtp: {
      enabled: false,
      user: '',
      pass: '',
      toEmail: ''
    },
    zoho: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      refreshToken: '',
      domain: 'in'
    }
  }
};

const INITIAL_MENUS: MenuStructure = {
  header: [
    { id: '1', label: 'Home', url: '/' },
    { id: '2', label: 'Acrylic Sheets', url: '/product/clear-cast-acrylic-sheet' },
    { id: '3', label: 'Ubuntu Sheets', url: '/product/ubuntu-foam-board' },
    { id: '4', label: 'Cork Sheets', url: '/product/industrial-cork-sheet' },
    { id: '5', label: 'About Us', url: '/about' },
    { id: '6', label: 'Contact', url: '/contact' },
  ],
  footer: [
    { id: '1', label: 'Home', url: '/' },
    { id: '2', label: 'About Us', url: '/about' },
    { id: '3', label: 'Privacy Policy', url: '/privacy-policy' },
    { id: '4', label: 'Terms', url: '/terms-conditions' },
  ]
};

// --- REALISTIC DUMMY PRODUCTS FOR ACRYLIC BUSINESS ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Clear Cast Acrylic Sheet',
    slug: 'clear-cast-acrylic-sheet',
    category: 'acrylic',
    description: 'Our flagship product. Premium optical grade clear cast acrylic with 92% light transmission. Superior to glass in clarity and impact resistance. Ideal for laser cutting, signage, glazing, and display fabrication.',
    features: ['92% Optical Clarity', 'UV Resistant (Non-Yellowing)', 'Laser Cut Friendly', 'High Impact Strength'],
    specs: [
        { label: 'Process', value: 'Cell Cast' },
        { label: 'Density', value: '1.19 g/cm³' },
        { label: 'Thickness Range', value: '1.5mm - 50mm' }, 
        { label: 'Standard Size', value: '8ft x 4ft, 6ft x 4ft' },
        { label: 'Tensile Strength', value: '75 MPa' }
    ],
    image: 'https://images.unsplash.com/photo-1513366853605-54962eb02f0a?q=80&w=800&auto=format&fit=crop',
    gallery: [
        'https://images.unsplash.com/photo-1622396636133-74323d779f45?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop'
    ],
    applications: ['LED Signage', 'Retail Displays', 'Architectural Glazing', 'Trophies & Awards', 'Medical Incubators']
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Gold Mirror Acrylic Sheet',
    slug: 'gold-mirror-acrylic',
    category: 'acrylic',
    description: 'High-gloss reflective mirror acrylic. A lightweight, shatter-resistant alternative to glass mirrors. widely used in interior decor, wedding decoration, and premium signage.',
    features: ['Real Glass-like Reflection', 'Shatterproof', 'Lightweight', 'Easy to Cut'],
    specs: [
        { label: 'Finish', value: 'Reflective Mirror' },
        { label: 'Backing', value: 'Grey / White Paint' },
        { label: 'Thickness', value: '1mm - 3mm' },
        { label: 'Standard Size', value: '8ft x 4ft' }
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    gallery: [],
    applications: ['Wall Decor', 'Wedding Mandaps', 'Signage Letters', 'Cosmetic Displays']
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Ubuntu Foam Board (WPC)',
    slug: 'ubuntu-foam-board',
    category: 'ubuntu',
    description: 'The "Fit and Forget" solution. Ubuntu Sheet is a high-density Multi-Layer Composite (MLC) board engineered to replace plywood. It is 100% waterproof, termite-proof, and screw-holding capable.',
    features: ['100% Waterproof', 'Lifetime Termite Guarantee', 'High Screw Holding', 'Calibrated Surface'],
    specs: [
        { label: 'Core Density', value: '0.65 g/cm³' },
        { label: 'Surface Hardness', value: '75 Shore D' },
        { label: 'Thickness', value: '6mm, 12mm, 18mm' },
        { label: 'Water Absorption', value: '< 0.5%' }
    ],
    image: 'https://picsum.photos/id/135/600/400',
    gallery: ['https://picsum.photos/id/160/600/400'],
    applications: ['Modular Kitchens', 'Bathroom Vanities', 'Wardrobes', 'Wall Paneling']
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    name: 'Industrial Rubberized Cork',
    slug: 'industrial-cork-sheet',
    category: 'cork',
    description: 'Heavy-duty rubberized cork sheets designed for industrial sealing. Combines the compressibility of cork with the resilience of rubber.',
    features: ['High Compression Recovery', 'Oil & Fuel Resistant', 'Vibration Dampening', 'High Temperature Tolerance'],
    specs: [
        { label: 'Grade', value: 'RC-20' },
        { label: 'Binder', value: 'Neoprene / Nitrile' },
        { label: 'Thickness', value: '2mm - 12mm' },
        { label: 'Operating Temp', value: '-20°C to 120°C' }
    ],
    image: 'https://images.unsplash.com/photo-1621261354943-4a3b10856528?q=80&w=800&auto=format&fit=crop',
    gallery: [],
    applications: ['Transformer Gaskets', 'Automotive Seals', 'Vibration Pads', 'Flooring Underlay']
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    name: 'Frosted / Diffuser Acrylic',
    slug: 'frosted-acrylic-sheet',
    category: 'acrylic',
    description: 'Specialized LED diffusing sheets that provide even light distribution without hot spots. Matte surface finish prevents glare.',
    features: ['High Diffusion Factor', 'No LED Hotspots', 'Matte Finish', 'Easy Thermoforming'],
    specs: [
        { label: 'Light Transmission', value: '60% - 80%' },
        { label: 'Finish', value: 'Matte / Sandblast' },
        { label: 'Thickness', value: '2mm, 3mm' }
    ],
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    gallery: [],
    applications: ['Lighting Fixtures', 'Office Partitions', 'Privacy Screens']
  }
];

// --- DEFAULT HOME PAGE CONTENT ---
const DEFAULT_HOME_PAGE: CMSPage = {
    id: '307c8702-85a0-4357-9653-4158654c6095',
    title: 'Home Page',
    slug: '/',
    template: 'home',
    isPublished: true,
    updatedAt: new Date().toISOString(),
    seo: {
        title: 'StylenSurface | Premium Acrylic & Industrial Sheets Manufacturer',
        description: 'Direct Manufacturer of Cast Acrylic, Mirror Acrylic, Ubuntu WPC, and Cork Sheets in India. Best wholesale prices for B2B buyers.',
        keywords: 'acrylic sheets, mirror acrylic, wpc board, cork sheet manufacturer india'
    },
    sections: [
        {
            id: 'hero',
            type: 'hero',
            content: {
                title: 'Premium Acrylic, Ubuntu & Cork Sheets',
                subtitle: 'Direct from manufacturer. High-quality, custom-cut sheets for furniture, construction, signage, and industrial applications across India.',
                btnPrimary: 'Get Best Price Quote',
                btnSecondary: 'View Catalog',
                bgImage: ''
            }
        },
        {
            id: 'trust',
            type: 'features',
            content: {
                title: "Why Industry Leaders Choose Us",
                features: [
                  { icon: "Factory", title: "Manufacturer Direct", desc: "No middlemen, get factory prices." },
                  { icon: "Clock", title: "10+ Years Experience", desc: "Expertise in sheet manufacturing." },
                  { icon: "Users", title: "500+ Happy Clients", desc: "Trusted by top furniture brands." },
                  { icon: "Ruler", title: "Custom Sizes", desc: "Cut-to-size service available." },
                  { icon: "MapPin", title: "Pan-India Delivery", desc: "Fast logistics partner network." },
                  { icon: "Award", title: "ISO 9001 Certified", desc: "Guaranteed quality standards." },
                ]
            }
        },
        {
            id: 'products',
            type: 'product-grid',
            content: {
                title: 'Our Manufacturing Range',
                subtitle: 'Explore our specialized sheet categories designed for durability, aesthetics, and industrial performance.'
            }
        },
        {
            id: 'about',
            type: 'text',
            content: {
                title: "Manufacturing Quality That You Can Trust",
                text: "Established in 2013, StylenSurface has grown to become one of India's most trusted suppliers of industrial grade sheets. Our state-of-the-art manufacturing facility employs advanced extrusion and casting technologies to ensure every sheet meets rigorous ISO standards.",
                image: "https://picsum.photos/id/180/600/500",
                years: "10+",
                bullets: ['ISO 9001:2015 Certified', 'Advanced CNC Cutting', 'Eco-friendly Practices', '24/7 Support']
            }
        },
        {
            id: 'social-proof',
            type: 'text',
            content: {
                title: "Client Conversations",
                subtitle: "See what our clients are saying about us directly on WhatsApp and Instagram.",
                // Provide default mock screenshots.
                // In a real app, these would be user uploaded images via Admin.
                images: [
                  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop', // Instagram Mock
                  'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&auto=format&fit=crop', // WhatsApp Mock
                  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400&auto=format&fit=crop', // Another Mock
                  'https://images.unsplash.com/photo-1611162618071-eead6eb8d587?q=80&w=400&auto=format&fit=crop',
                ]
            }
        },
        {
            id: 'applications',
            type: 'gallery',
            content: {
                title: "Applications Across Industries",
                subtitle: "From heavy industry to aesthetic interiors, our sheets deliver performance and beauty.",
                items: [
                  { title: 'Furniture Manufacturing', img: 'https://picsum.photos/id/40/600/400' },
                  { title: 'Interior Design & Decor', img: 'https://picsum.photos/id/50/600/400' },
                  { title: 'Signage & Displays', img: 'https://picsum.photos/id/60/600/400' },
                  { title: 'Industrial Fabrication', img: 'https://picsum.photos/id/70/600/400' },
                  { title: 'Construction & Roofing', img: 'https://picsum.photos/id/80/600/400' },
                  { title: 'Office Partitions', img: 'https://picsum.photos/id/90/600/400' },
                ]
            }
        },
        {
            id: 'testimonials',
            type: 'features',
            content: {
                title: "Trusted by Professionals",
                subtitle: "Join over 500+ businesses who trust StylenSurface for their material needs.",
                items: [
                  {
                    id: 1,
                    name: "Rajesh Kumar",
                    role: "Production Manager",
                    company: "Urban Furniture Ltd.",
                    content: "We have been procuring Ubuntu sheets for our modular kitchens for 2 years. The moisture resistance and finish are top-notch.",
                    rating: 5,
                    image: "https://randomuser.me/api/portraits/men/32.jpg"
                  },
                  {
                    id: 2,
                    name: "Sarah Pinto",
                    role: "Interior Designer",
                    company: "Design Studio X",
                    content: "Their clear acrylic sheets are perfect for the high-end signage projects we handle. Delivery is always on time in Mumbai.",
                    rating: 5,
                    image: "https://randomuser.me/api/portraits/women/44.jpg"
                  },
                  {
                    id: 3,
                    name: "Amit Verma",
                    role: "Purchase Head",
                    company: "Industrial Solutions",
                    content: "Excellent cork sheets for our industrial gasket requirements. Very consistent density and pricing is competitive.",
                    rating: 4,
                    image: "https://randomuser.me/api/portraits/men/85.jpg"
                  }
                ]
            }
        },
        {
            id: 'faq',
            type: 'text',
            content: {
                title: "Frequently Asked Questions",
                items: [
                  {
                    question: "What is the minimum order quantity (MOQ) for bulk prices?",
                    answer: "For wholesale pricing, our MOQ is typically 500kg or 50 sheets, depending on the material type."
                  },
                  {
                    question: "Do you provide custom cutting services?",
                    answer: "Yes, we have advanced CNC and laser cutting machines to provide sheets cut to your exact dimensions."
                  },
                  {
                    question: "What is the difference between Cast and Extruded Acrylic?",
                    answer: "Cast acrylic offers better optical clarity and chemical resistance. Extruded is more uniform in thickness."
                  },
                  {
                    question: "Do you deliver pan-India?",
                    answer: "Yes, we have logistics partners covering all major cities and industrial hubs across India."
                  },
                  {
                    question: "Can I get a sample before placing a bulk order?",
                    answer: "Absolutely. We can ship a sample kit containing small swatches of our Acrylic, Ubuntu, and Cork sheets."
                  }
                ]
            }
        }
    ]
};

// --- HELPER FOR NEW PAGE INITIALIZATION ---
export const getInitialSectionsForTemplate = (template: string): PageSection[] => {
    if (template === 'home') {
        // Return a deep copy of the default home page sections
        return JSON.parse(JSON.stringify(DEFAULT_HOME_PAGE.sections));
    }
    return [];
};


// --- MAPPERS ---
const mapPageFromDB = (data: any): CMSPage => ({
  id: data.id,
  slug: data.slug,
  template: data.template,
  title: data.title,
  seo: data.seo || { title: '', description: '', keywords: '' },
  sections: data.sections || [],
  isPublished: data.is_published,
  updatedAt: data.updated_at
});

const mapPageToDB = (page: CMSPage) => ({
  id: page.id,
  slug: page.slug,
  template: page.template,
  title: page.title,
  seo: page.seo,
  sections: page.sections,
  is_published: page.isPublished,
  updated_at: page.updatedAt
});

const mapProductFromDB = (data: any): Product => ({
  id: data.id,
  name: data.name,
  slug: data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  category: data.category,
  description: data.description,
  features: data.features || [],
  specs: data.specs || [],
  image: data.image,
  gallery: data.gallery || [],
  applications: data.applications || [],
  isFeatured: data.is_featured
});

const mapProductToDB = (product: Product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug || product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  category: product.category,
  description: product.description,
  features: product.features,
  specs: product.specs,
  image: product.image,
  gallery: product.gallery,
  applications: product.applications,
  is_featured: product.isFeatured
});


export const CMS = {
  // --- Pages ---
  getPages: async (): Promise<CMSPage[]> => {
    const { data, error } = await supabase.from('cms_pages').select('*').order('updated_at', { ascending: true });
    if (error || !data) return [];
    return data.map(mapPageFromDB);
  },
  
  getPageBySlug: async (slug: string): Promise<CMSPage | undefined> => {
    const normalize = (s: string) => s === '/' ? s : s.replace(/\/$/, '');
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', normalize(slug))
      .maybeSingle();
      
    if (error || !data) {
        return undefined;
    }
    return mapPageFromDB(data);
  },

  savePage: async (page: CMSPage) => {
    // Ensure we update timestamp
    const pageWithTime = { ...page, updatedAt: new Date().toISOString() };
    const payload = mapPageToDB(pageWithTime);

    const { error } = await supabase.from('cms_pages').upsert(payload, { onConflict: 'id' });
    
    if (error) {
        console.error("Supabase Save Page Error", JSON.stringify(error, null, 2));
        throw error;
    }
  },

  deletePage: async (id: string) => {
    await supabase.from('cms_pages').delete().eq('id', id);
  },

  duplicatePage: async (id: string) => {
    const { data: source } = await supabase.from('cms_pages').select('*').eq('id', id).single();
    if (!source) return;

    // source is raw DB data (snake_case)
    const newPagePayload = {
      ...source, 
      id: crypto.randomUUID(),
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy`,
      updated_at: new Date().toISOString(),
      is_published: false
    };
    await supabase.from('cms_pages').insert(newPagePayload);
  },

  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('cms_products').select('*');
    if (error || !data || data.length === 0) {
        return INITIAL_PRODUCTS;
    }
    return data.map(mapProductFromDB);
  },

  getProductBySlug: async (slug: string): Promise<Product | undefined> => {
      const { data, error } = await supabase.from('cms_products').select('*').eq('slug', slug).maybeSingle();
      if (error || !data) {
        // Fallback to demo data if DB is empty/missed
        const demo = INITIAL_PRODUCTS.find(p => p.slug === slug);
        if (demo) return demo;
        return undefined;
      }
      return mapProductFromDB(data);
  },

  saveProduct: async (product: Product) => {
    // Ensure slug exists before saving
    if (!product.slug) {
        product.slug = product.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const payload = mapProductToDB(product);
    const { error } = await supabase.from('cms_products').upsert(payload);
    if(error) {
        console.error("Save Product Error", error);
        return { error };
    }
    return { success: true };
  },

  deleteProduct: async (id: string) => {
    await supabase.from('cms_products').delete().eq('id', id);
  },

  // --- Media ---
  getMedia: async (): Promise<MediaItem[]> => {
    const { data, error } = await supabase.from('cms_media').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data as MediaItem[];
  },

  saveMedia: async (media: MediaItem) => {
    await supabase.from('cms_media').insert(media);
  },

  deleteMedia: async (id: string) => {
    await supabase.from('cms_media').delete().eq('id', id);
  },

  // --- Menus ---
  getMenus: async (): Promise<MenuStructure> => {
    const { data: header } = await supabase.from('cms_menus').select('items').eq('type', 'header').maybeSingle();
    const { data: footer } = await supabase.from('cms_menus').select('items').eq('type', 'footer').maybeSingle();
    
    return {
        header: header?.items || INITIAL_MENUS.header,
        footer: footer?.items || INITIAL_MENUS.footer
    };
  },

  saveMenus: async (menus: MenuStructure) => {
    await supabase.from('cms_menus').upsert({ type: 'header', items: menus.header }, { onConflict: 'type' });
    await supabase.from('cms_menus').upsert({ type: 'footer', items: menus.footer }, { onConflict: 'type' });
  },

  // --- Settings ---
  getSettings: async (): Promise<GlobalSettings> => {
    const { data, error } = await supabase.from('cms_settings').select('*').maybeSingle();
    if (error || !data) return INITIAL_SETTINGS;
    
    return {
        siteName: data.site_name || INITIAL_SETTINGS.siteName,
        phone: data.phone || INITIAL_SETTINGS.phone,
        email: data.email || INITIAL_SETTINGS.email,
        address: data.address || INITIAL_SETTINGS.address,
        whatsapp: data.whatsapp || INITIAL_SETTINGS.whatsapp,
        integrations: data.integrations || INITIAL_SETTINGS.integrations
    };
  },

  saveSettings: async (settings: GlobalSettings) => {
      const { data } = await supabase.from('cms_settings').select('id').limit(1);
      
      const payload = {
          site_name: settings.siteName,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          whatsapp: settings.whatsapp,
          integrations: settings.integrations
      };

      if (data && data.length > 0) {
          await supabase.from('cms_settings').update(payload).eq('id', data[0].id);
      } else {
          await supabase.from('cms_settings').insert(payload);
      }
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching leads", error);
      return [];
    }
    return data as Lead[];
  },

  /**
   * One-time seed function to populate the DB with demo data
   * so the user doesn't lose it when they start editing.
   */
  seedInitialData: async () => {
      console.log("Seeding Database...");
      
      // 1. Seed Products
      const { data: existingProducts } = await supabase.from('cms_products').select('id').limit(1);
      if (!existingProducts || existingProducts.length === 0) {
          for (const p of INITIAL_PRODUCTS) {
              await supabase.from('cms_products').upsert(mapProductToDB(p));
          }
      }

      // 2. Seed Menus
      const { data: existingMenus } = await supabase.from('cms_menus').select('id').limit(1);
      if (!existingMenus || existingMenus.length === 0) {
          await supabase.from('cms_menus').upsert({ type: 'header', items: INITIAL_MENUS.header }, { onConflict: 'type' });
          await supabase.from('cms_menus').upsert({ type: 'footer', items: INITIAL_MENUS.footer }, { onConflict: 'type' });
      }

      // 3. Seed Settings
      const { data: existingSettings } = await supabase.from('cms_settings').select('id').limit(1);
      if (!existingSettings || existingSettings.length === 0) {
           await supabase.from('cms_settings').insert({
              site_name: INITIAL_SETTINGS.siteName,
              phone: INITIAL_SETTINGS.phone,
              email: INITIAL_SETTINGS.email,
              address: INITIAL_SETTINGS.address,
              whatsapp: INITIAL_SETTINGS.whatsapp,
              integrations: INITIAL_SETTINGS.integrations
           });
      }

      // 4. Seed Home Page (Critical for Editing Content)
      // Check if ANY home page exists
      const { data: existingHome } = await supabase.from('cms_pages').select('id').eq('slug', '/').maybeSingle();
      if (!existingHome) {
          await supabase.from('cms_pages').insert(mapPageToDB(DEFAULT_HOME_PAGE));
      }

      return true;
  }
};