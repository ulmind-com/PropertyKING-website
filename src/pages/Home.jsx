import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, ChevronRight, SlidersHorizontal, X,
  Home as HomeIcon, Building2, AlignJustify, Layers, ChevronDown, ChevronUp,
  Shield, Star, Users, TrendingUp, Grid2X2, Check, RotateCcw, Trash2,
  Bed, Bath, Maximize, CheckCircle2, PlusCircle
} from 'lucide-react';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard/PropertyCard';
import { propertyAPI, propertyTypeAPI, amenityAPI } from '../api';

const TYPE_ICON_MAP = {
  'house':      <HomeIcon size={22} />,
  'villa':      <HomeIcon size={22} />,
  'condo':      <Building2 size={22} />,
  'apartment':  <Grid2X2 size={22} />,
  'apt.':       <Grid2X2 size={22} />,
  'townhouse':  <Layers size={22} />,
  'commercial': <AlignJustify size={22} />,
  'office':     <Building2 size={22} />,
  'land':       <MapPin size={22} />,
};

const getTypeIcon = (name = '') =>
  TYPE_ICON_MAP[name.toLowerCase()] || <HomeIcon size={22} />;

const FALLBACK_TYPES = [
  { id: 't1', name: 'House' },
  { id: 't2', name: 'Condo' },
  { id: 't3', name: 'Townhouse' },
  { id: 't4', name: 'Apartment' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyTypes, setPropertyTypes] = useState(FALLBACK_TYPES);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [topViewedProperties, setTopViewedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filter modal state
  const [showFilters, setShowFilters] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [ff, setFf] = useState({ listing_type: '', property_type_id: '', min_price: '', max_price: '', bedrooms_min: '', bathrooms_min: '', min_sqft: '', max_sqft: '', city: '', state: '', sort_by: 'created_at', sort_order: 'desc' });
  const [selAmenities, setSelAmenities] = useState({});
  const [locationName, setLocationName] = useState('Detecting...');
  const [nearbyProperties, setNearbyProperties] = useState([]);

  useEffect(() => { loadData(); loadAmenities(); }, []);

  // Fetch location automatically (free Nominatim reverse geocoding)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName('Location denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown';
          const state = data.address.state || '';
          setLocationName(state ? `${city}, ${state}` : city);
          
          // Fetch nearby properties
          const nearbyRes = await propertyAPI.nearby({ lat, lng, radius_miles: 25, limit: 10 });
          setNearbyProperties(nearbyRes.data?.properties || []);
        } catch(e) {
          setLocationName('Unknown location');
        }
      },
      () => setLocationName('Location denied'),
      { timeout: 10000 }
    );
  }, []);

  const loadData = async () => {
    try {
      const [typesRes, propsRes, topRes] = await Promise.allSettled([
        propertyTypeAPI.list(),
        propertyAPI.recommendations({ limit: 10 }),
        propertyAPI.topViewed({ limit: 10 }),
      ]);
      if (typesRes.status === 'fulfilled' && typesRes.value.data?.length > 0)
        setPropertyTypes(typesRes.value.data);
      if (propsRes.status === 'fulfilled')
        setFeaturedProperties(propsRes.value.data.properties || []);
      if (topRes.status === 'fulfilled')
        setTopViewedProperties(topRes.value.data.properties || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Reload featured properties when tab changes
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const params = { limit: 10 };
        if (listingType) params.listing_type = listingType;
        const res = await propertyAPI.list(params);
        setFeaturedProperties(res.data.properties || []);
      } catch(e) {}
    };
    loadFeatured();
  }, [listingType]);

  const loadAmenities = async () => {
    try { const r = await amenityAPI.list(); setAmenitiesList(r.data || []); } catch(e) {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (listingType) params.set('listing_type', listingType);
    navigate(`/properties?${params.toString()}`);
  };

  const SORT_OPTIONS = [
    { key: 'created_at_desc', label: 'Newest First', sb: 'created_at', so: 'desc' },
    { key: 'price_asc', label: 'Price: Low → High', sb: 'price', so: 'asc' },
    { key: 'price_desc', label: 'Price: High → Low', sb: 'price', so: 'desc' },
    { key: 'views_desc', label: 'Most Viewed', sb: 'views_count', so: 'desc' },
  ];
  const curSort = SORT_OPTIONS.find(s => s.sb === ff.sort_by && s.so === ff.sort_order) || SORT_OPTIONS[0];
  const PRICE_CHIPS = [
    { label: 'Under $100K', min: '', max: '100000' }, { label: '$100K–$500K', min: '100000', max: '500000' },
    { label: '$500K–$1M', min: '500000', max: '1000000' }, { label: '$1M+', min: '1000000', max: '' },
  ];
  const FALLBACK_AM = ['Pool','Garage','Gym','Wifi','Balcony','Fireplace','Central AC','Pet Friendly'];
  const fCount = [ff.listing_type, ff.property_type_id, ff.min_price, ff.max_price, ff.bedrooms_min, ff.bathrooms_min, ff.min_sqft, ff.city, ff.state, ...Object.values(selAmenities).filter(Boolean).map(() => 'x')].filter(Boolean).length;
  const clearFf = () => { setFf({ listing_type: '', property_type_id: '', min_price: '', max_price: '', bedrooms_min: '', bathrooms_min: '', min_sqft: '', max_sqft: '', city: '', state: '', sort_by: 'created_at', sort_order: 'desc' }); setSelAmenities({}); };
  const applyFf = () => {
    const p = new URLSearchParams();
    if (searchQuery) p.set('search', searchQuery);
    Object.entries(ff).forEach(([k,v]) => { if (v) p.set(k, v); });
    const ak = Object.keys(selAmenities).filter(k => selAmenities[k]);
    if (ak.length) p.set('amenities', ak.join(','));
    setShowFilters(false);
    navigate(`/properties?${p.toString()}`);
  };
  const fv = (k, v) => setFf(prev => ({ ...prev, [k]: v }));
  const fs = { fontFamily: 'Raleway, sans-serif' };

   return (
    <>
    <div>
      {/* ─── HERO — matches app gradient header ─── */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #000000 0%, #1C1C1E 40%, #3A3A3C 75%, #F5F5F5 100%)',
        minHeight: '100vh'
      }}>
        <div className="relative z-[2] container-custom pt-[120px] pb-[60px] flex flex-col min-h-screen">
          {/* Top Row — like app: avatar + location + bell */}
          <div className="animate-fade-in flex items-center gap-3 mb-10 max-md:mb-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.12] border border-white/[0.15] flex items-center justify-center text-white overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=User&background=random&color=fff" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] text-white/40 font-medium uppercase tracking-widest block mb-0.5">Location</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-white/70" />
                <span className="text-white font-extrabold text-[15px] tracking-tight">{locationName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center">
                <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 animate-pulse-soft" />
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="animate-fade-in flex-1 flex flex-col justify-center max-w-[680px]">
            <h1 className="text-[clamp(38px,6vw,68px)] font-black text-white leading-[1.05] tracking-tighter mb-5">
              <span className="block text-[clamp(28px,4vw,52px)]">Uncover Hidden</span>
              {listingType === 'sale' ? 'Fixer-Uppers' : listingType === 'rent' ? 'Cash-Flow Rentals' : 'Distressed Deals'}
              <span className="block text-white/35 text-[clamp(28px,4vw,52px)] mt-1">Before Anyone Else</span>
            </h1>
            <p className="text-white/45 text-[15px] max-w-[440px] leading-relaxed mb-10 max-md:mb-7">
              {listingType === 'sale' ? 'Find foreclosures, short sales, and off-market properties for pennies on the dollar. Your next big flip starts here.' : listingType === 'rent' ? 'Discover undervalued properties with massive rental yield potential. Perfect for serious investors.' : 'Exclusive access to distressed and underpriced real estate. Maximize your ROI with unbeatable wholesale deals.'}
            </p>
          </div>

          {/* Search Box — matches app search bar style */}
          <div className="animate-slide-up max-w-[660px] w-full">
            <div className="flex gap-1 mb-[-1px] relative z-[1]">
              {[
                { val: '', label: 'All' },
                { val: 'sale', label: 'Sale' },
                { val: 'rent', label: 'Rent' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  className={`px-5 py-2.5 border-none rounded-t-xl text-sm font-bold cursor-pointer transition-all
                    ${listingType === val ? 'bg-white text-neutral-900' : 'bg-white/10 text-white/50 hover:text-white/70'}
                  `}
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                  onClick={() => setListingType(val)}
                >
                  {label}
                </button>
              ))}
            </div>
            <form className="flex bg-white rounded-tr-2xl rounded-b-2xl p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.35)]" onSubmit={handleSearch}>
              <div className="flex-1 flex items-center gap-3 px-4">
                <MapPin size={20} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search city, state, zip code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none text-[15px] font-medium text-neutral-900 bg-transparent py-3.5 outline-none placeholder:text-neutral-400 placeholder:font-normal"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>
              <button type="submit" className="flex items-center gap-2 px-7 py-3.5 bg-neutral-900 text-white border-none rounded-xl text-[15px] font-bold cursor-pointer transition-all hover:bg-black hover:-translate-y-0.5 whitespace-nowrap" style={{ fontFamily: 'Raleway, sans-serif' }}>
                <Search size={20} />
                <span className="max-sm:hidden">Search</span>
              </button>
              <button type="button" onClick={() => setShowFilters(true)}
                className="flex items-center justify-center w-[52px] h-[52px] bg-neutral-100 rounded-xl border-none cursor-pointer text-neutral-900 hover:bg-neutral-200 transition-all shrink-0"
                title="Advanced Filters">
                <SlidersHorizontal size={20} />
              </button>
            </form>
          </div>

          {/* Stats row — dynamic */}
          <div className="animate-slide-up flex items-center mt-10 max-md:mt-7">
            {[
              { n: featuredProperties.length > 0 ? `${featuredProperties.length}+` : '...', l: listingType === 'sale' ? 'For Sale' : listingType === 'rent' ? 'For Rent' : 'Properties' },
              { n: topViewedProperties.reduce((s,p) => s + (p.views_count || 0), 0).toLocaleString() || '0', l: 'Total Views' },
              { n: propertyTypes.length || '...', l: 'Categories' },
            ].map(({ n, l }, i) => (
              <div key={l} className="flex items-center">
                {i > 0 && <div className="w-px h-9 bg-white/[0.1] mx-7 max-sm:mx-4" />}
                <div className="flex flex-col">
                  <span className="text-[28px] max-sm:text-[20px] font-black text-white tracking-tighter leading-none">{n}</span>
                  <span className="text-[11px] text-white/35 font-medium mt-1">{l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category Card ─── */}
      <section className="container-custom -mt-10 relative z-10">
        <div className="animate-fade-in bg-white rounded-3xl p-7 shadow-lg border border-neutral-100 max-w-[800px] mx-auto max-sm:mx-4 max-sm:p-5">
          <div className="grid grid-cols-4 gap-2 max-sm:gap-1">
            {propertyTypes.slice(0, 4).map((type) => (
              <div
                key={type.id}
                className="group flex flex-col items-center gap-2.5 py-5 px-3 max-sm:py-3 max-sm:px-1 rounded-2xl cursor-pointer transition-all hover:bg-neutral-100 hover:-translate-y-0.5"
                onClick={() => navigate(`/properties?property_type_id=${type.id}`)}
              >
                <div className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 transition-all group-hover:bg-neutral-900 group-hover:text-white">
                  {getTypeIcon(type.name)}
                </div>
                <span className="text-[13px] max-sm:text-[11px] font-bold text-neutral-900 text-center">{type.name}</span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100 cursor-pointer group"
            onClick={() => navigate('/properties')}
          >
            <span className="text-sm font-semibold text-neutral-500 transition-colors group-hover:text-neutral-900">All Categories</span>
            <ChevronRight size={16} className="text-neutral-400" />
          </div>
        </div>
      </section>

      {/* Deduplication logic */}
      {(() => {
        const finalNearby = nearbyProperties.slice(0, 6);
        const nearbyIds = new Set(finalNearby.map(p => p.id));
        const finalFeatured = featuredProperties.filter(p => !nearbyIds.has(p.id)).slice(0, 6);
        const featuredIds = new Set(finalFeatured.map(p => p.id));
        const finalTopViewed = topViewedProperties.filter(p => !nearbyIds.has(p.id) && !featuredIds.has(p.id)).slice(0, 4);

        return (
          <>
            {/* ─── Near Me Properties ─── */}
            {(loading || finalNearby.length > 0) && (
              <section className="py-[72px] max-md:py-[52px] bg-neutral-50/50 border-b border-neutral-100">
                <div className="container-custom">
                  <div className="flex justify-between items-end max-sm:items-center mb-9 gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><MapPin size={14} /></div>
                        NEAR ME
                      </div>
                      <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight">Properties Near You</h2>
                      <p className="text-[15px] max-sm:text-[13px] text-neutral-400 mt-1">Explore homes around {locationName}</p>
                    </div>
                    <Link to="/map" className="flex items-center justify-center gap-1 text-[13px] font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors shrink-0 whitespace-nowrap">
                      View Map <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1 gap-6 stagger-children">
                    {loading
                      ? Array(6).fill(null).map((_, i) => <PropertyCardSkeleton key={i} />)
                      : finalNearby.map((prop) => <PropertyCard key={prop.id} property={prop} />)}
                  </div>
                </div>
              </section>
            )}

            {/* ─── Featured Properties ─── */}
            <section className="py-[72px] max-md:py-[52px]">
              <div className="container-custom">
                <div className="flex justify-between items-end max-sm:items-center mb-9 gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900"><Star size={14} /></div>
                      FEATURED
                    </div>
                    <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight">Featured Properties</h2>
                    <p className="text-[15px] max-sm:text-[13px] text-neutral-400 mt-1">Hand-picked distressed & off-market listings for you</p>
                  </div>
                  <Link to="/properties" className="flex items-center justify-center gap-1 text-[13px] font-bold bg-neutral-100 text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shrink-0 whitespace-nowrap">
                    See all <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1 gap-6 stagger-children">
                  {loading
                    ? Array(6).fill(null).map((_, i) => <PropertyCardSkeleton key={i} />)
                    : finalFeatured.length > 0
                    ? finalFeatured.map((prop) => <PropertyCard key={prop.id} property={prop} />)
                    : (
                        <div className="col-span-full flex flex-col items-center gap-3 py-16 text-neutral-400 text-center">
                          <Building2 size={44} />
                          <h3 className="text-xl font-bold text-neutral-900">No properties yet</h3>
                          <p>Be the first to list a property!</p>
                        </div>
                      )}
                </div>
              </div>
            </section>

      {/* ─── Top Viewed ─── */}
      {(loading || finalTopViewed.length > 0) && (
        <section className="py-[72px] max-md:py-[52px] bg-neutral-50">
          <div className="container-custom">
            <div className="flex justify-between items-end max-sm:items-center mb-9 gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900"><TrendingUp size={14} /></div>
                  TRENDING
                </div>
                <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight">Top Viewed</h2>
                <p className="text-[15px] max-sm:text-[13px] text-neutral-400 mt-1">Most popular listings right now</p>
              </div>
              <Link to="/properties?sort_by=views_count&sort_order=desc" className="flex items-center justify-center gap-1 text-[13px] font-bold bg-neutral-100 text-neutral-900 px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shrink-0 whitespace-nowrap">
                See all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1 gap-6 stagger-children">
              {loading
                  ? Array(4).fill(null).map((_, i) => <PropertyCardSkeleton key={i} />)
                  : finalTopViewed.length > 0
                  ? finalTopViewed.map((prop) => <PropertyCard key={prop.id} property={prop} />)
                  : (
                        <div className="col-span-full flex flex-col items-center gap-3 py-16 text-neutral-400 text-center">
                          <Building2 size={44} />
                          <h3 className="text-xl font-bold text-neutral-900">No properties yet</h3>
                          <p>Be the first to list a property!</p>
                        </div>
                      )}
            </div>
          </div>
        </section>
      )}
      </>
    );
  })()}

      {/* ─── How It Works ─── */}
      <section className="py-[72px] max-md:py-[52px]">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center mb-9">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900"><Shield size={14} /></div>
              HOW IT WORKS
            </div>
            <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight">Simple. Fast. Secure.</h2>
            <p className="text-[15px] text-neutral-400 mt-1.5">Four easy steps to find or list your perfect property</p>
          </div>
          <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5">
            {[
              { n: '01', icon: <Search size={24} />, title: 'Search & Discover', desc: 'Browse thousands of verified listings with advanced filters and location-based search.' },
              { n: '02', icon: <HomeIcon size={24} />, title: 'Explore Details', desc: 'View high-quality photos, floor plans, virtual tours and complete property information.' },
              { n: '03', icon: <Users size={24} />, title: 'Connect & Inquire', desc: 'Contact property owners directly. Schedule viewings and get instant responses.' },
              { n: '04', icon: <Shield size={24} />, title: 'Secure & Move In', desc: 'All listings are admin-verified for your safety. Find your dream home with confidence.' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="relative bg-white border border-neutral-100 rounded-3xl p-7 transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-3.5 right-4 text-[52px] font-black text-neutral-100 leading-none tracking-tighter">{n}</div>
                <div className="w-[52px] h-[52px] flex items-center justify-center bg-neutral-100 text-neutral-900 rounded-2xl mb-4">{icon}</div>
                <h3 className="text-base font-bold text-neutral-900 mb-2.5 tracking-tight">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="pb-0">
        <div className="container-custom">
          <div className="relative bg-neutral-900 rounded-3xl p-[60px] max-lg:p-11 max-sm:p-9 flex max-lg:flex-col max-lg:text-center justify-between items-center gap-12 overflow-hidden">
            <div className="absolute -top-[60%] -right-[5%] w-[420px] h-[420px] rounded-full bg-white/5" />
            <div className="absolute -bottom-[40%] right-[20%] w-60 h-60 rounded-full bg-white/[0.04]" />
            <div className="relative z-[1] max-w-[560px] max-lg:max-w-full">
              <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-white mb-3.5 tracking-tight">Ready to List Your Property?</h2>
              <p className="text-base text-white/65 leading-relaxed mb-7">
                Join thousands of property owners and agents who trust PropertyKing to reach millions of potential buyers and renters across the United States.
              </p>
              <div className="flex gap-3 flex-wrap max-lg:justify-center">
                <button className="btn btn-lg bg-white text-neutral-900 hover:bg-white/90 shadow-none" onClick={() => navigate('/register')}>
                  Get Started Free <ArrowRight size={18} />
                </button>
                <button className="btn btn-lg border-[1.5px] border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/50" onClick={() => navigate('/properties')}>
                  Browse Properties
                </button>
              </div>
            </div>
            <div className="relative z-[1] flex flex-col max-lg:flex-row gap-5 max-lg:gap-7">
              {[
                { icon: <TrendingUp size={20} />, n: '95%', l: 'Client Satisfaction' },
                { icon: <Star size={20} />, n: '4.9/5', l: 'Average Rating' },
              ].map(({ icon, n, l }) => (
                <div key={l} className="flex items-center gap-4 text-white">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">{icon}</div>
                  <div>
                    <span className="text-2xl font-black block leading-none tracking-tight">{n}</span>
                    <span className="text-xs text-white/55 mt-0.5">{l}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>

    {/* ═══ FILTER MODAL ═══ */}
    {showFilters && (
      <div className="fixed inset-0 bg-black/50 z-[300] flex items-end justify-center" onClick={() => setShowFilters(false)}>
        <div className="bg-white w-full max-w-[640px] rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up" style={fs} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100 shrink-0">
            <button className="flex items-center gap-1.5 text-neutral-900 text-[13px] font-semibold bg-transparent border-none cursor-pointer" onClick={clearFf}><RotateCcw size={15} /> Reset</button>
            <div className="flex items-center gap-2"><span className="text-lg font-extrabold text-neutral-900">Filters</span>
              {fCount > 0 && <span className="w-[22px] h-[22px] rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">{fCount}</span>}
            </div>
            <button className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center border-none cursor-pointer text-neutral-500 hover:bg-neutral-200" onClick={() => setShowFilters(false)}><X size={20} /></button>
          </div>
          {/* Scroll */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7">
            {/* Sort */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Sort By</h4>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl cursor-pointer text-left" onClick={() => setShowSortPicker(!showSortPicker)}>
                <span className="flex-1 text-sm font-semibold text-neutral-900">{curSort.label}</span>
                {showSortPicker ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </button>
              {showSortPicker && <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden">
                {SORT_OPTIONS.map(o => <button key={o.key} className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 last:border-none cursor-pointer text-left transition-all ${curSort.key===o.key?'bg-neutral-900/5':'bg-transparent hover:bg-neutral-100'}`}
                  onClick={() => { fv('sort_by',o.sb); fv('sort_order',o.so); setShowSortPicker(false); }}>
                  <span className={`flex-1 text-sm ${curSort.key===o.key?'font-bold text-neutral-900':'font-medium text-neutral-500'}`}>{o.label}</span>
                  {curSort.key===o.key && <Check size={18} className="text-neutral-900" />}
                </button>)}
              </div>}
            </div>
            {/* Listing Type */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Listing Type</h4>
              <div className="flex gap-2 flex-wrap">{[{k:'',l:'All'},{k:'sale',l:'Buy'},{k:'rent',l:'Rent'},{k:'lease',l:'Lease'}].map(t =>
                <button key={t.k} className={`flex items-center gap-2 px-5 py-3 rounded-full border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all ${ff.listing_type===t.k?'bg-neutral-900 border-neutral-900 text-white':'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                  onClick={() => fv('listing_type',t.k)}>{t.l}</button>)}
              </div>
            </div>
            {/* Property Type */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Property Type</h4>
              <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-2.5">
                {propertyTypes.slice(0,8).map(t => { const sel = ff.property_type_id===t.id; return (
                  <button key={t.id} className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-[1.5px] cursor-pointer transition-all ${sel?'bg-neutral-900 border-neutral-900 text-white shadow-md':'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'}`}
                    onClick={() => fv('property_type_id',sel?'':t.id)}>
                    <HomeIcon size={22} className={sel?'text-white':'text-neutral-900'} />
                    <span className={`text-[11px] font-bold ${sel?'text-white':'text-neutral-500'}`}>{t.name}</span>
                  </button>)})}
              </div>
            </div>
            {/* Price */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Price Range</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12"><span className="text-[15px] font-bold text-neutral-400">$</span>
                  <input type="number" placeholder="Min" value={ff.min_price} onChange={e => fv('min_price',e.target.value)} className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={fs} /></div>
                <span className="text-neutral-300 font-bold">—</span>
                <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12"><span className="text-[15px] font-bold text-neutral-400">$</span>
                  <input type="number" placeholder="Max" value={ff.max_price} onChange={e => fv('max_price',e.target.value)} className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={fs} /></div>
              </div>
              <div className="flex gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide">{PRICE_CHIPS.map(q => {
                const a = ff.min_price===q.min && ff.max_price===q.max;
                return <button key={q.label} className={`shrink-0 px-3.5 py-2 rounded-full border text-[12px] font-semibold cursor-pointer transition-all ${a?'bg-neutral-900/10 border-neutral-900 text-neutral-900':'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                  onClick={() => { fv('min_price',a?'':q.min); fv('max_price',a?'':q.max); }}>{q.label}</button>})}
              </div>
            </div>
            {/* Bedrooms */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Bedrooms</h4>
              <div className="flex gap-2 flex-wrap">{['',1,2,3,4,5].map(n => { const sel = ff.bedrooms_min==n; return (
                <button key={n} className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-[1.5px] text-sm font-semibold cursor-pointer transition-all ${sel?'bg-neutral-900 border-neutral-900 text-white':'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                  onClick={() => fv('bedrooms_min',sel?'':n)}>{n===''?'Any':<><span className="text-[16px] font-bold">{n}</span><Bed size={14} className={sel?'text-white':'text-neutral-400'} /></>}</button>)})}
              </div>
            </div>
            {/* Bathrooms */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Bathrooms</h4>
              <div className="flex gap-2 flex-wrap">{['',1,2,3,4,5].map(n => { const sel = ff.bathrooms_min==n; return (
                <button key={n} className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border-[1.5px] text-sm font-semibold cursor-pointer transition-all ${sel?'bg-neutral-900 border-neutral-900 text-white':'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                  onClick={() => fv('bathrooms_min',sel?'':n)}>{n===''?'Any':<><span className="text-[16px] font-bold">{n}</span><Bath size={14} className={sel?'text-white':'text-neutral-400'} /></>}</button>)})}
              </div>
            </div>
            {/* Location */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Location</h4>
              <div className="flex items-center gap-3">
                <div className="flex-[2] flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12"><MapPin size={15} className="text-neutral-400" />
                  <input type="text" placeholder="City" value={ff.city} onChange={e => fv('city',e.target.value)} className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={fs} /></div>
                <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 h-12">
                  <input type="text" placeholder="State" maxLength={2} value={ff.state} onChange={e => fv('state',e.target.value.toUpperCase())} className="border-none bg-transparent text-sm font-semibold text-neutral-900 outline-none w-full text-center placeholder:text-neutral-400" style={fs} /></div>
              </div>
            </div>
            {/* Amenities */}
            <div><h4 className="text-[15px] font-bold text-neutral-900 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">{(amenitiesList.length>0?amenitiesList.map(a=>a.name||a):FALLBACK_AM).map(name => {
                const sel = selAmenities[name]; return (
                  <button key={name} className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all ${sel?'bg-neutral-900 border-neutral-900 text-white':'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                    onClick={() => setSelAmenities(prev => ({...prev,[name]:!prev[name]}))}>
                    {sel?<CheckCircle2 size={14} />:<PlusCircle size={14} className="text-neutral-400" />}{name}</button>)})}
              </div>
            </div>
            <div className="h-4" />
          </div>
          {/* Bottom */}
          <div className="flex items-center gap-3 px-5 py-4 pb-6 border-t border-neutral-100 shrink-0">
            <button className="flex items-center justify-center gap-2 px-5 h-[52px] rounded-2xl border-[1.5px] border-neutral-200 bg-white text-neutral-500 text-[13px] font-semibold cursor-pointer hover:border-neutral-400" onClick={() => { clearFf(); setShowFilters(false); }}><Trash2 size={16} /> Clear All</button>
            <button className="flex-1 flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-neutral-900 text-white text-[15px] font-bold border-none cursor-pointer hover:bg-black" onClick={applyFf}><Search size={18} /> Show Results</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
