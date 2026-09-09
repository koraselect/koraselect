import { Product, Category, AffiliateConfig } from '../types/product';

export const INITIAL_AFFILIATE_CONFIG: AffiliateConfig = {
  tag: 'neostore-20',
  totalClicks: 148,
  estimatedCommissions: 324.50,
  currency: 'USD',
  siteName: 'LUXE COLLAGE',
  siteTagline: 'Amazon Afiliados A+ Premium Selection',
  defaultCommissionRate: 6.0,
  customBannerText: 'Selección Curada de Amazon Afiliados'
};

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Todas las Colecciones',
    icon: 'Grid',
    description: 'Catálogo completo de listas curadas para Amazon Afiliados'
  },
  {
    id: 'viaje-familiar',
    name: 'Viaje Familiar & Equipaje',
    icon: 'Luggage',
    description: 'Equipaje multifuncional, maletas ride-on y esenciales para volar en familia'
  },
  {
    id: 'maternidad-bebe',
    name: 'Maternidad & Bebé Lux',
    icon: 'Baby',
    description: 'Diseño prémium para padres modernos que buscan estilo y máxima utilidad'
  },
  {
    id: 'hogar-minimalista',
    name: 'Hogar Minimalista',
    icon: 'Home',
    description: 'Mobiliario, organización y decoración en tonos warm beige y neutros'
  },
  {
    id: 'tecnologia-estilo',
    name: 'Tecnología & Gadgets',
    icon: 'Sparkles',
    description: 'Gadgets elegantes y soluciones térmicas/electrónicas de alta conversión'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Rainro & Co - Maleta Ride-on con Freno Integrado 42L',
    subtitle: 'Diseñada por padres para viajes familiares seguros y sin estrés',
    category: 'viaje-familiar',
    price: 189.99,
    originalPrice: 229.00,
    rating: 4.9,
    reviewsCount: 342,
    amazonUrl: 'https://www.amazon.com/dp/B08X1L9999',
    asin: 'B08X1L9999',
    mainImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    badge: 'A+ Premium Top Seller',
    dimensions: '19.7 in (50 cm) x 14.6 in (37 cm) x 10.6 in (27 cm)',
    capacity: '42L (3-5 Días de Viaje)',
    colors: [
      { name: 'Butter Beige', hex: '#EBE3D5', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Obsidian Black', hex: '#2B2B2B', imageUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59febd?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Whisper Blush', hex: '#F0D9D5', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80' }
    ],
    highlights: [
      { title: 'Wheel Brake System', description: 'Sistema de freno de rueda accionado con el pie para arrarques seguros y paradas firmes.', icon: 'ShieldCheck' },
      { title: 'Asiento de Seguridad', description: 'Arnés ajustable y diseño estable para llevar a los pequeños cómodamente en el aeropuerto.', icon: 'UserCheck' },
      { title: 'Tamaño Cabin-Friendly', description: 'Cumple con los requisitos internacionales de equipaje de mano en cabina.', icon: 'Plane' },
      { title: 'Bolsillo Interno Laptop & TSA Lock', description: 'Compartimento acolchado de fácil acceso y candado TSA integrado.', icon: 'Lock' }
    ],
    hotspots: [
      { id: 'h1', xPercent: 30, yPercent: 40, title: 'Asiento Ergonómico', description: 'Soporta hasta 30 kg con cinturón reforzado.' },
      { id: 'h2', xPercent: 75, yPercent: 20, title: 'Freno Pedaleable', description: 'Paso 1: Presiona para bloquear. Paso 2: Eleva para liberar.' },
      { id: 'h3', xPercent: 50, yPercent: 85, title: 'Ruedas Silenciosas 360°', description: 'Rodamiento ultrasuave en cualquier superficie.' }
    ],
    description: 'La solución definitiva para padres viajeros. Combina un equipaje de mano de 42L de capacidad con un cochecito/asiento seguro para niños.',
    aPlusContent: {
      heroTitle: 'Luxury Design. Made For Real Travel.',
      heroSubtitle: 'Un equipaje de mano prémium diseñado para familias modernas: diseño contorneado y máxima funcionalidad.',
      bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      features: [
        { title: 'Frenos Integrados de Rueda', desc: 'Control de seguridad en pendientes e interrupciones rápidas.', icon: 'Shield' },
        { title: 'Tejido Impermeable & Organizador', desc: 'Mantiene todo seco y ordenado con separadores de cremallera.', icon: 'Droplets' },
        { title: 'Diseñado por Mamás para Familias', desc: 'Ergonomía estudiada para evitar la fatiga en aeropuertos.', icon: 'Heart' }
      ],
      steps: [
        { step: 1, title: 'Presiona el Freno', desc: 'Empuja hacia abajo con el pie para bloquear las ruedas de seguridad.' },
        { step: 2, title: 'Libera la Marcha', desc: 'Presiona hacia arriba para desbloquear y rodar suavemente.' }
      ],
      whyChoose: [
        'Aprobado por aerolíneas globales como equipaje de mano',
        'Material ABS+PC ultrarresistente y ligero',
        'Compartimento para portátil con acceso rápido sin abrir la maleta',
        'Garantía oficial de marca de 3 años'
      ]
    }
  },
  {
    id: 'prod-2',
    title: 'Organizador de Viaje Impermeable Smart Packing 42L Set',
    subtitle: 'Cubos de compresión para mantener la ropa impecable en ruta',
    category: 'viaje-familiar',
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.8,
    reviewsCount: 890,
    amazonUrl: 'https://www.amazon.com/dp/B08X2L8888',
    asin: 'B08X2L8888',
    mainImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    badge: 'Amazon Choice',
    dimensions: 'Set de 6 piezas variadas',
    colors: [
      { name: 'Warm Beige', hex: '#EBE3D5' },
      { name: 'Sage Green', hex: '#BAC7BE' },
      { name: 'Muted Pink', hex: '#E3C9C9' }
    ],
    highlights: [
      { title: 'Compresión por Cremallera Doble', description: 'Ahorra hasta un 60% de espacio en tu maleta.', icon: 'Maximize2' },
      { title: 'Nylon Impermeable 420D', description: 'Protege contra derrames de líquidos y humedad.', icon: 'Droplet' }
    ],
    description: 'Mantén todo el vestuario de la familia organizado por categorías y preparado para empacar en minutos.'
  },
  {
    id: 'prod-3',
    title: 'Mochila Pañalera Lux de Cuero Vegano Obsidian Black',
    subtitle: 'Elegancia sofisticada con conector térmico para biberones y cambiador',
    category: 'maternidad-bebe',
    price: 89.90,
    originalPrice: 119.00,
    rating: 4.9,
    reviewsCount: 512,
    amazonUrl: 'https://www.amazon.com/dp/B08X3L7777',
    asin: 'B08X3L7777',
    mainImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
    badge: 'Edición Limitada',
    colors: [
      { name: 'Obsidian Black', hex: '#1C1C1C' },
      { name: 'Cognac Leather', hex: '#9E5B32' },
      { name: 'Whisper Blush', hex: '#F0D9D5' }
    ],
    highlights: [
      { title: '14 Compartimentos Inteligentes', description: 'Distribución perfecta para toallitas, pañales y tus objetos personales.', icon: 'Layers' },
      { title: 'Ganchos para Cochecito Incluidos', description: 'Fíjala al manillar de la maleta o cochecito en un segundo.', icon: 'Link' }
    ],
    description: 'La pañalera que no parece una pañalera. Estilo prémium que se adapta al ritmo de vida urbano y los viajes.'
  },
  {
    id: 'prod-4',
    title: 'Lámpara Humidificador Ultrasónico Whisper Quiet Home',
    subtitle: 'Ambiente reconfortante con luz cálida regulable y difusión de aromas',
    category: 'hogar-minimalista',
    price: 45.00,
    originalPrice: 59.99,
    rating: 4.7,
    reviewsCount: 1240,
    amazonUrl: 'https://www.amazon.com/dp/B08X4L6666',
    asin: 'B08X4L6666',
    mainImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    badge: 'Favorito de Interiores',
    colors: [
      { name: 'Soft Cream', hex: '#FDFBF7' },
      { name: 'Eucalyptus Sage', hex: '#8B9E8F' }
    ],
    highlights: [
      { title: 'Autonomía de 24 Horas', description: 'Tanque de 2.5L con apagado automático de seguridad.', icon: 'Clock' },
      { title: 'Silencio Absoluto < 20dB', description: 'Ideal para la habitación de los bebés y noches tranquilas.', icon: 'Moon' }
    ],
    description: 'Mejora la calidad del aire del hogar mientras añade una pieza de diseño minimalista a la mesa de noche.'
  },
  {
    id: 'prod-5',
    title: 'Vaso Térmico Acero Inoxidable Insulated Tumbler 1.2L',
    subtitle: 'Conserva frío por 30 horas con pajita hermética antigoteo',
    category: 'tecnologia-estilo',
    price: 39.95,
    originalPrice: 49.95,
    rating: 4.9,
    reviewsCount: 2310,
    amazonUrl: 'https://www.amazon.com/dp/B08X5L5555',
    asin: 'B08X5L5555',
    mainImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    badge: 'Viral en Redes',
    colors: [
      { name: 'Butter Beige', hex: '#EBE3D5' },
      { name: 'Sage Leaf', hex: '#99A89E' },
      { name: 'Soft Rose', hex: '#EACAC6' }
    ],
    highlights: [
      { title: 'Aislamiento de Doble Pared', description: 'Mantiene tus bebidas heladas durante todo el día de viaje.', icon: 'Thermometer' },
      { title: 'Base Angosta para Portavasos', description: 'Encaja a la perfección en el portavasos del coche y de la maleta.', icon: 'CheckCircle' }
    ],
    description: 'El accesorio de hidratación definitivo con acabado satinado mate antideslizante.'
  },
  {
    id: 'prod-6',
    title: 'Cochecito Ultra-Compacto Cabin-Friendly Lightweight',
    subtitle: 'Plegado instantáneo con una sola mano y suspensión en 4 ruedas',
    category: 'viaje-familiar',
    price: 219.00,
    originalPrice: 269.00,
    rating: 4.8,
    reviewsCount: 620,
    amazonUrl: 'https://www.amazon.com/dp/B08X6L4444',
    asin: 'B08X6L4444',
    mainImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
    badge: 'Imperdible de Viaje',
    colors: [
      { name: 'Oatmeal Beige', hex: '#DDD4C4' },
      { name: 'Midnight Blue', hex: '#1E2A38' }
    ],
    highlights: [
      { title: 'Peso Ultra Ligero 5.9 kg', description: 'Fácil de transportar con su correa de hombro integrada.', icon: 'Feather' },
      { title: 'Capota UPF 50+ Extensible', description: 'Protección solar óptima para paseos al aire libre.', icon: 'Sun' }
    ],
    description: 'Vuela sin complicaciones llevando tu cochecito hasta la puerta del avión.'
  }
];
