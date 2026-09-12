import { BlogPost } from '../types/blog';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'mejores-maletas-de-cabina-para-viajar',
    title: 'Las mejores maletas de cabina para viajar sin complicaciones',
    excerpt: 'En esta guía te mostramos qué buscar en una maleta de cabina y por qué estos modelos destacan para viajes de 3 a 5 días.',
    category: 'Equipaje',
    date: '2026-09-08',
    readTime: '6 min',
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    body: [
      {
        type: 'p',
        text: 'Elegir la maleta de cabina correcta cambia por completo la experiencia de viajar. Una buena maleta debe ser ligera, resistente y lo suficientemente espaciosa para un viaje corto. En esta reseña te contamos las características que recomendamos revisar antes de comprar.'
      },
      {
        type: 'h2',
        text: '¿Qué hace buena a una maleta de cabina?'
      },
      {
        type: 'list',
        items: [
          'Peso bajo: cuanto más ligera, más espacio para tu ropa sin exceder el límite de la aerolínea.',
          'Ruedas de giro completo 360° para moverte con facilidad por aeropuertos y terminales.',
          'Material resistente al agua y a los golpes para proteger lo que llevas adentro.',
          'Compartimentos inteligentes que te ayudan a mantener el orden durante el viaje.'
        ]
      },
      {
        type: 'p',
        text: 'Para viajes de 3 a 5 días recomendamos un volumen cercano a los 40 litros. Es la medida perfecta para subirla como equipaje de mano en la mayoría de vuelos internacionales y seguir llevando lo esencial contigo.'
      },
      {
        type: 'h2',
        text: 'Nuestra selección de maletas de cabina'
      },
      {
        type: 'product',
        title: 'Maleta Plegable para Viaje — Capacidad 40L',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Con apenas 1.5 kg es ideal para quienes priorizan el peso. Se pliega para guardarla en casa y cumple con las medidas de equipaje de mano.',
        amazonUrl: 'https://www.amazon.com/dp/B0DJ444QWC',
        rating: 4.9,
        reviewsCount: 100
      },
      {
        type: 'product',
        title: 'Maleta Coequillaje con Ruedas Giratorias 360°',
        image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Su tapa extensible suma espacio extra cuando lo necesitas, y su candado de 3 dígitos mantiene tus pertenencias seguras en ruta.',
        amazonUrl: 'https://www.amazon.com/dp/B0FFMVP2HQ',
        rating: 4.8,
        reviewsCount: 1804
      },
      {
        type: 'quote',
        text: 'Consejo: siempre revisa las medidas y el peso permitido de tu aerolínea antes de comprar. Casi todos los vuelos aceptan maletas de mano, pero los límites varían.'
      }
    ]
  },
  {
    slug: 'mejores-botellas-y-termos-de-acero-inoxidable',
    title: 'Botellas y termos: cómo mantener tus bebidas en la temperatura ideal',
    excerpt: 'Revisamos las opciones que recomendamos para hidratarte bien en casa, en la oficina y de viaje, y qué considerar antes de elegir tu botella.',
    category: 'Hidratación',
    date: '2026-09-05',
    readTime: '5 min',
    coverImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    body: [
      {
        type: 'p',
        text: 'Llevar tu propia botella reutilizable no solo es mejor para el planeta: también te mantiene hidratado y ahorras en compras innecesarias. Elegir el material correcto marca la diferencia entre una bebida que sabe fresca o una que pierde su temperatura en horas.'
      },
      {
        type: 'h2',
        text: '¿Vidrio, acero inoxidable o plástico?'
      },
      {
        type: 'list',
        items: [
          'Vidrio templado: libre de BPA, no transmite sabores y se limpia fácilmente.',
          'Acero inoxidable: ideal para mantener frío o calor durante muchas horas.',
          'Cierre hermético: evita derrames en la mochila, el coche o la maleta.'
        ]
      },
      {
        type: 'p',
        text: 'Si viajas seguido, te recomendamos opciones con cierre hermético y que se puedan limpiar sin complicaciones. Para el día a día, las botellas de vidrio templado son una excelente alternativa cuando prefieres un sabor limpio.'
      },
      {
        type: 'h2',
        text: 'Lo que probamos en esta guía'
      },
      {
        type: 'product',
        title: 'Set de Botellas de Vidrio 600ml x3 + Bolsa de Hielo',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Un set de tres botellas de vidrio templado con tapón hermético y bolsa de hielo portátil. Práctico para compartir en casa.',
        amazonUrl: 'https://www.amazon.com/dp/B083JLBG8D',
        rating: 4.8,
        reviewsCount: 2904
      },
      {
        type: 'quote',
        text: 'Nota: el vidrio templado de calidad aguanta cambios de temperatura y se cuida mejor si lo lavas a mano o usas ciclo suave en el lavavajillas.'
      }
    ]
  },
  {
    slug: 'guia-organizacion-de-equipaje-y-neceseres',
    title: 'Guía de organización de equipaje y neceseres para viajar ligero',
    excerpt: 'Organizar bien tu equipaje te ahorra tiempo, espacio y estrés. Te mostramos qué accesorios facilitan viajar ordenado.',
    category: 'Organización',
    date: '2026-09-02',
    readTime: '5 min',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80',
    body: [
      {
        type: 'p',
        text: 'La diferencia entre un viaje caótico y uno relajado suele estar en la organización. Cuando cada cosa tiene su lugar, empacamos en minutos y encontramos todo sin vaciar la maleta entera.'
      },
      {
        type: 'h2',
        text: 'Empieza por separar por categorías'
      },
      {
        type: 'list',
        items: [
          'Ropa interior y calcetines: mejor en cajas con divisores.',
          'Artículos de higiene: en un neceser estanco para evitar derrames.',
          'Accesorios y cables: en estuches compactos separados del resto.',
          'Zapatos y calzado: lejos de tu ropa limpia.'
        ]
      },
      {
        type: 'p',
        text: 'Los neceseres reversibles o estancos son clave para que un gel o shampoo no arruine la ropa. Y en casa, los organizadores con divisores te ayudan a mantener el cajón impecable todo el año.'
      },
      {
        type: 'h2',
        text: 'Nuestros recomendados'
      },
      {
        type: 'product',
        title: 'Organizador de Lencería — 4 Cajas + 12 Divisores',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Perfecto para ordenar el cajón en casa y para usar como módulos de viaje en la maleta gracias a su diseño modular.',
        amazonUrl: 'https://www.amazon.com/dp/B0CXKWMF5Y',
        rating: 4.7,
        reviewsCount: 3486
      },
      {
        type: 'product',
        title: 'Estuche Neceser Grande para Mujer',
        image: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Con múltiples compartimentos y material impermeable, es una aliada confiable para llevar lo esencial en cualquier viaje.',
        amazonUrl: 'https://www.amazon.com/dp/B0CWH3L8DZ',
        rating: 4.9,
        reviewsCount: 2243
      },
      {
        type: 'product',
        title: 'Estuche de Viaje de 3 Piezas — Neceser de Dama',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Tres estuches de distintos tamaños para separar productos de higiene, cosméticos y accesorios dentro de tu maleta.',
        amazonUrl: 'https://www.amazon.com/dp/B0DJ26GNYN',
        rating: 4.9,
        reviewsCount: 200
      },
      {
        type: 'product',
        title: 'Estuche Neceser Acolchada para Mujer',
        image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Su interior acolchado protege tus productos y su tamaño compacto la hace fácil de llevar en cualquier bolso.',
        amazonUrl: 'https://www.amazon.com/dp/B0D8YHBB37',
        rating: 4.7,
        reviewsCount: 386
      }
    ]
  },
  {
    slug: 'top-gadgets-de-tecnologia-para-el-hogar',
    title: 'Gadgets de tecnología que hacen la vida en el hogar más cómoda',
    excerpt: 'Pequeños dispositivos que mejoran el descanso, la hidratación y el ambiente de tu casa. Conoce los que recomendamos.',
    category: 'Tecnología',
    date: '2026-08-28',
    readTime: '5 min',
    coverImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    body: [
      {
        type: 'p',
        text: 'No hace falta gastar de más: un par de gadgets bien elegidos mejoran la calidad del sueño, la hidratación y el ambiente de tu hogar. En esta selección te recomendamos accesorios prácticos con buena valoración de quienes ya los usan.'
      },
      {
        type: 'h2',
        text: '¿Qué valoramos en un gadget para el hogar?'
      },
      {
        type: 'list',
        items: [
          'Funcionalidad real: que resuelva un problema cotidiano.',
          'Bajo consumo y funcionamiento silencioso.',
          'Materiales seguros y fáciles de limpiar.',
          'Buenas reseñas y usabilidad simple.'
        ]
      },
      {
        type: 'p',
        text: 'Estos dispositivos destacan por combinar utilidad con diseño, por lo que se integran fácilmente en cualquier hogar sin ocupar demasiado espacio.'
      },
      {
        type: 'h2',
        text: 'Recomendados'
      },
      {
        type: 'product',
        title: 'Lámpara Humidificador Ultrasónico',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Mejora la calidad del aire con luz cálida regulable y funcionamiento de menos de 20 dB: ideal para dormitorios.',
        amazonUrl: 'https://www.amazon.com/dp/B08X4L6666',
        rating: 4.7,
        reviewsCount: 1240
      },
      {
        type: 'product',
        title: 'Vaso Térmico de Acero Inoxidable 1.2L',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Mantiene tus bebidas frías por horas con aislamiento de doble pared y base compatible con portavasos.',
        amazonUrl: 'https://www.amazon.com/dp/B08X5L5555',
        rating: 4.9,
        reviewsCount: 2310
      },
      {
        type: 'quote',
        text: 'Recuerda: el precio y la disponibilidad de estos productos pueden cambiar en Amazon. Siempre revisa la ficha actualizada antes de comprar.'
      }
    ]
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((post) => post.slug === slug);

export const getBlogMeta = (): { slug: string; title: string; excerpt: string; category: string; date: string; readTime: string; coverImage: string }[] =>
  BLOG_POSTS.map(({ body, ...meta }) => meta);