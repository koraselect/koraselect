import { Product, Category, AffiliateConfig } from '../types/product';

export const INITIAL_AFFILIATE_CONFIG: AffiliateConfig = {
  tag: 'koraselect-20',
  currency: 'USD',
  siteName: 'KORASELECT',
  siteTagline: 'Ofertas Curadas de Amazon',
  defaultCommissionRate: 6.0,
  customBannerText: 'Selección Curada de Amazon'
};

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Todas las Colecciones',
    icon: 'Grid',
    description: 'Catálogo completo de ofertas verificadas en Amazon'
  },
  {
    id: 'maletas-equipaje',
    name: 'Maletas y Equipaje',
    icon: 'Luggage',
    description: 'Maletas plegables, coequillajes y equipaje de mano con descuento'
  },
  {
    id: 'botellas-termos',
    name: 'Botellas y Termos',
    icon: 'Droplet',
    description: 'Botellas de vidrio, sets térmicos y accesorios de hidratación'
  },
  {
    id: 'estuches-neceseres',
    name: 'Estuches y Neceseres',
    icon: 'Briefcase',
    description: 'Neceseres de viaje, estuches acolchados y neceseres para dama'
  },
  {
    id: 'organizacion',
    name: 'Organización',
    icon: 'Package',
    description: 'Organizadores de lencería, fundas impermeables y soluciones de storage'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Maleta Plegable para Viaje - Capacidad 40L',
    subtitle: 'Ligera, resistente y perfecta como equipaje de mano para tus viajes',
    category: 'maletas-equipaje',
    price: 32.99,
    originalPrice: 46.99,
    rating: 4.9,
    reviewsCount: 100,
    amazonUrl: 'https://www.amazon.com/dp/B0DJ444QWC',
    asin: 'B0DJ444QWC',
    mainImage: 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '68 x 23 x 45 cm (largo x ancho x alto)',
    capacity: '40L',
    colors: [
      { name: 'Gris', hex: '#808080', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Azul', hex: '#0000FF', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Verde', hex: '#008000', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Morado', hex: '#800080', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Ultra Ligera', description: 'Solo 1.5 kg de peso, ideal para llevar como equipaje de mano.', icon: 'Feather' },
      { title: 'Capacidad 40L', description: 'Amplio espacio para viajes de 3-5 días.', icon: 'Maximize2' },
      { title: 'Plegable y Compacta', description: 'Se pliega fácilmente para guardar cuando no la uses.', icon: 'Package' },
      { title: 'Material Resistente', description: 'Fabricada con nylon de alta durabilidad.', icon: 'Shield' }
    ],
    hotspots: [
      { id: 'h1', xPercent: 30, yPercent: 40, title: 'Asas telescópicas', description: 'Asa extensible con bloqueo de altura para mayor comodidad.' },
      { id: 'h2', xPercent: 75, yPercent: 60, title: 'Ruedas 360°', description: 'Cuatro ruedas giratorias para movilidad suave.' },
      { id: 'h3', xPercent: 50, yPercent: 80, title: 'Cremallera reforzada', description: 'Cremallera de doble apertura con candado TSA.' }
    ],
    description: 'Maleta plegable ideal para viajes. Con capacidad de 40L, es perfecta como equipaje de mano. Ultra ligera con solo 1.5 kg y material resistente que la hace duradera.',
    aPlusContent: {
      heroTitle: 'Tu Compañera de Viaje Definitiva',
      heroSubtitle: 'Maleta plegable de 40L con diseño compacto y resistente para tus aventuras.',
      bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Ultra Ligera', desc: 'Solo 1.5 kg, perfecta para equipaje de mano.', icon: 'Feather' },
        { title: 'Capacidad 40L', desc: 'Amplio espacio para ropa y accesorios de viaje.', icon: 'Maximize2' },
        { title: 'Material Resistente', desc: 'Nylon de alta calidad resistente a rasgaduras.', icon: 'Shield' }
      ],
      steps: [
        { step: 1, title: 'Despliega', desc: 'Abre la maleta y extiende las asas telescópicas.' },
        { step: 2, title: 'Empaca', desc: 'Aprovecha los compartimentos para organizar tu ropa.' },
        { step: 3, title: 'Viaja', desc: 'Rodéa suavemente por el aeropuerto con las ruedas 360°.' }
      ],
      whyChoose: [
        'Aprobada como equipaje de mano por la mayoría de aerolíneas',
        'Peso ultraligero de solo 1.5 kg',
        'Diseño plegable para almacenamiento compacto',
        'Material resistente al agua y rasgaduras'
      ]
    }
  },
  {
    id: 'prod-2',
    title: 'Set de Botellas de Vidrio 600ml x3 + Bolsa de Hielo Portátil',
    subtitle: 'Botellas de vidrio templado con cierre hermético y bolsa de hielo incluida',
    category: 'botellas-termos',
    price: 25.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviewsCount: 2904,
    amazonUrl: 'https://www.amazon.com/dp/B083JLBG8D',
    asin: 'B083JLBG8D',
    mainImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    badge: 'Más Vendido',
    dimensions: 'Set de 3 botellas 600ml cada una',
    colors: [
      { name: 'Vidrio Transparente', hex: '#E8E8E8', imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Vidrio Templado', description: 'Botellas de vidrio resistente a cambios de temperatura.', icon: 'Shield' },
      { title: 'Cierre Hermético', description: 'Tapón con sellado hermético para evitar derrames.', icon: 'Lock' },
      { title: 'Bolsa de Hielo', description: 'Bolsa portátil para mantener tus bebidas frías.', icon: 'Snowflake' },
      { title: 'Set de 3', description: 'Tres botellas perfectas para compartir.', icon: 'Package' }
    ],
    description: 'Set de 3 botellas de vidrio templado de 600ml cada una, con cierre hermético y bolsa de hielo portátil incluida. Ideales para mantener tus bebidas frescas en cualquier lugar.',
    aPlusContent: {
      heroTitle: 'Hidratación Fresca en Cualquier Lugar',
      heroSubtitle: 'Botellas de vidrio templado con bolsa de hielo para mantener tus bebidas perfectas.',
      bannerImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Vidrio Templado', desc: 'Resistente a cambios de temperatura y rayones.', icon: 'Shield' },
        { title: 'Cierre Hermético', desc: 'Tapón sellado que previene derrames.', icon: 'Lock' },
        { title: 'Bolsa de Hielo', desc: 'Mantiene tus bebidas frías por horas.', icon: 'Snowflake' }
      ],
      steps: [
        { step: 1, title: 'Llena', desc: 'Añade tu bebida favorita a la botella.' },
        { step: 2, title: 'Sella', desc: 'Cierra herméticamente con el tapón incluido.' },
        { step: 3, title: 'Enfría', desc: 'Usa la bolsa de hielo para mantener la temperatura.' }
      ],
      whyChoose: [
        'Vidrio templado libre de BPA',
        'Cierre hermético 100% a prueba de derrames',
        'Bolsa de hielo reutilizable incluida',
        'Fácil limpieza y lavavajillas seguro'
      ]
    }
  },
  {
    id: 'prod-3',
    title: 'Maleta Coequillaje con Ruedas Giratorias 360°',
    subtitle: 'Compacta, resistente y con sistema de ruedas para movilidad total',
    category: 'maletas-equipaje',
    price: 27.24,
    originalPrice: 36.32,
    rating: 4.8,
    reviewsCount: 1804,
    amazonUrl: 'https://www.amazon.com/dp/B0FFMVP2HQ',
    asin: 'B0FFMVP2HQ',
    mainImage: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '52 x 34 x 23 cm (largo x ancho x alto)',
    capacity: '40L',
    colors: [
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Azul Marino', hex: '#000080', imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Gris Claro', hex: '#D3D3D3', imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Blanco', hex: '#FFFFFF', imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Rosa', hex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Ruedas Giratorias 360°', description: 'Movilidad total en cualquier dirección.', icon: 'RefreshCw' },
      { title: 'Cierre 3 dígitos', description: 'Candado numérico integrado para mayor seguridad.', icon: 'Lock' },
      { title: 'Tapa extensible', description: 'Amplía su capacidad hasta un 20% más.', icon: 'Maximize2' },
      { title: 'Asa telescópica', description: 'Asa extensible con bloqueo de altura.', icon: 'ChevronUp' }
    ],
    description: 'Maleta coequillaje compacta con ruedas giratorias 360° para movilidad total. Cierre de seguridad de 3 dígitos y tapa extensible para mayor capacidad.',
    aPlusContent: {
      heroTitle: 'Movilidad Total en Cada Viaje',
      heroSubtitle: 'Maleta compacta con ruedas 360° y diseño resistente para viajeros exigentes.',
      bannerImage: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Ruedas 360°', desc: 'Giro completo para movilidad suave y silenciosa.', icon: 'RefreshCw' },
        { title: 'Cierre Seguro', desc: 'Candado de 3 dígitos integrado.', icon: 'Lock' },
        { title: 'Capacidad Expandible', desc: 'Tapa extensible para 20% más de espacio.', icon: 'Maximize2' }
      ],
      steps: [
        { step: 1, title: 'Abre', desc: 'Desbloquea el candado de 3 dígitos.' },
        { step: 2, title: 'Empaca', desc: 'Aprovecha los compartimentos organizadores.' },
        { step: 3, title: 'Expande', desc: 'Usa la tapa extensible si necesitas más espacio.' }
      ],
      whyChoose: [
        'Ruedas giratorias 360° para movilidad total',
        'Cierre de seguridad con candado de 3 dígitos',
        'Tapa extensible para mayor capacidad',
        'Diseño compacto apto para equipaje de mano'
      ]
    }
  },
  {
    id: 'prod-4',
    title: 'Funda Impermeable Antirrayones para Maletas',
    subtitle: 'Protege tu equipaje de arañazos, polvo y lluvia con estilo',
    category: 'organizacion',
    price: 8.99,
    originalPrice: 14.99,
    rating: 4.7,
    reviewsCount: 547,
    amazonUrl: 'https://www.amazon.com/dp/B0DJ19D5TX',
    asin: 'B0DJ19D5TX',
    mainImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '57 x 33 x 20 cm (largo x ancho x alto)',
    colors: [
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Rosa', hex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Azul', hex: '#0000FF', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Gris', hex: '#808080', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Impermeable', description: 'Protege contra lluvia y derrames de líquidos.', icon: 'Droplet' },
      { title: 'Antirrayones', description: 'Material elástico que evita arañazos y golpes.', icon: 'Shield' },
      { title: 'Fácil Instalación', description: 'Se coloca en segundos sin herramientas.', icon: 'Zap' },
      { title: 'Lavable', description: 'Se puede lavar a mano o en lavadora.', icon: 'RefreshCw' }
    ],
    description: 'Funda impermeable y antirrayones diseñada para proteger tu maleta de arañazos, polvo y lluvia. Material elástico que se adapta perfectamente a tu equipaje.',
    aPlusContent: {
      heroTitle: 'Protección Total para Tu Equipaje',
      heroSubtitle: 'Funda impermeable antirrayones que mantiene tu maleta como nueva.',
      bannerImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Impermeable', desc: 'Protección contra lluvia y derrames.', icon: 'Droplet' },
        { title: 'Antirrayones', desc: 'Previene arañazos y daños superficiales.', icon: 'Shield' },
        { title: 'Fácil de Usar', desc: 'Se instala y retira en segundos.', icon: 'Zap' }
      ],
      steps: [
        { step: 1, title: 'Selecciona', desc: 'Elige el tamaño adecuado para tu maleta.' },
        { step: 2, title: 'Coloca', desc: 'Estira la funda sobre tu equipaje.' },
        { step: 3, title: 'Viaja', desc: 'Viaja tranquilo sabiendo que tu maleta está protegida.' }
      ],
      whyChoose: [
        'Material elástico de alta calidad',
        'Protección completa contra arañazos y polvo',
        'Impermeable y resistente al agua',
        'Disponible en múltiples colores'
      ]
    }
  },
  {
    id: 'prod-5',
    title: 'Organizador de Lencería - 4 Cajas + 12 Divisores',
    subtitle: 'Mantén tu ropa interior y calcetines perfectamente organizados',
    category: 'organizacion',
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.7,
    reviewsCount: 3486,
    amazonUrl: 'https://www.amazon.com/dp/B0CXKWMF5Y',
    asin: 'B0CXKWMF5Y',
    mainImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80',
    badge: 'Amazon Choice',
    dimensions: '34 x 32 x 9 cm (largo x ancho x alto)',
    colors: [
      { name: 'Gris', hex: '#808080', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Beige', hex: '#F5F5DC', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: '4 Cajas + 12 Divisores', description: 'Amplio espacio para toda tu lencería.', icon: 'Layout' },
      { title: 'Material Resistente', description: 'Tela durable que mantiene su forma.', icon: 'Shield' },
      { title: 'Diseño Modular', description: 'Cajas intercambiables según tus necesidades.', icon: 'Grid' },
      { title: 'Fácil Limpieza', description: 'Se puede limpiar con un paño húmedo.', icon: 'Droplet' }
    ],
    description: 'Set de 4 cajas organizadoras con 12 divisores para mantener tu ropa interior, calcetines y lencería perfectamente ordenados. Diseño modular y material resistente.',
    aPlusContent: {
      heroTitle: 'Orden Impecable en Tu Cajón',
      heroSubtitle: 'Organizador modular que transforma el caos en elegancia práctica.',
      bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: '4 Cajas + 12 Divisores', desc: 'Espacio para toda tu lencería.', icon: 'Layout' },
        { title: 'Diseño Modular', desc: 'Cajas intercambiables según necesites.', icon: 'Grid' },
        { title: 'Material Premium', desc: 'Tela durable que mantiene su forma.', icon: 'Shield' }
      ],
      steps: [
        { step: 1, title: 'Despliega', desc: 'Abre las cajas y coloca los divisores.' },
        { step: 2, title: 'Organiza', desc: 'Separa tu ropa por tipo y color.' },
        { step: 3, title: 'Guarda', desc: 'Coloca las cajas en tu cajón o armario.' }
      ],
      whyChoose: [
        'Set completo de 4 cajas con 12 divisores',
        'Diseño modular y personalizable',
        'Material resistente y fácil de limpiar',
        'Perfecto para cajones de 30-35 cm'
      ]
    }
  },
  {
    id: 'prod-6',
    title: 'Estuche Neceser Grande para Mujer - Viaje y Organización',
    subtitle: 'Neceser espaciosa con múltiples compartimentos para toda tu información',
    category: 'estuches-neceseres',
    price: 13.99,
    originalPrice: 19.99,
    rating: 4.9,
    reviewsCount: 2243,
    amazonUrl: 'https://www.amazon.com/dp/B0CWH3L8DZ',
    asin: 'B0CWH3L8DZ',
    mainImage: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80',
    badge: 'Top Seller',
    dimensions: '24 x 10 x 18 cm (largo x ancho x alto)',
    colors: [
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Rosa', hex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Verde', hex: '#008000', imageUrl: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Gris', hex: '#808080', imageUrl: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Gran Capacidad', description: 'Múltiples compartimentos para organizar todo.', icon: 'Maximize2' },
      { title: 'Material Impermeable', description: 'Protege tu información de la humedad.', icon: 'Droplet' },
      { title: 'Diseño Elegante', description: 'Estilo moderno para la mujer viajera.', icon: 'Heart' },
      { title: 'Compacta y Ligera', description: 'Fácil de llevar en tu equipaje.', icon: 'Feather' }
    ],
    description: 'Neceser grande para mujer con múltiples compartimentos. Impermeable, elegante y perfecta para organizar tus pertenencias en viajes o en el día a día.',
    aPlusContent: {
      heroTitle: 'Elegancia y Funcionalidad en Tu Viaje',
      heroSubtitle: 'Neceser que combina estilo y organización para la mujer moderna.',
      bannerImage: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Gran Capacidad', desc: 'Múltiples compartimentos para todo.', icon: 'Maximize2' },
        { title: 'Impermeable', desc: 'Protección contra humedad y derrames.', icon: 'Droplet' },
        { title: 'Diseño Elegante', desc: 'Estilo moderno y femenino.', icon: 'Heart' }
      ],
      steps: [
        { step: 1, title: 'Abre', desc: 'Despliega los compartimentos internos.' },
        { step: 2, title: 'Organiza', desc: 'Coloca tus productos por categoría.' },
        { step: 3, title: 'Cierra', desc: 'Asegura con la cremallera de cierre suave.' }
      ],
      whyChoose: [
        'Múltiples compartimentos organizadores',
        'Material impermeable de alta calidad',
        'Diseño elegante y moderno',
        'Compacta pero espaciosa'
      ]
    }
  },
  {
    id: 'prod-7',
    title: 'Estuche de Viaje para 3 Piezas - Neceser de Dama',
    subtitle: 'Organiza tus neceseres y accesorios con estilo y práctica',
    category: 'estuches-neceseres',
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.9,
    reviewsCount: 200,
    amazonUrl: 'https://www.amazon.com/dp/B0DJ26GNYN',
    asin: 'B0DJ26GNYN',
    mainImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '28 x 10 x 18 cm (largo x ancho x alto)',
    colors: [
      { name: 'Rosa', hex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Verde', hex: '#008000', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Morado', hex: '#800080', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Gris', hex: '#808080', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: '3 Piezas', description: 'Set completo para diferentes necesidades.', icon: 'Package' },
      { title: 'Diseño Compacto', description: 'Fácil de guardar en cualquier equipaje.', icon: 'Minimize2' },
      { title: 'Material Resistente', description: 'Tela durable resistente al desgaste.', icon: 'Shield' },
      { title: 'Múltiples Bolsillos', description: 'Organiza cada pieza según su uso.', icon: 'Layers' }
    ],
    description: 'Set de 3 estuches de viaje para dama. Diseño compacto y resistente con múltiples bolsillos para organizar tus neceseres y accesorios.',
    aPlusContent: {
      heroTitle: 'Organización Compuesta para Tu Viaje',
      heroSubtitle: 'Set de 3 estuches que combinan estilo y funcionalidad.',
      bannerImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Set de 3 Piezas', desc: 'Para diferentes necesidades y usos.', icon: 'Package' },
        { title: 'Diseño Compacto', desc: 'Ocupa poco espacio en tu maleta.', icon: 'Minimize2' },
        { title: 'Material Resistente', desc: 'Tela durable que resiste el uso diario.', icon: 'Shield' }
      ],
      steps: [
        { step: 1, title: 'Selecciona', desc: 'Elige el estuche según lo que vayas a llevar.' },
        { step: 2, title: 'Organiza', desc: 'Distribuye tus pertenencias en los compartimentos.' },
        { step: 3, title: 'Guarda', desc: 'Coloca los estuches en tu maleta o bolso.' }
      ],
      whyChoose: [
        'Set completo de 3 estuches de diferentes tamaños',
        'Diseño compacto para máximo aprovechamiento',
        'Material resistente y duradero',
        'Múltiples bolsillos organizadores'
      ]
    }
  },
  {
    id: 'prod-8',
    title: 'Estuche Neceser Acolchado para Mujer - Gris Claro',
    subtitle: 'Diseño acolchado suave con compartimentos inteligentes para tu información',
    category: 'estuches-neceseres',
    price: 9.59,
    originalPrice: 14.99,
    rating: 4.7,
    reviewsCount: 386,
    amazonUrl: 'https://www.amazon.com/dp/B0D8YHBB37',
    asin: 'B0D8YHBB37',
    mainImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '24.13 x 8.89 x 16.51 cm (largo x ancho x alto)',
    colors: [
      { name: 'Gris Claro', hex: '#D3D3D3', imageUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Diseño Acolchado', description: 'Textura suave que protege tus pertenencias.', icon: 'Heart' },
      { title: 'Compartimentos Inteligentes', description: 'Espacios diseñados para cada necesidad.', icon: 'Layout' },
      { title: 'Compacta y Ligera', description: 'Fácil de llevar en cualquier bolso.', icon: 'Feather' },
      { title: 'Cierre Suave', description: 'Cremallera de apertura fluida.', icon: 'Zap' }
    ],
    description: 'Neceser acolchada para mujer con diseño suave y compartimentos inteligentes. Perfecta para organizar tu información de viaje con estilo.',
    aPlusContent: {
      heroTitle: 'Suavidad y Organización en Tu Mano',
      heroSubtitle: 'Neceser acolchada que combina protección y estilo.',
      bannerImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: 'Diseño Acolchado', desc: 'Protección suave para tus pertenencias.', icon: 'Heart' },
        { title: 'Compartimentos', desc: 'Espacios inteligentes para cada cosa.', icon: 'Layout' },
        { title: 'Compacta', desc: 'Fácil de llevar y guardar.', icon: 'Feather' }
      ],
      steps: [
        { step: 1, title: 'Abre', desc: 'Despliega la neceser con su cierre suave.' },
        { step: 2, title: 'Organiza', desc: 'Coloca tus productos en los compartimentos.' },
        { step: 3, title: 'Cierra', desc: 'Asegura con la cremallera fluida.' }
      ],
      whyChoose: [
        'Diseño acolchado que protege tus pertenencias',
        'Compartimentos inteligentes organizados',
        'Material suave y ligero',
        'Tamaño compacto para llevar en cualquier lugar'
      ]
    }
  },
  {
    id: 'prod-9',
    title: 'Maleta Equipaje con Asiento para Niños',
    subtitle: 'La maleta que se convierte en asiento para que tu hijo viaje cómodo',
    category: 'maletas-equipaje',
    price: 32.99,
    originalPrice: 54.99,
    rating: 4.9,
    reviewsCount: 100,
    amazonUrl: 'https://www.amazon.com/dp/B0DJ5F22DQ',
    asin: 'B0DJ5F22DQ',
    mainImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
    badge: 'Recomendado',
    dimensions: '46 x 35 x 25 cm (largo x ancho x alto)',
    capacity: '40L',
    colors: [
      { name: 'Negro', hex: '#1C1C1C', imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Rosa', hex: '#FFB6C1', imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Azul', hex: '#0000FF', imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: '2 en 1', description: 'Maleta y asiento para niños en un solo producto.', icon: 'Layers' },
      { title: 'Peso Soportado 75kg', description: 'Asiento resistente para niños de hasta 75kg.', icon: 'Shield' },
      { title: 'Ruedas 360°', description: 'Movilidad total para comodidad del niño.', icon: 'RefreshCw' },
      { title: 'Capacidad 40L', description: 'Amplio espacio para ropa y juguetes.', icon: 'Maximize2' }
    ],
    description: 'Maleta equipaje con asiento integrado para niños. La maleta se convierte en asiento rodante, permitiendo que tu hijo viaje cómodo mientras esperan.',
    aPlusContent: {
      heroTitle: 'Viajes Divertidos para los Peques',
      heroSubtitle: 'Maleta con asiento que transforma la espera en diversión.',
      bannerImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
      features: [
        { title: '2 en 1', desc: 'Maleta y asiento en un solo producto.', icon: 'Layers' },
        { title: 'Resistente', desc: 'Soporta hasta 75kg de peso.', icon: 'Shield' },
        { title: 'Móvil', desc: 'Ruedas 360° para moverse fácilmente.', icon: 'RefreshCw' }
      ],
      steps: [
        { step: 1, title: 'Abre', desc: 'Despliega el asiento de la maleta.' },
        { step: 2, title: 'Siéntate', desc: 'Tu hijo se sienta y espera cómodamente.' },
        { step: 3, title: 'Muévete', desc: 'Rueda por el aeropuerto mientras esperan.' }
      ],
      whyChoose: [
        'Solución 2 en 1 para viajes familiares',
        'Asiento resistente para niños de hasta 75kg',
        'Diseño divertido que encanta a los peques',
        'Capacidad de 40L para toda la ropa necesaria'
      ]
    }
  }
];
