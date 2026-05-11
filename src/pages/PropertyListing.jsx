import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Grid3X3, List, X, ChevronDown } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import { propertyAPI, propertyTypeAPI } from '../../api';
import './PropertyListing.css';

export default function PropertyListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    listing_type: searchParams.get('listing_type') || '',
    property_type_id: searchParams.get('property_type_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms_min: searchParams.get('bedrooms_min') || '',
    bathrooms_min: searchParams.get('bathrooms_min') || '',
    min_sqft: searchParams.get('min_sqft') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => { loadPropertyTypes(); }, []);
  useEffect(() => { loadProperties(); }, [filters.page, filters.sort_by, filters.sort_order]);

  const loadPropertyTypes = async () => {
    try { const res = await propertyTypeAPI.list(); setPropertyTypes(res.data); } catch(e) { console.error(e); }
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== null) params[k] = v; });
      const res = await propertyAPI.list(params);
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const applyFilters = () => {
    setFilters(prev => ({...prev, page: 1}));
    loadProperties();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', listing_type: '', property_type_id: '', min_price: '', max_price: '', bedrooms_min: '', bathrooms_min: '', min_sqft: '', city: '', state: '', sort_by: 'created_at', sort_order: 'desc', page: 1 });
    setTimeout(loadProperties, 100);
  };

  const hasActiveFilters = filters.listing_type || filters.property_type_id || filters.min_price || filters.max_price || filters.bedrooms_min || filters.city || filters.state;

  return (
    <div className="listing-page">
      <div className="listing-hero">
        <div className="container">
          <h1>Find Your Perfect Property</h1>
          <p>{total} properties available</p>
        </div>
      </div>

      <div className="container listing-content">
        {/* Top Bar */}
        <div className="listing-toolbar">
          <div className="toolbar-search">
            <Search size={18} />
            <input type="text" placeholder="Search properties..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} onKeyDown={e => e.key === 'Enter' && applyFilters()} />
          </div>
          <div className="toolbar-actions">
            <div className="listing-type-tabs">
              {['', 'sale', 'rent', 'lease'].map(t => (
                <button key={t} className={`chip ${filters.listing_type === t ? 'active' : ''}`} onClick={() => { setFilters({...filters, listing_type: t, page: 1}); setTimeout(loadProperties, 100); }}>
                  {t === '' ? 'All' : t === 'sale' ? 'Buy' : t === 'rent' ? 'Rent' : 'Lease'}
                </button>
              ))}
            </div>
            <button className={`btn btn-outline btn-sm ${hasActiveFilters ? 'has-filters' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> Filters {hasActiveFilters && <span className="filter-badge" />}
            </button>
            <div className="view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid3X3 size={18} /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={18} /></button>
            </div>
            <select className="sort-select" value={`${filters.sort_by}-${filters.sort_order}`} onChange={e => { const [sb,so] = e.target.value.split('-'); setFilters({...filters, sort_by: sb, sort_order: so}); }}>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views_count-desc">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel animate-fade-in">
            <div className="filter-panel-header"><h3>Filters</h3><button onClick={() => setShowFilters(false)}><X size={20} /></button></div>
            <div className="filter-grid">
              <div className="input-group"><label>Property Type</label>
                <select className="input" value={filters.property_type_id} onChange={e => setFilters({...filters, property_type_id: e.target.value})}>
                  <option value="">All Types</option>
                  {propertyTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select></div>
              <div className="input-group"><label>Min Price ($)</label><input type="number" className="input" placeholder="0" value={filters.min_price} onChange={e => setFilters({...filters, min_price: e.target.value})} /></div>
              <div className="input-group"><label>Max Price ($)</label><input type="number" className="input" placeholder="Any" value={filters.max_price} onChange={e => setFilters({...filters, max_price: e.target.value})} /></div>
              <div className="input-group"><label>Min Bedrooms</label>
                <div className="bed-bath-selector">{[1,2,3,4,5].map(n => <button key={n} className={`chip ${filters.bedrooms_min == n ? 'active' : ''}`} onClick={() => setFilters({...filters, bedrooms_min: filters.bedrooms_min == n ? '' : n})}>{n}+</button>)}</div></div>
              <div className="input-group"><label>Min Bathrooms</label>
                <div className="bed-bath-selector">{[1,2,3,4].map(n => <button key={n} className={`chip ${filters.bathrooms_min == n ? 'active' : ''}`} onClick={() => setFilters({...filters, bathrooms_min: filters.bathrooms_min == n ? '' : n})}>{n}+</button>)}</div></div>
              <div className="input-group"><label>City</label><input type="text" className="input" placeholder="e.g. Chicago" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} /></div>
              <div className="input-group"><label>State</label><input type="text" className="input" placeholder="e.g. IL" maxLength={2} value={filters.state} onChange={e => setFilters({...filters, state: e.target.value.toUpperCase()})} /></div>
              <div className="input-group"><label>Min Sqft</label><input type="number" className="input" placeholder="0" value={filters.min_sqft} onChange={e => setFilters({...filters, min_sqft: e.target.value})} /></div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-ghost" onClick={clearFilters}>Clear All</button>
              <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        )}

        {/* Property Grid */}
        <div className={`properties-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {loading ? Array(8).fill(null).map((_, i) => <div key={i} className="card skeleton" style={{ height: 360 }} />) :
            properties.length > 0 ? properties.map(p => <PropertyCard key={p.id} property={p} />) :
              <div className="empty-state" style={{gridColumn:'1/-1',padding:'80px 24px'}}>
                <Search size={48} /><h3>No properties found</h3><p>Try adjusting your filters</p>
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1} onClick={() => setFilters({...filters, page: filters.page - 1})}>Previous</button>
            <div className="page-numbers">
              {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                const page = filters.page <= 3 ? i + 1 : filters.page - 2 + i;
                if (page > totalPages) return null;
                return <button key={page} className={`page-btn ${filters.page === page ? 'active' : ''}`} onClick={() => setFilters({...filters, page})}>{page}</button>;
              })}
            </div>
            <button className="btn btn-ghost btn-sm" disabled={filters.page >= totalPages} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
