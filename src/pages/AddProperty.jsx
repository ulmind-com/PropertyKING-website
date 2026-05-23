import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Camera, Video, Map, MapPin, Layers, Plus, X, Check, Loader2, Upload, Search, Crosshair
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyAPI, propertyTypeAPI, uploadAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ─── Map Picker Modal ─── */
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function MapPickerModal({ open, onClose, onConfirm, initialCoords }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [picked, setPicked] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [reverseResult, setReverseResult] = useState(null);

  useEffect(() => {
    if (!open || !mapRef.current) return;
    if (mapInstance.current) { mapInstance.current.invalidateSize(); return; }

    const center = initialCoords ? [initialCoords.lat, initialCoords.lng] : [39.8283, -98.5795];
    const zoom = initialCoords ? 14 : 4;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, zoom);
    L.tileLayer(DARK_TILE, { attribution: '' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstance.current = map;

    if (initialCoords) {
      const m = L.marker([initialCoords.lat, initialCoords.lng]).addTo(map);
      markerRef.current = m;
      setPicked(initialCoords);
      reverseGeocode(initialCoords.lat, initialCoords.lng);
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();
      const m = L.marker([lat, lng]).addTo(map);
      markerRef.current = m;
      setPicked({ lat, lng });
      reverseGeocode(lat, lng);
    });

    return () => { map.remove(); mapInstance.current = null; markerRef.current = null; };
  }, [open]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const d = await r.json();
      if (d?.address) setReverseResult(d.address);
    } catch (e) { /* silent */ }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1&countrycodes=us`);
      const d = await r.json();
      if (d.length > 0) {
        const { lat, lon, address } = d[0];
        const lt = parseFloat(lat), ln = parseFloat(lon);
        mapInstance.current?.setView([lt, ln], 16);
        if (markerRef.current) markerRef.current.remove();
        const m = L.marker([lt, ln]).addTo(mapInstance.current);
        markerRef.current = m;
        setPicked({ lat: lt, lng: ln });
        if (address) setReverseResult(address);
      } else { toast.error('Location not found'); }
    } catch (e) { toast.error('Search failed'); }
    setSearching(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapInstance.current?.setView([lat, lng], 16);
        if (markerRef.current) markerRef.current.remove();
        const m = L.marker([lat, lng]).addTo(mapInstance.current);
        markerRef.current = m;
        setPicked({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => toast.error('Could not get location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!picked) return toast.error('Tap on the map to select a location');
    onConfirm(picked, reverseResult);
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column' }}>
      {/* Top Bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'#111', borderBottom:'1px solid #222' }}>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'Raleway,sans-serif', fontSize:14, fontWeight:600 }}>
          <X size={20} /> Cancel
        </button>
        <span style={{ color:'#fff', fontFamily:'Raleway,sans-serif', fontSize:15, fontWeight:700 }}>📍 Pick Location</span>
        <button onClick={handleConfirm} disabled={!picked}
          style={{ background: picked ? '#16a34a' : '#333', border:'none', color:'#fff', cursor: picked ? 'pointer' : 'default', padding:'8px 20px', borderRadius:12, fontFamily:'Raleway,sans-serif', fontSize:13, fontWeight:700, opacity: picked ? 1 : 0.5 }}>
          Confirm
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display:'flex', gap:8, padding:'12px 20px', background:'#111' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#1a1a1a', border:'1px solid #333', borderRadius:12, padding:'0 14px', height:44 }}>
          <Search size={16} color="#888" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search address..."
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:13, fontFamily:'Raleway,sans-serif' }} />
        </div>
        <button onClick={handleSearch} disabled={searching}
          style={{ background:'#fff', border:'none', borderRadius:12, padding:'0 16px', height:44, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'Raleway,sans-serif', color:'#000' }}>
          {searching ? '...' : 'Search'}
        </button>
        <button onClick={handleLocateMe} title="My Location"
          style={{ background:'#222', border:'1px solid #333', borderRadius:12, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
          <Crosshair size={18} />
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex:1 }} />

      {/* Bottom Info */}
      {picked && (
        <div style={{ background:'#111', padding:'14px 20px', borderTop:'1px solid #222' }}>
          <p style={{ color:'#9ca3af', fontFamily:'Raleway,sans-serif', fontSize:12, fontWeight:600, margin:0 }}>
            📍 {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
            {reverseResult && (
              <span style={{ color:'#d1d5db', marginLeft:8 }}>
                — {reverseResult.road || ''} {reverseResult.city || reverseResult.town || reverseResult.village || ''}, {reverseResult.state || ''} {reverseResult.postcode || ''}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const STEPS = ['Basic Info', 'Location', 'Details', 'Media'];
const font = { fontFamily: 'Raleway, sans-serif' };

const Label = ({ children, required }) => (
  <label className="text-[13px] font-semibold text-neutral-500 tracking-wide" style={font}>
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = (props) => (
  <input {...props} className={`w-full h-[52px] px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 outline-none transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 placeholder:text-neutral-400 ${props.className||''}`} style={font} />
);

export default function AddProperty() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [propertyTypeName, setPropertyTypeName] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('total');
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Step 2 — Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateSel, setStateSel] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [county, setCounty] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Step 3 — Details
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sqft, setSqft] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Step 4 — Media
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [floorPlanUrls, setFloorPlanUrls] = useState([]);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadPropertyTypes();
  }, []);

  const loadPropertyTypes = async () => {
    try { const r = await propertyTypeAPI.list(); setPropertyTypes(r.data || []); } catch(e) {}
  };

  // GPS auto-detect
  const getGPS = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Location detected!');
        setGpsLoading(false);
      },
      () => { toast.error('Could not get location'); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await uploadAPI.image(file, 'propertyking');
        if (res.data?.image?.url) {
          uploaded.push({ url: res.data.image.url, caption: '', is_primary: images.length === 0 && uploaded.length === 0, order: images.length + uploaded.length });
        }
      }
      setImages(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} photo(s) uploaded`);
    } catch(e) { toast.error('Failed to upload images'); }
    setUploadingImages(false);
  };

  // Floor plan upload
  const handleFloorPlanUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFloorPlan(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await uploadAPI.image(file, 'propertyking');
        if (res.data?.image?.url) uploaded.push(res.data.image.url);
      }
      setFloorPlanUrls(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} floor plan(s) uploaded`);
    } catch(e) { toast.error('Failed to upload floor plans'); }
    setUploadingFloorPlan(false);
  };

  const removeImage = (i) => {
    const u = images.filter((_, idx) => idx !== i);
    if (u.length > 0 && !u.some(x => x.is_primary)) u[0].is_primary = true;
    setImages(u);
  };
  const setPrimary = (i) => setImages(images.map((img, idx) => ({ ...img, is_primary: idx === i })));

  const addAmenity = () => {
    const v = customAmenity.trim();
    if (v && !selectedAmenities.includes(v)) { setSelectedAmenities([...selectedAmenities, v]); setCustomAmenity(''); }
  };

  const validate = () => {
    setError('');
    if (step === 1) {
      if (!title || title.length < 5) return setError('Title must be at least 5 characters');
      if (!description || description.length < 20) return setError('Description must be at least 20 characters');
      if (!propertyTypeId) return setError('Select a property type');
      if (!price || parseFloat(price) <= 0) return setError('Enter a valid price');
    }
    if (step === 2) {
      if (!address) return setError('Enter street address');
      if (!city) return setError('Enter city');
      if (!stateSel) return setError('Select state');
      if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) return setError('Enter valid ZIP code');
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setError('');
    if (images.length === 0) return setError('Add at least one photo');
    setLoading(true);
    try {
      const locData = { address, city, state: stateSel.toUpperCase(), zip_code: zipCode };
      if (county) locData.county = county;
      if (gpsCoords) locData.coordinates = { type: 'Point', coordinates: [gpsCoords.lng, gpsCoords.lat] };
      const payload = {
        title, description, property_type_id: propertyTypeId, listing_type: listingType,
        price: parseFloat(price), price_unit: priceUnit,
        details: { bedrooms: parseInt(bedrooms)||0, bathrooms: parseFloat(bathrooms)||0, total_sqft: parseInt(sqft)||null, year_built: parseInt(yearBuilt)||null },
        location: locData, images, amenities: selectedAmenities,
        video_url: youtubeUrl || null, floor_plan_urls: floorPlanUrls,
      };
      await propertyAPI.create(payload);
      toast.success('Property submitted for review! 🎉');
      navigate('/my-listings');
    } catch(e) {
      const d = e.response?.data?.detail;
      setError(Array.isArray(d) ? d[0].msg : (d || 'Failed to submit'));
    }
    setLoading(false);
  };

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50/50">
      <div className="max-w-[680px] mx-auto px-5 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center bg-white cursor-pointer hover:bg-neutral-100 transition-all"
            onClick={() => step > 1 ? setStep(step-1) : navigate(-1)}>
            <ChevronLeft size={22} className="text-neutral-900" />
          </button>
          <h1 className="text-lg font-extrabold text-neutral-900" style={font}>Add Property</h1>
          <span className="text-[13px] font-semibold text-neutral-400" style={font}>Step {step}/4</span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
          ))}
        </div>
        <p className="text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-6" style={font}>{STEPS[step-1]}</p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-[13px] font-medium text-red-600" style={font}>
            ⚠️ {error}
          </div>
        )}

        {/* ═══ STEP 1: Basic Info ═══ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1.5"><Label required>Property Title</Label>
              <Input placeholder="e.g. Beautiful 3BR House in Brooklyn" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label required>Description</Label>
              <textarea placeholder="Describe your property in detail..." value={description} onChange={e => setDescription(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 outline-none resize-none transition-all focus:border-neutral-900 placeholder:text-neutral-400" style={font} />
            </div>
            <div className="space-y-1.5"><Label required>Property Type</Label>
              <div className="relative">
                <button className="w-full h-[52px] px-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between cursor-pointer text-left"
                  onClick={() => setShowTypePicker(!showTypePicker)}>
                  <span className={`text-sm font-medium ${propertyTypeName ? 'text-neutral-900' : 'text-neutral-400'}`} style={font}>{propertyTypeName || 'Select type'}</span>
                  <ChevronLeft size={18} className={`text-neutral-400 transition-transform ${showTypePicker ? 'rotate-90' : '-rotate-90'}`} />
                </button>
                {showTypePicker && (
                  <div className="absolute top-14 left-0 right-0 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {propertyTypes.map(t => (
                      <button key={t.id} className={`w-full flex items-center justify-between px-4 py-3.5 text-left border-b border-neutral-100 last:border-none cursor-pointer transition-all hover:bg-neutral-50 ${propertyTypeId === t.id ? 'bg-neutral-900/5' : ''}`}
                        onClick={() => { setPropertyTypeId(t.id); setPropertyTypeName(t.name); setShowTypePicker(false); }}>
                        <span className={`text-sm ${propertyTypeId === t.id ? 'font-bold text-neutral-900' : 'font-medium text-neutral-600'}`} style={font}>{t.icon || '🏠'} {t.name}</span>
                        {propertyTypeId === t.id && <Check size={18} className="text-neutral-900" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5"><Label required>Listing Type</Label>
              <div className="flex gap-3">
                {[{k:'sale',l:'For Sale'},{k:'rent',l:'For Rent'}].map(t => (
                  <button key={t.k}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-[1.5px] text-sm font-semibold cursor-pointer transition-all
                      ${listingType === t.k ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                    style={font}
                    onClick={() => { setListingType(t.k); setPriceUnit(t.k === 'rent' ? 'per_month' : 'total'); }}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><Label required>Price (USD)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-neutral-900">$</span>
                <Input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} className="flex-1" />
                {listingType === 'rent' && <span className="text-sm font-semibold text-neutral-400" style={font}>/month</span>}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Location ═══ */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-[1.5px] border-dashed border-neutral-900 bg-neutral-900/5 text-sm font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-900/10 transition-all"
                style={font} onClick={getGPS} disabled={gpsLoading}>
                {gpsLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />} Auto GPS
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-[1.5px] border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-600 cursor-pointer hover:border-neutral-400 transition-all"
                style={font} onClick={() => setShowMapPicker(true)}>
                <Map size={18} /> Pick on Map
              </button>
            </div>
            {gpsCoords && <p className="text-xs font-semibold text-green-600 text-center" style={font}>📍 {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}</p>}
            <div className="space-y-1.5"><Label required>Street Address</Label><Input placeholder="123 Main Street" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div className="space-y-1.5"><Label required>City</Label><Input placeholder="New York" value={city} onChange={e => setCity(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label required>State</Label>
                <div className="relative">
                  <button className="w-full h-[52px] px-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between cursor-pointer"
                    onClick={() => setShowStatePicker(!showStatePicker)}>
                    <span className={`text-sm font-medium ${stateSel ? 'text-neutral-900' : 'text-neutral-400'}`} style={font}>{stateSel || 'Select'}</span>
                    <ChevronLeft size={16} className="-rotate-90 text-neutral-400" />
                  </button>
                  {showStatePicker && (
                    <div className="absolute top-14 left-0 right-0 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                      {US_STATES.map(st => (
                        <button key={st} className={`w-full px-4 py-3 text-left text-sm font-medium border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${stateSel === st ? 'bg-neutral-900/5 font-bold text-neutral-900' : 'text-neutral-600'}`}
                          style={font} onClick={() => { setStateSel(st); setShowStatePicker(false); }}>{st}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5"><Label required>ZIP Code</Label><Input placeholder="10001" value={zipCode} onChange={e => setZipCode(e.target.value)} maxLength={10} /></div>
            </div>
            <div className="space-y-1.5"><Label>County</Label><Input placeholder="e.g. Kings County" value={county} onChange={e => setCounty(e.target.value)} /></div>
          </div>
        )}

        {/* ═══ STEP 3: Details ═══ */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" placeholder="3" value={bedrooms} onChange={e => setBedrooms(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" placeholder="2" value={bathrooms} onChange={e => setBathrooms(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Total Sqft</Label><Input type="number" placeholder="1500" value={sqft} onChange={e => setSqft(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Year Built</Label><Input type="number" placeholder="2020" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} maxLength={4} /></div>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <p className="text-[11px] text-neutral-400 font-medium" style={font}>Add amenities one by one (e.g. Pool, Gym)</p>
              <div className="flex gap-2">
                <input placeholder="Type an amenity..." value={customAmenity} onChange={e => setCustomAmenity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAmenity()}
                  className="flex-1 h-[48px] px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900" style={font} />
                <button className="px-5 h-[48px] bg-neutral-900 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-black transition-all" style={font}
                  onClick={addAmenity}>Add</button>
              </div>
              {selectedAmenities.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedAmenities.map((am, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-full text-[12px] font-semibold" style={font}>
                      {am}
                      <button className="bg-transparent border-none text-white cursor-pointer p-0 flex" onClick={() => setSelectedAmenities(selectedAmenities.filter(a => a !== am))}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              ) : <p className="text-xs text-neutral-400" style={font}>No amenities added yet</p>}
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Media ═══ */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            {/* Photos */}
            <div>
              <h3 className="text-[15px] font-bold text-neutral-900 mb-3" style={font}>Photos <span className="text-red-500">*</span></h3>
              <label className="flex flex-col items-center justify-center h-[120px] rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:border-neutral-900 hover:bg-neutral-100 transition-all gap-2">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
                {uploadingImages ? <><Loader2 size={28} className="text-neutral-900 animate-spin" /><span className="text-sm font-semibold text-neutral-900" style={font}>Uploading photos...</span></> :
                  <><Camera size={28} className="text-neutral-900" /><span className="text-sm font-semibold text-neutral-900" style={font}>Add Photos</span></>}
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {img.is_primary && <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold rounded-md">Cover</span>}
                      <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer text-xs" onClick={() => removeImage(i)}>✕</button>
                      {!img.is_primary && <button className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] font-semibold py-1 text-center border-none cursor-pointer" style={font} onClick={() => setPrimary(i)}>Set cover</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YouTube */}
            <div>
              <h3 className="text-[15px] font-bold text-neutral-900 mb-3" style={font}>Video Tour (Optional)</h3>
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 h-[52px]">
                <Video size={18} className="text-neutral-400" />
                <input placeholder="https://youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-neutral-900 outline-none w-full placeholder:text-neutral-400" style={font} />
              </div>
              {youtubeUrl && <p className="text-[11px] text-green-600 font-semibold mt-1" style={font}>✓ YouTube URL will be used for property video</p>}
            </div>

            {/* Floor Plans */}
            <div>
              <h3 className="text-[15px] font-bold text-neutral-900 mb-3" style={font}>Floor Plans (Optional)</h3>
              <label className="flex flex-col items-center justify-center h-[100px] rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:border-neutral-900 hover:bg-neutral-100 transition-all gap-2">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFloorPlanUpload} disabled={uploadingFloorPlan} />
                {uploadingFloorPlan ? <><Loader2 size={24} className="text-neutral-900 animate-spin" /><span className="text-sm font-semibold text-neutral-900" style={font}>Uploading...</span></> :
                  <><Layers size={24} className="text-neutral-900" /><span className="text-sm font-semibold text-neutral-900" style={font}>Add Floor Plans</span></>}
              </label>
              {floorPlanUrls.length > 0 && (
                <div className="flex gap-3 mt-3 overflow-x-auto">
                  {floorPlanUrls.map((url, i) => (
                    <div key={i} className="relative w-[120px] h-[120px] shrink-0 rounded-xl overflow-hidden border border-neutral-200">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer text-xs"
                        onClick={() => setFloorPlanUrls(floorPlanUrls.filter((_,idx) => idx !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 z-50">
        <div className="max-w-[680px] mx-auto">
          {step < 4 ? (
            <button className="w-full h-[54px] bg-neutral-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold border-none cursor-pointer transition-all hover:bg-black"
              style={font} onClick={validate}>
              Continue <ChevronLeft size={20} className="rotate-180" />
            </button>
          ) : (
            <button className={`w-full h-[54px] bg-green-600 text-white rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold border-none cursor-pointer transition-all hover:bg-green-700 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
              style={font} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : 'Submit Property'}
            </button>
          )}
        </div>
      </div>

      {/* Map Picker Modal */}
      <MapPickerModal
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialCoords={gpsCoords}
        onConfirm={(coords, addrData) => {
          setGpsCoords({ lat: coords.lat, lng: coords.lng });
          if (addrData) {
            const road = addrData.road || addrData.house_number ? `${addrData.house_number || ''} ${addrData.road || ''}`.trim() : '';
            if (road) setAddress(road);
            const c = addrData.city || addrData.town || addrData.village || addrData.hamlet || '';
            if (c) setCity(c);
            const st = addrData.state || '';
            const abbr = US_STATES.find(s => st.toUpperCase().includes(s)) || '';
            if (abbr) setStateSel(abbr);
            if (addrData.postcode) setZipCode(addrData.postcode.split('-')[0]);
            if (addrData.county) setCounty(addrData.county.replace('County', '').trim());
          }
          setShowMapPicker(false);
          toast.success('Location selected from map! 📍');
        }}
      />
    </div>
  );
}
