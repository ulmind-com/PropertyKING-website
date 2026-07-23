import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Locate, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function LocationPickerModal({ isOpen, onClose, onConfirm, initialLat, initialLng }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('Drag the map or search...');
  const [coords, setCoords] = useState({ lat: initialLat || 22.0, lng: initialLng || 88.0 });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      const state = data.address?.state || '';
      const parts = [city, state].filter(Boolean);
      setAddress(parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || 'Unknown Location');
    } catch {
      setAddress('Unknown Location');
    }
    setLoading(false);
  }, []);

  // Init map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;
    
    // Small delay for modal animation
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer(DARK_TILE, { attribution: DARK_ATTR, maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Center marker
      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#EF4444"/><circle cx="18" cy="18" r="7" fill="white"/></svg>
        </div>`,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: pinIcon }).addTo(map);
      markerRef.current = marker;

      map.on('moveend', () => {
        const center = map.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });
        marker.setLatLng(center);
        reverseGeocode(center.lat, center.lng);
      });

      mapRef.current = map;
      reverseGeocode(coords.lat, coords.lng);
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  // Search with Nominatim
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ lat, lng });
    setSearchResults([]);
    setSearchText('');
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14);
      markerRef.current?.setLatLng([lat, lng]);
    }
    reverseGeocode(lat, lng);
  };

  // Locate me
  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 14);
        markerRef.current?.setLatLng([lat, lng]);
      }
      reverseGeocode(lat, lng);
    });
  };

  const handleConfirm = () => {
    onConfirm({ lat: coords.lat, lng: coords.lng, name: address });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      fontFamily: 'Raleway, sans-serif'
    }} onClick={onClose}>
      <div style={{
        width: '90%', maxWidth: 600, height: '80vh', maxHeight: 700,
        background: '#1a1a2e', borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="#EF4444" />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Select Location</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 8, background: 'rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '0 12px', alignItems: 'center'
          }}>
            <Search size={16} color="#999" />
            <input
              type="text"
              placeholder="Search city, state, zip..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', padding: '10px 0', fontSize: 14, fontFamily: 'inherit'
              }}
            />
            {searching && <Loader2 size={16} color="#999" className="animate-spin" />}
          </div>
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', left: 20, right: 20, top: 60, zIndex: 10,
              background: '#252545', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxHeight: 200, overflowY: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div key={i} onClick={() => selectSearchResult(r)} style={{
                  padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: '#ddd', fontSize: 13, transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  {r.display_name?.slice(0, 80)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          
          {/* Locate me button */}
          <button onClick={locateMe} style={{
            position: 'absolute', top: 12, right: 12, zIndex: 1000,
            width: 40, height: 40, borderRadius: 12, border: 'none',
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <Locate size={18} color="#4285F4" />
          </button>
        </div>

        {/* Bottom: Address + Confirm */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#1a1a2e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MapPin size={20} color="#EF4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{ color: '#999', fontSize: 13 }}>Fetching address...</div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{address.split(',')[0]}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{address}</div>
                </>
              )}
            </div>
          </div>
          <button onClick={handleConfirm} disabled={loading} style={{
            width: '100%', height: 48, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(34,197,94,0.3)', transition: 'transform 0.15s',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
