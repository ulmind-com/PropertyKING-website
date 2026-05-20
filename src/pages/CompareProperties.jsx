import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, X, Check, GitCompareArrows, Bed, Bath, Maximize, Calendar, Car, MapPin } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

const font = { fontFamily: 'Raleway, sans-serif' };

const formatPrice = (p, u) => {
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p || 0);
  return u === 'per_month' ? `${f}/mo` : f;
};

const getImg = (p) => p?.images?.find(i => i.is_primary)?.url || p?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400';

export default function CompareProperties() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  const ATTR_ROWS = [
    { label: 'Price', icon: <span className="text-lg">💰</span>, render: (p) => <span className="text-lg font-extrabold text-neutral-900" style={font}>{formatPrice(p.price, p.price_unit)}</span> },
    { label: 'Type', icon: <span className="text-lg">🏠</span>, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.property_type_name || p.listing_type || '-'}</span> },
    { label: 'Bedrooms', icon: <Bed size={16} className="text-neutral-400" />, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.details?.bedrooms || 0} Beds</span> },
    { label: 'Bathrooms', icon: <Bath size={16} className="text-neutral-400" />, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.details?.bathrooms || 0} Baths</span> },
    { label: 'Square Ft', icon: <Maximize size={16} className="text-neutral-400" />, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.details?.total_sqft ? `${p.details.total_sqft.toLocaleString()} sqft` : '-'}</span> },
    { label: 'Year Built', icon: <Calendar size={16} className="text-neutral-400" />, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.details?.year_built || '-'}</span> },
    { label: 'Garage', icon: <Car size={16} className="text-neutral-400" />, render: (p) => <span className="text-[15px] font-bold text-neutral-900" style={font}>{p.details?.garage_spaces || 0} Spaces</span> },
    { label: 'Location', icon: <MapPin size={16} className="text-neutral-400" />, render: (p) => <span className="text-[13px] font-semibold text-neutral-500" style={font}>{p.location?.city}{p.location?.state ? `, ${p.location.state}` : ''}</span> },
  ];

  // Find best values for highlighting
  const getBest = () => {
    if (compareList.length < 2) return {};
    const best = {};
    // Lowest price = best
    const prices = compareList.map(p => p.price || Infinity);
    best.price = prices.indexOf(Math.min(...prices));
    // Most bedrooms = best
    const beds = compareList.map(p => p.details?.bedrooms || 0);
    best.beds = beds.indexOf(Math.max(...beds));
    // Most bathrooms
    const baths = compareList.map(p => p.details?.bathrooms || 0);
    best.baths = baths.indexOf(Math.max(...baths));
    // Largest sqft
    const sqft = compareList.map(p => p.details?.total_sqft || 0);
    best.sqft = sqft.indexOf(Math.max(...sqft));
    // Newest year
    const years = compareList.map(p => p.details?.year_built || 0);
    best.year = years.indexOf(Math.max(...years));
    return best;
  };
  const best = getBest();

  // Empty state
  if (compareList.length === 0) {
    return (
      <div className="pt-[72px] bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-100">
          <div className="container-custom flex items-center justify-between py-4">
            <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900 hover:bg-neutral-50 transition-all">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900" style={font}>Compare</h1>
            <div className="w-11" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center pt-24 pb-20 text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5">
            <GitCompareArrows size={36} className="text-neutral-300" />
          </div>
          <h3 className="text-xl font-extrabold text-neutral-900 mb-2" style={font}>Nothing to Compare</h3>
          <p className="text-[15px] text-neutral-400 max-w-[340px] leading-relaxed" style={font}>Add properties to compare them side by side and find the best one.</p>
          <button className="mt-7 px-8 py-3.5 bg-neutral-900 text-white rounded-2xl text-[15px] font-bold border-none cursor-pointer hover:bg-black transition-all" style={font}
            onClick={() => navigate('/properties')}>
            Explore Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-[72px] z-20">
        <div className="container-custom flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl border border-neutral-200 flex items-center justify-center bg-transparent cursor-pointer text-neutral-900 hover:bg-neutral-50 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900" style={font}>Compare</h1>
            <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{compareList.length}</span>
          </div>
          <button className="text-sm font-bold text-red-500 bg-transparent border-none cursor-pointer hover:text-red-700" style={font}
            onClick={clearCompare}>Clear All</button>
        </div>
      </div>

      {/* Compare Grid */}
      <div className="container-custom py-6 pb-20">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4" style={{ minWidth: compareList.length * 280 }}>
            {compareList.map((property, idx) => (
              <div key={property.id} className="flex-1 min-w-[260px] max-w-[340px]" style={{ animation: `fadeSlideIn 0.4s ease ${idx * 0.1}s both` }}>
                {/* Property Card */}
                <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-5 relative">
                  <button className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border-none cursor-pointer text-red-500 hover:bg-red-50"
                    onClick={() => removeFromCompare(property.id)}>
                    <X size={16} />
                  </button>
                  <div className="cursor-pointer" onClick={() => navigate(`/property/${property.slug || property.id}`)}>
                    <img src={getImg(property)} alt="" className="w-full h-[140px] object-cover bg-neutral-100" />
                    <div className="p-3.5">
                      <h3 className="text-[14px] font-bold text-neutral-900 leading-[20px] line-clamp-2 mb-1" style={font}>{property.title}</h3>
                      <p className="text-[12px] text-neutral-400 font-medium truncate" style={font}>
                        {property.location?.city}{property.location?.state ? `, ${property.location.state}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attribute Rows */}
                <div className="space-y-3">
                  {ATTR_ROWS.map((row, ri) => {
                    const isBest = (row.label === 'Price' && best.price === idx) ||
                      (row.label === 'Bedrooms' && best.beds === idx) ||
                      (row.label === 'Bathrooms' && best.baths === idx) ||
                      (row.label === 'Square Ft' && best.sqft === idx) ||
                      (row.label === 'Year Built' && best.year === idx);
                    return (
                      <div key={row.label} className={`bg-white p-4 rounded-2xl shadow-sm text-center relative ${isBest ? 'ring-2 ring-green-500/30 bg-green-50/30' : ''}`}>
                        {isBest && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><Check size={12} className="text-white" /></span>}
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          {row.icon}
                          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide" style={font}>{row.label}</span>
                        </div>
                        {row.render(property)}
                      </div>
                    );
                  })}

                  {/* Amenities */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide text-center mb-2" style={font}>Amenities</p>
                    {property.amenities?.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {property.amenities.slice(0, 5).map((am, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Check size={14} className="text-green-500 shrink-0" />
                            <span className="text-[13px] font-semibold text-neutral-500" style={font}>{am.name || am}</span>
                          </div>
                        ))}
                        {property.amenities.length > 5 && (
                          <span className="text-[11px] text-neutral-400 font-semibold text-center" style={font}>+{property.amenities.length - 5} more</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[13px] text-neutral-400 font-medium text-center" style={font}>None listed</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Pick Summary */}
        {compareList.length >= 2 && (
          <div 
            className="mt-8 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all" 
            style={{ animation: 'fadeSlideIn 0.5s ease 0.3s both' }}
            onClick={() => navigate(`/property/${compareList[best.price ?? 0]?.slug || compareList[best.price ?? 0]?.id}`)}
          >
            <h3 className="text-lg font-extrabold mb-1" style={font}>✨ Best Pick</h3>
            <p className="text-white/50 text-sm mb-4" style={font}>Based on price, space, and amenities</p>
            <div className="flex items-center gap-4">
              <img src={getImg(compareList[best.price ?? 0])} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h4 className="text-[15px] font-bold" style={font}>{compareList[best.price ?? 0]?.title}</h4>
                <p className="text-white/60 text-sm" style={font}>{formatPrice(compareList[best.price ?? 0]?.price, compareList[best.price ?? 0]?.price_unit)} — Best value for money</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
