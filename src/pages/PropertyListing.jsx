import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, ChevronUp,
  Check, RotateCcw, Trash2, Home, Building2, Building, Castle, TreePine,
  Store, Bed, Bath, Maximize, MapPin, CheckCircle2, PlusCircle
} from 'lucide-react';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard/PropertyCard';
import { propertyAPI, propertyTypeAPI, amenityAPI } from '../api';

const SORT_OPTIONS = [
  { key: 'created_at_desc', label: 'Newest First', sort_by: 'created_at', sort_order: 'desc' },
  { key: 'price_asc', label: 'Price: Low → High', sort_by: 'price', sort_order: 'asc' },
  { key: 'price_desc', label: 'Price: High → Low', sort_by: 'price', sort_order: 'desc' },
  { key: 'views_desc', label: 'Most Viewed', sort_by: 'views_count', sort_order: 'desc' },
  { key: 'sqft_desc', label: 'Largest First', sort_by: 'details.total_sqft', sort_order: 'desc' },
];

const PRICE_CHIPS = [
  { label: 'Under $100K', min: '', max: '100000' },
  { label: '$100K–$500K', min: '100000', max: '500000' },
  { label: '$500K–$1M', min: '500000', max: '1000000' },
  { label: '$1M–$5M', min: '1000000', max: '5000000' },
  { label: '$5M+', min: '5000000', max: '' },
];

const FALLBACK_AMENITIES = [
  'Central AC', 'Pool', 'Garage', 'Hardwood Floors',
  'Fireplace', 'In-unit Laundry', 'Gym', 'Doorman',
  'Wifi', 'Balcony', 'Elevator', 'Pet Friendly',
];

export default function PropertyListing() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    listing_type: searchParams.get('listing_type') || '',
    property_type_id: searchParams.get('property_type_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms_min: searchParams.get('bedrooms_min') || '',
    bathrooms_min: searchParams.get('bathrooms_min') || '',
    min_sqft: searchParams.get('min_sqft') || '',
    max_sqft: '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: parseInt(searchParams.get('page')) || 1,
  });
  const [selectedAmenities, setSelectedAmenities] = useState({});

  useEffect(() => { loadPropertyTypes(); loadAmenities(); }, []);
  useEffect(() => { loadProperties(); }, [filters.page, filters.sort_by, filters.sort_order]);

  const loadPropertyTypes = async () => {
    try { const r = await propertyTypeAPI.list(); setPropertyTypes(r.data || []); } catch(e) {}
  };
  const loadAmenities = async () => {
    try { const r = await amenityAPI.list(); setAmenitiesList(r.data || []); } catch(e) {}
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = { limit: 10 };
      Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== null) params[k] = v; });
      const amenKeys = Object.keys(selectedAmenities).filter(k => selectedAmenities[k]);
      if (amenKeys.length > 0) params.amenities = amenKeys.join(',');
      const res = await propertyAPI.list(params);
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const sortKey = `${filters.sort_by === 'created_at' ? 'created_at' : filters.sort_by === 'price' ? 'price' : filters.sort_by === 'views_count' ? 'views' : 'sqft'}_${filters.sort_order}`;
  const currentSort = SORT_OPTIONS.find(s => s.key === sortKey) || SORT_OPTIONS[0];

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    setTimeout(loadProperties, 50);
  };

  const clearFilters = () => {
    setFilters({ search: '', listing_type: '', property_type_id: '', min_price: '', max_price: '', bedrooms_min: '', bathrooms_min: '', min_sqft: '', max_sqft: '', city: '', state: '', sort_by: 'created_at', sort_order: 'desc', page: 1 });
    setSelectedAmenities({});
    setTimeout(loadProperties, 100);
  };

  const filterCount = [
    filters.listing_type, filters.property_type_id, filters.min_price, filters.max_price,
    filters.bedrooms_min, filters.bathrooms_min, filters.min_sqft, filters.max_sqft,
    filters.city, filters.state,
    ...Object.values(selectedAmenities).filter(Boolean).map(() => 'x'),
  ].filter(Boolean).length + (currentSort.key !== 'created_at_desc' ? 1 : 0);

  const f = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));
  const font = { fontFamily: 'Raleway, sans-serif' };

  return (
    <div>
      {/* Hero */}
      <div className="relative pt-28 pb-8 bg-neutral-900 text-center overflow-hidden">
        <div className="absolute -top-[40%] -right-[5%] w-[360px] h-[360px] rounded-full bg-white/[0.04]" />
        <div className="container-custom relative z-[1]">
          <h1 className="text-[28px] font-extrabold text-white tracking-tight">Explore Distressed & Wholesale Deals</h1>
          <p className="text-white/50 mt-2 text-sm font-medium">{total} investment opportunities available</p>
        </div>
      </div>

      <div className="container-custom py-7 pb-20">
        {/* Toolbar */}
        <div className="flex gap-3 items-center flex-wrap mb-6 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm max-md:flex-col max-md:items-stretch">
          <div className="flex items-center gap-2.5 flex-1 min-w-[180px] text-neutral-400">
            <Search size={18} />
            <input type="text" placeholder="Search properties..." value={filters.search}
              onChange={e => f('search', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="border-none bg-transparent text-sm w-full text-neutral-900 outline-none font-medium placeholder:text-neutral-400" style={font} />
          </div>
          <div className="flex items-center gap-2 flex-wrap max-md:w-full max-md:justify-between">
            <div className="flex gap-1">
              {['', 'sale', 'rent', 'lease'].map(t => (
                <button key={t} className={`chip ${filters.listing_type === t ? 'active' : ''}`}
                  onClick={() => { f('listing_type', t); f('page', 1); setTimeout(loadProperties, 100); }}>
                  {t === '' ? 'All' : t === 'sale' ? 'Buy' : t === 'rent' ? 'Rent' : 'Lease'}
                </button>
              ))}
            </div>
            <button className={`btn btn-outline btn-sm ${filterCount > 0 ? '!border-neutral-900 !text-neutral-900' : ''}`}
              onClick={() => setShowFilters(true)}>
              <SlidersHorizontal size={16} /> Filters
              {filterCount > 0 && <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">{filterCount}</span>}
            </button>
            <div className="flex border border-neutral-200 rounded-xl overflow-hidden">
              <button className={`px-2.5 py-2 border-none cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-400'}`} onClick={() => setViewMode('grid')}><Grid3X3 size={18} /></button>
              <button className={`px-2.5 py-2 border-none cursor-pointer transition-all ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-400'}`} onClick={() => setViewMode('list')}><List size={18} /></button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className={`grid gap-5 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1'}`}>
          {loading
            ? Array(8).fill(null).map((_, i) => <PropertyCardSkeleton key={i} />)
            : properties.length > 0
            ? properties.map(p => <PropertyCard key={p.id} property={p} />)
            : (
              <div className="col-span-full flex flex-col items-center gap-3 py-20 text-neutral-400 text-center">
                <Search size={48} />
                <h3 className="text-xl font-bold text-neutral-900">No properties found</h3>
                <p>Try adjusting your filters</p>
                <button className="btn btn-outline mt-2" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-11">
            <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1} onClick={() => f('page', filters.page - 1)}>Previous</button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = filters.page <= 3 ? i + 1 : filters.page - 2 + i;
                if (page > totalPages) return null;
                return (
                  <button key={page} style={font}
                    className={`w-10 h-10 flex items-center justify-center border rounded-xl text-sm font-semibold cursor-pointer transition-all
                      ${filters.page === page ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}
                    onClick={() => f('page', page)}>{page}</button>
                );
              })}
            </div>
            <button className="btn btn-ghost btn-sm" disabled={filters.page >= totalPages} onClick={() => f('page', filters.page + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* ═══ FILTER MODAL — matches app ═══ */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-[1100] flex items-end justify-center" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full max-w-[640px] rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up"
            style={font} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100 shrink-0">
              <button className="flex items-center gap-1.5 text-neutral-900 text-[13px] font-semibold bg-transparent border-none cursor-pointer" onClick={clearFilters}>
                <RotateCcw size={15} /> Reset
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-neutral-900">Filters</span>
                {filterCount > 0 && <span className="w-[22px] h-[22px] rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">{filterCount}</span>}
              </div>
              <button className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center border-none cursor-pointer text-neutral-500 hover:bg-neutral-200"
                onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7">

              {/* Sort By */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Sort By</h4>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl cursor-pointer text-left"
                  onClick={() => setShowSortPicker(!showSortPicker)}>
                  <span className="flex-1 text-sm font-semibold text-neutral-900">{currentSort.label}</span>
                  {showSortPicker ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>
                {showSortPicker && (
                  <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.key}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 last:border-none cursor-pointer text-left transition-all
                          ${currentSort.key === opt.key ? 'bg-neutral-900/5' : 'bg-transparent hover:bg-neutral-100'}`}
                        onClick={() => { f('sort_by', opt.sort_by); f('sort_order', opt.sort_order); setShowSortPicker(false); }}>
                        <span className={`flex-1 text-sm ${currentSort.key === opt.key ? 'font-bold text-neutral-900' : 'font-medium text-neutral-500'}`}>{opt.label}</span>
                        {currentSort.key === opt.key && <Check size={18} className="text-neutral-900" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Listing Type */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Listing Type</h4>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { k: '', l: 'All' }, { k: 'sale', l: 'Buy' },
                    { k: 'rent', l: 'Rent' }, { k: 'lease', l: 'Lease' },
                  ].map(t => (
                    <button key={t.k}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all
                        ${filters.listing_type === t.k ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                      onClick={() => f('listing_type', t.k)}>{t.l}</button>
                  ))}
                </div>
              </div>

              {/* Property Type Grid */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Property Type</h4>
                <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-2.5">
                  {propertyTypes.slice(0, 8).map(t => {
                    const sel = filters.property_type_id === t.id;
                    return (
                      <button key={t.id}
                        className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-[1.5px] cursor-pointer transition-all
                          ${sel ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'}`}
                        onClick={() => f('property_type_id', sel ? '' : t.id)}>
                        <Home size={22} className={sel ? 'text-white' : 'text-neutral-900'} />
                        <span className={`text-[11px] font-bold ${sel ? 'text-white' : 'text-neutral-500'}`}>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Price Range</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <span className="text-[15px] font-bold text-neutral-400">$</span>
                    <input type="number" placeholder="Min" value={filters.min_price} onChange={e => f('min_price', e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
                  </div>
                  <span className="text-neutral-300 font-bold">—</span>
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <span className="text-[15px] font-bold text-neutral-400">$</span>
                    <input type="number" placeholder="Max" value={filters.max_price} onChange={e => f('max_price', e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide">
                  {PRICE_CHIPS.map(q => {
                    const active = filters.min_price === q.min && filters.max_price === q.max;
                    return (
                      <button key={q.label}
                        className={`shrink-0 px-3.5 py-2 rounded-full border text-[12px] font-semibold cursor-pointer transition-all
                          ${active ? 'bg-neutral-900/10 border-neutral-900 text-neutral-900' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                        onClick={() => { f('min_price', active ? '' : q.min); f('max_price', active ? '' : q.max); }}>{q.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Bedrooms</h4>
                <div className="flex gap-2 flex-wrap">
                  {['', 1, 2, 3, 4, 5].map(n => {
                    const sel = filters.bedrooms_min == n; // eslint-disable-line
                    return (
                      <button key={n}
                        className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-[1.5px] text-sm font-semibold cursor-pointer transition-all
                          ${sel ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                        onClick={() => f('bedrooms_min', sel ? '' : n)}>
                        {n === '' ? 'Any' : <><span className="text-[16px] font-bold">{n}</span><Bed size={14} className={sel ? 'text-white' : 'text-neutral-400'} /></>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Bathrooms</h4>
                <div className="flex gap-2 flex-wrap">
                  {['', 1, 2, 3, 4, 5].map(n => {
                    const sel = filters.bathrooms_min == n; // eslint-disable-line
                    return (
                      <button key={n}
                        className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-[1.5px] text-sm font-semibold cursor-pointer transition-all
                          ${sel ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                        onClick={() => f('bathrooms_min', sel ? '' : n)}>
                        {n === '' ? 'Any' : <><span className="text-[16px] font-bold">{n}</span><Bath size={14} className={sel ? 'text-white' : 'text-neutral-400'} /></>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Area */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Area (sqft)</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <Maximize size={15} className="text-neutral-400" />
                    <input type="number" placeholder="Min sqft" value={filters.min_sqft} onChange={e => f('min_sqft', e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
                  </div>
                  <span className="text-neutral-300 font-bold">—</span>
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <Maximize size={15} className="text-neutral-400" />
                    <input type="number" placeholder="Max sqft" value={filters.max_sqft} onChange={e => f('max_sqft', e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Location</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-[2] flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <MapPin size={15} className="text-neutral-400" />
                    <input type="text" placeholder="City" value={filters.city} onChange={e => f('city', e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                    <input type="text" placeholder="State" maxLength={2} value={filters.state}
                      onChange={e => f('state', e.target.value.toUpperCase())}
                      className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full text-center placeholder:text-neutral-400" style={font} />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-[15px] font-bold text-neutral-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {(amenitiesList.length > 0 ? amenitiesList.map(a => a.name || a) : FALLBACK_AMENITIES).map(name => {
                    const sel = selectedAmenities[name];
                    return (
                      <button key={name}
                        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all
                          ${sel ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                        onClick={() => setSelectedAmenities(prev => ({ ...prev, [name]: !prev[name] }))}>
                        {sel ? <CheckCircle2 size={14} /> : <PlusCircle size={14} className="text-neutral-400" />}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-4" />
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center gap-3 px-5 py-4 pb-6 border-t border-neutral-100 shrink-0">
              <button className="flex items-center justify-center gap-2 px-5 h-[52px] rounded-2xl border-[1.5px] border-neutral-200 bg-white text-neutral-500 text-[13px] font-semibold cursor-pointer transition-all hover:border-neutral-400"
                onClick={() => { clearFilters(); setShowFilters(false); }}>
                <Trash2 size={16} /> Clear All
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-neutral-900 text-white text-[15px] font-bold border-none cursor-pointer transition-all hover:bg-black"
                onClick={applyFilters}>
                <Search size={18} /> Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
