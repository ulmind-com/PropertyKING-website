import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, X, Locate, Home as HomeIcon, Bed, Bath, Maximize, Loader2
} from 'lucide-react';
import { propertyAPI } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getCoords = (p) => {
  // Try nested location.coordinates (GeoJSON format)
  const loc = p?.location || p;
  const c = loc?.coordinates;
  if (c) {
    if (c.coordinates && Array.isArray(c.coordinates) && c.coordinates[0] !== 0) return { lat: c.coordinates[1], lng: c.coordinates[0] };
    if (Array.isArray(c) && c[0] !== 0) return { lat: c[1], lng: c[0] };
  }
  // Try flat latitude/longitude
  if (p?.latitude && p?.longitude) return { lat: p.latitude, lng: p.longitude };
  if (loc?.latitude && loc?.longitude) return { lat: loc.latitude, lng: loc.longitude };
  return null;
};

const formatPrice = (price, unit) => {
  if (!price) return '$0';
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  return unit === 'per_month' ? `${f}/mo` : f;
};

const getImg = (p) => p?.images?.find(i => i.is_primary)?.url || p?.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400';

const font = { fontFamily: 'Raleway, sans-serif' };

// Dark tile layer (free, no API key)
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function MapExplore() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      const fb = { lat: 40.7128, lng: -74.006 };
      setUserCoords(fb); loadProperties(fb);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(c); loadProperties(c);
      },
      () => { const fb = { lat: 40.7128, lng: -74.006 }; setUserCoords(fb); loadProperties(fb); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!userCoords || !mapContainerRef.current || mapObjRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 11,
      zoomControl: false,
    });

    // Dark tiles
    L.tileLayer(DARK_TILE, { attribution: DARK_ATTR, maxZoom: 19 }).addTo(map);

    // Zoom control on right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // User location marker (blue pulsing dot)
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(66,133,244,0.6);"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    // Markers layer group
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Dismiss card on map click
    map.on('click', () => { setSelectedProp(null); setCardVisible(false); });

    // Reload on significant pan
    map.on('moveend', () => {
      const center = map.getCenter();
      const dLat = Math.abs(center.lat - userCoords.lat);
      const dLng = Math.abs(center.lng - userCoords.lng);
      if (dLat > 0.05 || dLng > 0.05) loadProperties({ lat: center.lat, lng: center.lng });
    });

    mapObjRef.current = map;
    setMapReady(true);

    return () => { map.remove(); mapObjRef.current = null; };
  }, [userCoords]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapObjRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // Spread overlapping markers
    const coordMap = {};
    const items = properties.map(p => {
      const coords = getCoords(p);
      if (!coords) return null;
      const key = `${coords.lat.toFixed(5)}_${coords.lng.toFixed(5)}`;
      if (!coordMap[key]) coordMap[key] = 0;
      const idx = coordMap[key]++;
      return { prop: p, coords, idx, key };
    }).filter(Boolean);

    const countMap = {};
    items.forEach(item => { countMap[item.key] = (countMap[item.key] || 0) + 1; });

    items.forEach(item => {
      const total = countMap[item.key];
      let { coords } = item;
      if (total > 1) {
        const angle = (2 * Math.PI * item.idx) / total;
        const offset = 0.0008;
        coords = { lat: coords.lat + offset * Math.cos(angle), lng: coords.lng + offset * Math.sin(angle) };
      }

      const imgUrl = getImg(item.prop);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);background:#222;">
          <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'" />
        </div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon });
      marker.on('click', () => {
        setSelectedProp(item.prop);
        setCardVisible(true);
        mapObjRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 0.5 });
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [properties, mapReady]);

  const loadProperties = async (coords, radiusMiles = 50) => {
    setLoading(true);
    try {
      const res = await propertyAPI.nearby({ lat: coords.lat, lng: coords.lng, radius_miles: radiusMiles, limit: 10 });
      setProperties(res.data?.properties || []);
    } catch(e) {
      try { const r = await propertyAPI.list({ limit: 10 }); setProperties(r.data?.properties || []); } catch(e2) {}
    }
    setLoading(false);
  };

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const reCenter = () => {
    if (!userCoords || !mapObjRef.current) return;
    mapObjRef.current.flyTo([userCoords.lat, userCoords.lng], 11, { duration: 0.6 });
    loadProperties(userCoords);
  };

  // Fetch autocomplete suggestions (debounced)
  const fetchSuggestions = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=us`);
        const data = await resp.json();
        setSuggestions(data.map(d => ({
          display: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          type: d.type,
          short: [d.address?.city || d.address?.town || d.address?.village || d.address?.county, d.address?.state].filter(Boolean).join(', ') || d.display_name.split(',').slice(0, 2).join(','),
        })));
        setShowSuggestions(true);
      } catch(e) { setSuggestions([]); }
    }, 350);
  };

  const handleSearchInput = (val) => {
    setSearchText(val);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = async (sug) => {
    setSearchText(sug.short);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearching(true);
    const c = { lat: sug.lat, lng: sug.lng };
    mapObjRef.current.flyTo([c.lat, c.lng], 12, { duration: 0.8 });
    await loadProperties(c, 50);
    setSearching(false);
  };

  const handleSearch = async () => {
    const q = searchText.trim();
    if (!q) return;
    setShowSuggestions(false);
    setSuggestions([]);
    setSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await resp.json();
      if (data.length > 0) {
        const c = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        mapObjRef.current.flyTo([c.lat, c.lng], 12, { duration: 0.8 });
        await loadProperties(c, 50);
      }
    } catch(e) {}
    setSearching(false);
  };

  const dismissCard = () => { setCardVisible(false); setTimeout(() => setSelectedProp(null), 300); };

  return (
    <div className="fixed inset-0 bg-[#111] z-[100]" style={font}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {!userCoords && (
        <div className="absolute inset-0 bg-[#111] flex flex-col items-center justify-center gap-3 z-50">
          <Loader2 size={36} className="text-white animate-spin" />
          <p className="text-sm font-semibold text-white/50" style={font}>Finding your location...</p>
        </div>
      )}

      {/* Search Bar Overlay with Autocomplete */}
      <div className="absolute top-[90px] left-5 right-5 z-[1001]">
        <div className={`flex items-center gap-2.5 bg-white px-4 h-[52px] shadow-xl max-w-[500px] ${showSuggestions && suggestions.length > 0 ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
          {searching ? <Loader2 size={18} className="text-neutral-400 animate-spin shrink-0" /> : <Search size={18} className="text-neutral-400 shrink-0" />}
          <input
            type="text" placeholder="Search city, address, zip code..."
            value={searchText} onChange={e => handleSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="flex-1 border-none bg-transparent text-[15px] font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            style={font} disabled={searching}
          />
          {searchText && !searching && (
            <button className="bg-transparent border-none cursor-pointer p-0 text-neutral-400 hover:text-neutral-900" onClick={() => { setSearchText(''); setSuggestions([]); setShowSuggestions(false); }}><X size={18} /></button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-white rounded-b-2xl shadow-xl max-w-[500px] border-t border-neutral-100 overflow-hidden">
            {suggestions.map((sug, i) => (
              <button key={i} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors border-none bg-transparent cursor-pointer text-left"
                onClick={() => handleSelectSuggestion(sug)}
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 truncate" style={font}>{sug.short}</p>
                  <p className="text-[11px] text-neutral-400 truncate" style={font}>{sug.display}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Count Pill */}
      <div className="absolute top-[155px] left-1/2 -translate-x-1/2 z-[1001] flex items-center gap-1.5 bg-black/75 px-3.5 py-2 rounded-full backdrop-blur-sm">
        <HomeIcon size={14} className="text-white" />
        <span className="text-white text-[12px] font-semibold" style={font}>
          {loading ? '...' : `${properties.length} properties`}
        </span>
      </div>

      {/* Re-center FAB */}
      <button className="absolute bottom-[220px] right-5 w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border-none cursor-pointer shadow-lg z-[1000] hover:bg-black transition-all"
        onClick={reCenter} title="Re-center to my location">
        <Locate size={22} className="text-white" />
      </button>

      {/* Selected Property Bottom Card */}
      <div className={`absolute bottom-6 left-4 right-4 z-[1000] transition-all duration-300 ease-out ${cardVisible && selectedProp ? 'translate-y-0 opacity-100' : 'translate-y-[200px] opacity-0 pointer-events-none'}`}>
        {selectedProp && (
          <div className="bg-white rounded-[20px] shadow-2xl flex overflow-hidden cursor-pointer max-w-[500px] mx-auto"
            onClick={() => navigate(`/property/${selectedProp.slug || selectedProp.id}`)}>
            <img src={getImg(selectedProp)} alt="" className="w-[130px] h-[160px] object-cover bg-neutral-200 shrink-0" />
            <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0 relative">
              <span className={`self-start px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide text-white uppercase ${selectedProp.listing_type === 'rent' ? 'bg-violet-500' : 'bg-neutral-900'}`}>
                {selectedProp.listing_type === 'sale' ? 'SALE' : 'RENT'}
              </span>
              <h4 className="text-[14px] font-bold text-neutral-900 leading-[19px] line-clamp-2 mt-1" style={font}>{selectedProp.title}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-neutral-400 shrink-0" />
                <span className="text-[11px] text-neutral-400 font-medium truncate" style={font}>
                  {selectedProp.location?.city}{selectedProp.location?.state ? `, ${selectedProp.location.state}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                {selectedProp.details?.bedrooms > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold"><Bed size={12} className="text-neutral-400" />{selectedProp.details.bedrooms}</span>
                )}
                {selectedProp.details?.bathrooms > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold"><Bath size={12} className="text-neutral-400" />{selectedProp.details.bathrooms}</span>
                )}
                {selectedProp.details?.total_sqft > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold"><Maximize size={12} className="text-neutral-400" />{selectedProp.details.total_sqft.toLocaleString()}</span>
                )}
              </div>
              <p className="text-[18px] font-extrabold text-neutral-900 tracking-tight mt-1" style={font}>
                {formatPrice(selectedProp.price, selectedProp.price_unit)}
              </p>
              <button className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center border-none cursor-pointer text-neutral-400 hover:bg-black/10"
                onClick={(e) => { e.stopPropagation(); dismissCard(); }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
