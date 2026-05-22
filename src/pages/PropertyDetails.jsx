import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize, Calendar, Eye, Heart, Share2,
  ChevronLeft, ChevronRight, Phone, Mail, Send, Car, Ruler,
  CheckCircle2, Layers, Video, ExternalLink, Navigation, Play,
  Image as ImageIcon, X, Clock, MessageSquare, PhoneCall, Users, VideoIcon
} from 'lucide-react';
import { propertyAPI, inquiryAPI, favoriteAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
};

export default function PropertyDetails() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const geoFetched = useRef(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [distance, setDistance] = useState(null);
  const [showDistance, setShowDistance] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [floorPlanModal, setFloorPlanModal] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [contactPref, setContactPref] = useState('call');

  useEffect(() => {
    loadProperty();
    // Reset distance animation on each new property
    setShowDistance(false);
    setDistance(null);
  }, [slug]);

  // Get user location once — persist via ref so it works across navigation
  useEffect(() => {
    if (geoFetched.current) return;
    if ('geolocation' in navigator) {
      geoFetched.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { geoFetched.current = false; },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    }
  }, []);

  // Calculate distance when property + user coords available
  useEffect(() => {
    if (!property || !userCoords) return;
    const coords = property.location?.coordinates?.coordinates;
    if (!coords || coords[0] === 0) return;
    const [lng, lat] = coords;
    const R = 6371;
    const dLat = (lat - userCoords.lat) * Math.PI / 180;
    const dLon = (lng - userCoords.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(userCoords.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    setDistance(dist);
    // Animate in after 1 second, like the app
    const timer = setTimeout(() => setShowDistance(true), 1000);
    return () => clearTimeout(timer);
  }, [property, userCoords]);

  const formatDistance = (d) => {
    if (!d) return '';
    if (d < 1) return `${Math.round(d * 1000)} m`;
    if (d < 10) return `${d.toFixed(1)} km`;
    return `${Math.round(d).toLocaleString()} km`;
  };

  const loadProperty = async () => {
    setLoading(true);
    try {
      const res = await propertyAPI.getBySlug(slug);
      setProperty(res.data);
      setIsFav(res.data.is_favorited);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return toast.error('Please login first');
    try {
      if (isFav) { await favoriteAPI.remove(property.id); }
      else { await favoriteAPI.add(property.id); }
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Saved to favorites!');
    } catch (e) { toast.error('Failed'); }
  };

  const getNext30Days = () => {
    const days = [];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      days.push({ label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()], date: d.getDate(), month: monthNames[d.getMonth()], value: d.toISOString().split('T')[0] });
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 20; i++) {
      const ampm = i >= 12 ? 'PM' : 'AM';
      const hour = i > 12 ? i - 12 : (i === 0 ? 12 : i);
      slots.push({ label: `${hour}:00 ${ampm}`, value: `${i.toString().padStart(2,'0')}:00` });
      if (i < 20) slots.push({ label: `${hour}:30 ${ampm}`, value: `${i.toString().padStart(2,'0')}:30` });
    }
    return slots;
  };

  const contactOptions = [
    { label: 'Call', value: 'call', icon: <PhoneCall size={18} /> },
    { label: 'WhatsApp', value: 'whatsapp', icon: <MessageSquare size={18} /> },
    { label: 'In Person', value: 'in_person', icon: <Users size={18} /> },
    { label: 'Video', value: 'video_call', icon: <VideoIcon size={18} /> },
  ];

  const handleInquiry = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to send inquiry');
    if (!inquiryMsg.trim() || inquiryMsg.trim().length < 10) return toast.error('Please write at least 10 characters');
    if (!selectedDate) return toast.error('Please pick a preferred date');
    if (!selectedTime) return toast.error('Please pick a preferred time');
    setInquiryLoading(true);
    try {
      await inquiryAPI.create({
        property_id: property.id,
        message: inquiryMsg,
        inquiry_type: 'viewing',
        preferred_date: selectedDate,
        preferred_time: selectedTime,
        contact_preference: contactPref,
      });
      toast.success('Meeting Requested! ✅ The owner will get back to you soon.');
      setInquiryMsg(''); setSelectedDate(null); setSelectedTime(null); setContactPref('call');
      setShowMeetingModal(false);
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to send'); }
    finally { setInquiryLoading(false); }
  };

  const formatPrice = (p, u) => {
    const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p || 0);
    return u === 'per_month' ? `${f}/mo` : u === 'per_night' ? `${f}/night` : f;
  };

  if (loading) return (
    <div className="container-custom pt-[120px]">
      <div className="skeleton rounded-none" style={{ height: 480 }} />
      <div className="pt-8 grid grid-cols-[1fr_360px] max-lg:grid-cols-1 gap-8">
        <div className="flex flex-col gap-4">
          <div className="skeleton h-7 rounded-xl w-3/5" />
          <div className="skeleton h-5 rounded-xl w-2/5" />
          <div className="skeleton h-10 rounded-xl w-[30%]" />
          <div className="flex gap-3 mt-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton flex-1 h-20 rounded-2xl" />)}
          </div>
          <div className="skeleton h-[120px] rounded-2xl mt-2" />
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );

  if (!property) return (
    <div className="container-custom pt-[120px] text-center">
      <h2 className="text-2xl font-bold">Property not found</h2>
      <Link to="/properties" className="btn btn-primary mt-5 inline-flex">Browse Properties</Link>
    </div>
  );

  const images = property.images?.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200', caption: 'Property' }];
  const d = property.details || {};

  const quickStats = [
    d.bedrooms > 0 && { icon: <Bed size={18} />, value: d.bedrooms, label: 'Beds' },
    d.bathrooms > 0 && { icon: <Bath size={18} />, value: d.bathrooms, label: 'Baths' },
    d.total_sqft > 0 && { icon: <Maximize size={18} />, value: d.total_sqft.toLocaleString(), label: 'Sqft' },
    d.year_built > 0 && { icon: <Calendar size={18} />, value: d.year_built, label: 'Built' },
    d.garage_spaces > 0 && { icon: <Car size={18} />, value: d.garage_spaces, label: 'Garage' },
    d.lot_size_acres > 0 && { icon: <Ruler size={18} />, value: d.lot_size_acres, label: 'Acres' },
  ].filter(Boolean);

  const openMaps = (navigate = false) => {
    const coords = property.location?.coordinates?.coordinates;
    if (navigate && userCoords && coords) {
      const origin = `${userCoords.lat},${userCoords.lng}`;
      const dest = `${coords[1]},${coords[0]}`;
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, '_blank');
    } else if (coords) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`, '_blank');
    } else {
      const addr = `${property.location?.address || ''} ${property.location?.city} ${property.location?.state}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
    }
  };

  const getMapEmbedUrl = () => {
    const coords = property.location?.coordinates?.coordinates;
    if (coords && coords[0] !== 0) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${coords[0]-0.015},${coords[1]-0.015},${coords[0]+0.015},${coords[1]+0.015}&layer=mapnik&marker=${coords[1]},${coords[0]}`;
    }
    return null;
  };

  // Only show route map when user is nearby (< 50km), otherwise just show property area
  const getRouteMapUrl = () => {
    if (distance && distance < 50 && userCoords) {
      const coords = property.location?.coordinates?.coordinates;
      if (coords && coords[0] !== 0) {
        const bbox = [
          Math.min(coords[0], userCoords.lng) - 0.02,
          Math.min(coords[1], userCoords.lat) - 0.02,
          Math.max(coords[0], userCoords.lng) + 0.02,
          Math.max(coords[1], userCoords.lat) + 0.02,
        ];
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join(',')}&layer=mapnik&marker=${coords[1]},${coords[0]}`;
      }
    }
    return getMapEmbedUrl();
  };

  return (
    <div className="pt-[72px]">
      {/* Gallery */}
      <div className="relative">
        <div className="relative h-[480px] max-md:h-[280px] max-sm:h-[240px] overflow-hidden bg-neutral-100">
          <img src={images[currentImg]?.url} alt={images[currentImg]?.caption || property.title} className="w-full h-full object-cover transition-transform duration-500" />
          {images.length > 1 && (<>
            <button className="absolute top-1/2 -translate-y-1/2 left-4 w-[42px] h-[42px] rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer border-none z-[2] text-neutral-900 transition-all hover:bg-white hover:scale-105" onClick={() => setCurrentImg(i => i > 0 ? i - 1 : images.length - 1)}>
              <ChevronLeft size={22} />
            </button>
            <button className="absolute top-1/2 -translate-y-1/2 right-4 w-[42px] h-[42px] rounded-full bg-white/90 shadow-md flex items-center justify-center cursor-pointer border-none z-[2] text-neutral-900 transition-all hover:bg-white hover:scale-105" onClick={() => setCurrentImg(i => i < images.length - 1 ? i + 1 : 0)}>
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[13px] font-semibold">{currentImg + 1} / {images.length}</div>
          </>)}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className={`w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer transition-all text-white hover:bg-black/50 hover:scale-[1.08] ${isFav ? '!text-red-500' : ''}`} onClick={handleFavorite}>
              <Heart size={20} fill={isFav ? '#EF4444' : 'none'} />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer transition-all text-white hover:bg-black/50 hover:scale-[1.08]" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
              <Share2 size={20} />
            </button>
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 px-6 py-3 bg-white overflow-x-auto border-b border-neutral-100 scrollbar-hide">
            {images.slice(0, 6).map((img, i) => (
              <div key={i} className={`relative w-20 h-[58px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${currentImg === i ? 'border-neutral-900' : 'border-transparent'}`} onClick={() => setCurrentImg(i)}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 5 && images.length > 6 && <div className="absolute inset-0 bg-black/55 text-white flex items-center justify-center font-extrabold text-sm">+{images.length - 6}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container-custom grid grid-cols-[1fr_360px] max-lg:grid-cols-1 gap-8 pt-8 pb-20">
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3.5 flex-wrap">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${property.listing_type === 'sale' ? 'bg-neutral-900 text-white' : property.listing_type === 'rent' ? 'bg-violet-500 text-white' : 'bg-amber-500 text-white'}`}>
                {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'For Lease'}
              </span>
              {property.property_type_name && <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-neutral-100 text-neutral-900">{property.property_type_name}</span>}
              <span className={`badge ${property.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{property.status}</span>
            </div>
            <h1 className="text-[26px] max-md:text-[22px] max-sm:text-xl font-extrabold leading-tight mb-2.5 tracking-tight text-neutral-900">{property.title}</h1>
            <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-4 font-medium">
              <MapPin size={15} />
              {[property.location?.address, property.location?.city, property.location?.state, property.location?.zip_code].filter(Boolean).join(', ')}
            </div>
            <div className="text-[32px] max-md:text-[26px] font-black text-neutral-900 tracking-tighter leading-none">{formatPrice(property.price, property.price_unit)}</div>
            {d.property_tax_annual > 0 && <div className="text-[13px] text-neutral-400 mt-1.5 font-medium">Est. ${d.property_tax_annual.toLocaleString()}/yr property tax</div>}
          </div>

          {/* Quick Stats */}
          {quickStats.length > 0 && (
            <div className="flex gap-3 max-md:gap-2 flex-wrap mb-8">
              {quickStats.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-[80px] max-md:min-w-[70px] py-4 max-md:py-3 px-3 max-md:px-2 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                  <div className="w-[38px] h-[38px] rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900">{s.icon}</div>
                  <span className="text-[17px] max-md:text-[15px] font-extrabold text-neutral-900 tracking-tight">{s.value}</span>
                  <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lister Card */}
          <div className="flex items-center gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-6">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
              {property.lister_avatar
                ? <img src={property.lister_avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-xl font-extrabold text-white">{(property.lister_name || 'U')[0].toUpperCase()}</span>
              }
            </div>
            <div>
              <div className="text-[15px] font-bold text-neutral-900">{property.lister_name || 'Anonymous Lister'}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-400 mt-0.5 capitalize">
                <CheckCircle2 size={13} className="text-emerald-500" />
                {property.lister_type ? property.lister_type.replace('_', ' ') : 'Verified Owner'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-[19px] font-extrabold mb-4 pb-3 border-b border-neutral-100 tracking-tight text-neutral-900">Description</h2>
            <p className={`text-[15px] text-neutral-500 leading-[1.8] whitespace-pre-wrap ${!descExpanded ? 'line-clamp-4' : ''}`}>
              {property.description || 'This distressed or off-market property presents a unique opportunity in one of the most sought-after locations in the United States.'}
            </p>
            <button className="mt-2 bg-transparent border-none text-neutral-900 font-bold text-sm cursor-pointer p-0" style={{ fontFamily: 'Raleway, sans-serif' }} onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <h2 className="text-[19px] font-extrabold mb-4 pb-3 border-b border-neutral-100 tracking-tight text-neutral-900">Property Details</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
              {[
                d.mls_number && { l: 'MLS #', v: d.mls_number },
                d.stories > 0 && { l: 'Stories', v: d.stories },
                d.parking_type && { l: 'Parking', v: d.parking_type.replace(/_/g, ' ') },
                d.basement && { l: 'Basement', v: d.basement },
                d.heating && { l: 'Heating', v: d.heating },
                d.cooling && { l: 'Cooling', v: d.cooling },
                d.roof_type && { l: 'Roof', v: d.roof_type },
                d.construction_material && { l: 'Construction', v: d.construction_material },
                d.zoning && { l: 'Zoning', v: d.zoning },
                d.hoa_fee > 0 && { l: 'HOA Fee', v: `$${d.hoa_fee}/${d.hoa_frequency || 'mo'}` },
                property.location?.county && { l: 'County', v: property.location.county },
                property.location?.neighborhood && { l: 'Neighborhood', v: property.location.neighborhood },
              ].filter(Boolean).map(({ l, v }, i) => (
                <div key={i} className="flex justify-between items-center p-3 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-xs text-neutral-400 font-medium">{l}</span>
                  <span className="text-[13px] font-bold capitalize text-neutral-900">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {property.amenity_names?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[19px] font-extrabold mb-4 pb-3 border-b border-neutral-100 tracking-tight text-neutral-900">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenity_names.map((a, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-50 rounded-full text-[13px] font-semibold text-neutral-500 border border-neutral-100">
                    <CheckCircle2 size={13} className="text-emerald-500" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Tour — matches app */}
          {property.video_url && (() => {
            const ytId = getYouTubeId(property.video_url);
            return (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                  <Video size={20} className="text-neutral-900" />
                  <h2 className="text-[19px] font-extrabold tracking-tight text-neutral-900 m-0">Video Tour</h2>
                </div>
                {ytId ? (
                  <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-100" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video Tour"
                    />
                  </div>
                ) : (
                  <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-100" style={{ paddingBottom: '56.25%' }}>
                    <video
                      src={property.video_url}
                      controls
                      className="absolute inset-0 w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Floor Plans — matches app */}
          {((property.floor_plan_urls?.length > 0) || property.floor_plan_url) && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <Layers size={20} className="text-neutral-900" />
                <h2 className="text-[19px] font-extrabold tracking-tight text-neutral-900 m-0">Floor Plans</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                {(property.floor_plan_urls?.length > 0 ? property.floor_plan_urls : [property.floor_plan_url]).map((url, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 rounded-2xl overflow-hidden bg-white border-2 border-neutral-200 cursor-pointer shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                    style={{ width: 'min(320px, 85vw)', height: 220 }}
                    onClick={() => setFloorPlanModal(url)}
                  >
                    <img src={url} alt={`Floor Plan ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent text-white text-[13px] font-bold">
                      <ImageIcon size={15} /> Floor Plan {i + 1} — Tap to view
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floor Plan Modal */}
          {floorPlanModal && (
            <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={() => setFloorPlanModal(null)}>
              <div className="relative max-w-[90vw] max-h-[85vh] bg-white rounded-3xl overflow-hidden p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center border-none cursor-pointer z-[1]" onClick={() => setFloorPlanModal(null)}>✕</button>
                <img src={floorPlanModal} alt="Floor Plan" className="max-w-full max-h-[75vh] object-contain" />
              </div>
            </div>
          )}

          {/* Location + Map + Distance — matches app */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-100">
              <h2 className="text-[19px] font-extrabold tracking-tight text-neutral-900 m-0">Location</h2>
              <button
                onClick={() => openMaps(!!distance)}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-full text-[13px] font-bold border-none cursor-pointer transition-all hover:bg-black hover:-translate-y-0.5"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                <Navigation size={14} /> {showDistance && distance ? `Navigate (${formatDistance(distance)})` : 'Get Directions'}
              </button>
            </div>
            <div className="flex items-start gap-3 p-3.5 px-4 bg-neutral-50 rounded-xl border border-neutral-100 mb-4">
              <MapPin size={18} className="text-neutral-900 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-sm text-neutral-900">{property.location?.address || 'Address available on request'}</div>
                <div className="text-[13px] text-neutral-400 mt-0.5">{[property.location?.city, property.location?.state, property.location?.zip_code].filter(Boolean).join(', ')}</div>
                {property.location?.county && <div className="text-xs text-neutral-400 mt-0.5">County: {property.location.county}</div>}
              </div>
            </div>
            {/* Embedded Map */}
            {getMapEmbedUrl() ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-100 group">
                <iframe
                  src={getMapEmbedUrl()}
                  className="w-full border-none"
                  style={{ height: 280 }}
                  title="Property Location"
                  loading="lazy"
                />
                {showDistance && distance && (
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-2 bg-neutral-900/85 backdrop-blur-sm text-white rounded-xl text-[13px] font-bold"
                    style={{ animation: 'fadeSlideIn 0.5s ease-out forwards' }}
                  >
                    <Navigation size={14} /> {formatDistance(distance)} away
                  </div>
                )}
                <button
                  onClick={() => openMaps(!!distance)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2.5 bg-white/95 backdrop-blur-sm text-neutral-900 rounded-xl text-[13px] font-bold border border-neutral-200 shadow-lg cursor-pointer transition-all hover:bg-white hover:shadow-xl"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  <ExternalLink size={14} /> {distance ? 'Get Directions' : 'Open in Google Maps'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] bg-neutral-50 rounded-2xl border border-neutral-100">
                <MapPin size={36} className="text-neutral-300 mb-2" />
                <span className="text-sm text-neutral-400 font-medium">Location unavailable</span>
                <button onClick={() => openMaps(false)} className="text-sm font-bold text-neutral-900 mt-2 bg-transparent border-none cursor-pointer underline" style={{ fontFamily: 'Raleway, sans-serif' }}>Search on Google Maps</button>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-[13px] text-neutral-400 pt-5 pb-24 border-t border-neutral-100 font-medium">
            <Eye size={14} /> {property.views_count || 0} views · <Heart size={14} /> {property.favorites_count || 0} saves · Listed {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Recently'}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm sticky top-[92px]">
            <div className="flex items-center gap-3.5 mb-4">
              {property.lister_avatar
                ? <img src={property.lister_avatar} alt="" className="w-[52px] h-[52px] rounded-full object-cover" />
                : <div className="w-[52px] h-[52px] rounded-full bg-neutral-900 text-white flex items-center justify-center text-[22px] font-extrabold">{(property.lister_name || 'U')[0]}</div>
              }
              <div>
                <h4 className="text-base font-bold">{property.lister_name || 'Property Lister'}</h4>
                {property.lister_type && <span className="badge badge-info mt-1">{property.lister_type}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {property.contact_phone && (
                <a href={`tel:${property.contact_phone}`} className="btn btn-outline w-full"><Phone size={16} /> {property.contact_phone}</a>
              )}
              {property.contact_email && (
                <a href={`mailto:${property.contact_email}`} className="btn btn-ghost w-full"><Mail size={16} /> Send Email</a>
              )}
            </div>
            <button
              className="w-full mt-4 py-[16px] bg-neutral-900 text-white rounded-2xl text-[15px] font-bold cursor-pointer border-none transition-all hover:bg-black hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Raleway, sans-serif' }}
              onClick={() => setShowMeetingModal(true)}
            >
              <Calendar size={18} /> Schedule a Meeting
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Bar — matches app */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-100 px-6 pt-3 pb-5 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div>
          <div className="text-[22px] font-black text-neutral-900 tracking-tight">{formatPrice(property.price, property.price_unit)}</div>
          {property.price_unit === 'per_month' && <div className="text-xs text-neutral-400 font-medium">per month</div>}
        </div>
        <div className="flex items-center gap-2.5">
          <button className={`w-11 h-11 rounded-full border-[1.5px] border-neutral-200 bg-white flex items-center justify-center cursor-pointer transition-all ${isFav ? '!border-red-500 !text-red-500' : 'text-neutral-400 hover:border-red-500 hover:text-red-500'}`} onClick={handleFavorite}>
            <Heart size={20} fill={isFav ? '#EF4444' : 'none'} />
          </button>
          <button
            className="h-11 px-7 bg-neutral-900 text-white rounded-full text-sm font-bold cursor-pointer border-none transition-all hover:bg-black flex items-center gap-2"
            style={{ fontFamily: 'Raleway, sans-serif' }}
            onClick={() => setShowMeetingModal(true)}
          >
            Inquire Now
          </button>
        </div>
      </div>

      {/* ─── Schedule Meeting Modal — matches app ─── */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-end justify-center" onClick={() => setShowMeetingModal(false)}>
          <div
            className="bg-white w-full max-w-[600px] rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto animate-slide-up"
            style={{ fontFamily: 'Raleway, sans-serif' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">Schedule a Meeting</h2>
              <button className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center border-none cursor-pointer text-neutral-500 hover:bg-neutral-200" onClick={() => setShowMeetingModal(false)}><X size={18} /></button>
            </div>
            <p className="text-[13px] text-neutral-400 mb-5">Pick a date & time to visit this property</p>

            {/* Date Picker */}
            <p className="text-sm font-bold text-neutral-900 mb-2.5">📅 Preferred Date</p>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide mb-5">
              {getNext30Days().map(day => (
                <button
                  key={day.value}
                  className={`shrink-0 w-[72px] py-3 rounded-2xl flex flex-col items-center gap-0.5 border-[1.5px] cursor-pointer transition-all
                    ${selectedDate === day.value
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'
                    }`}
                  onClick={() => setSelectedDate(day.value)}
                >
                  <span className={`text-[11px] font-semibold ${selectedDate === day.value ? 'text-white/70' : 'text-neutral-400'}`}>{day.label}</span>
                  <span className="text-[22px] font-extrabold leading-none">{day.date}</span>
                  <span className={`text-[11px] font-semibold ${selectedDate === day.value ? 'text-white/70' : 'text-neutral-400'}`}>{day.month}</span>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <p className="text-sm font-bold text-neutral-900 mb-2.5">🕐 Preferred Time</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-5">
              {getTimeSlots().map(slot => (
                <button
                  key={slot.value}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap
                    ${selectedTime === slot.value
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }`}
                  onClick={() => setSelectedTime(slot.value)}
                >
                  <Clock size={14} className={selectedTime === slot.value ? 'text-white' : 'text-neutral-400'} />
                  {slot.label}
                </button>
              ))}
            </div>

            {/* Contact Preference */}
            <p className="text-sm font-bold text-neutral-900 mb-2.5">💬 Contact Preference</p>
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {contactOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-[1.5px] cursor-pointer transition-all
                    ${contactPref === opt.value
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-400'
                    }`}
                  onClick={() => setContactPref(opt.value)}
                >
                  <span className={contactPref === opt.value ? 'text-white' : 'text-neutral-900'}>{opt.icon}</span>
                  <span className={`text-[11px] font-bold ${contactPref === opt.value ? 'text-white' : 'text-neutral-500'}`}>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <p className="text-sm font-bold text-neutral-900 mb-2.5">📝 Your Message</p>
            <textarea
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 text-sm text-neutral-900 outline-none resize-y min-h-[80px] placeholder:text-neutral-400"
              style={{ fontFamily: 'Raleway, sans-serif' }}
              placeholder="Hi, I'd love to visit this property and discuss..."
              value={inquiryMsg}
              onChange={e => setInquiryMsg(e.target.value)}
              rows={3}
            />

            {/* Submit */}
            <button
              className="w-full mt-5 py-[16px] bg-neutral-900 text-white rounded-2xl text-base font-bold cursor-pointer border-none transition-all hover:bg-black flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontFamily: 'Raleway, sans-serif' }}
              onClick={handleInquiry}
              disabled={inquiryLoading}
            >
              <Calendar size={18} />
              {inquiryLoading ? 'Submitting...' : 'Request Meeting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
