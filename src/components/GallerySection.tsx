import React, { useState } from 'react';
import { X, ZoomIn, Sparkles } from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
}

export const GallerySection: React.FC = () => {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      src: '/src/assets/images/hero_spa_room_1790719191476.jpg',
      alt: 'Private candle-lit massage therapy room with plush linens and calm ambient light at Nthabi\'s Touch',
      title: 'Serene Treatment Suite',
      category: 'Studio Atmosphere',
    },
    {
      id: 'gal-2',
      src: '/src/assets/images/swedish_massage_1790719203105.jpg',
      alt: 'Clean folded ivory towels with organic amber glass massage oil bottles and eucalyptus leaves',
      title: 'Swedish Therapy Preparation',
      category: 'Massage Treatments',
    },
    {
      id: 'gal-3',
      src: '/src/assets/images/hot_stone_therapy_1790719218919.jpg',
      alt: 'Smooth black basalt stones resting on soft cream towel beside botanical oils and candlelight',
      title: 'Basalt Hot Stone Therapy',
      category: 'Therapeutic Warmth',
    },
    {
      id: 'gal-4',
      src: '/src/assets/images/milk_flower_bath_1790719228348.jpg',
      alt: 'Luxury freestanding bathtub filled with warm milky water and fresh floating pink rose petals',
      title: 'Luxe Milk & Flower Petal Soak',
      category: 'Signature Body Rituals',
    },
    {
      id: 'gal-5',
      src: '/src/assets/images/charcoal_salt_scrub_1790719238092.jpg',
      alt: 'Ceramic bowls with activated charcoal body exfoliant scrub and fine pink Himalayan salts',
      title: 'Charcoal & Salt Glow Therapy',
      category: 'Full Body Exfoliation',
    },
    {
      id: 'gal-6',
      src: '/src/assets/images/welcome_refreshments_1790719247502.jpg',
      alt: 'Welcome refreshment tray with glasses of chilled sparkling bubbles, herbal tea, and infused citrus water',
      title: 'Complimentary Luxe Refreshments',
      category: 'Signature Hospitality',
    },
  ];

  return (
    <section id="gallery" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
            Visual Sanctuary
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            The Studio Gallery
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed">
            Take a glimpse into our tranquil spaces, curated organic botanicals, and bespoke treatment setups in Sandton &amp; Fourways.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E8DEC8]"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

              {/* Hover Zoom Icon */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* Title & Category Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-[#FAF7F2]">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
                  {item.category}
                </span>
                <h3
                  className="text-lg font-serif text-[#FAF7F2]"
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#1C2E24] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] w-full overflow-hidden flex items-center justify-center bg-black/40">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="max-h-[75vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 bg-[#16241B] text-[#FAF7F2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-[#D4AF37]/20">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                  {activeImage.category}
                </span>
                <h4
                  className="text-xl font-serif text-[#FAF7F2]"
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                >
                  {activeImage.title}
                </h4>
              </div>
              <p className="text-xs text-[#C5DDD0] max-w-md">
                {activeImage.alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
