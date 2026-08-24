import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, TrendingDown, Gavel, Info } from 'lucide-react';
import { propertyAPI } from '../api';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard/PropertyCard';
import { DISTRESS_TYPES, distressClass } from '../utils/distress';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

const SORTS = [
  { value: 'created_at',                label: 'Newest first' },
  { value: 'price',                     label: 'Lowest price' },
  { value: 'distress.estimated_equity', label: 'Biggest discount' },
  { value: 'distress.auction_date',     label: 'Auction soonest' },
];

const PER_PAGE = 24;

export default function DistressedProperties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const typeParam = searchParams.get('type') || '';
  const page = Number(searchParams.get('page') || 1);
  const types = useMemo(() => typeParam.split(',').filter(Boolean), [typeParam]);
  const state = searchParams.get('state') || '';
  const search = searchParams.get('q') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const claimableOnly = searchParams.get('claimable') === '1';
  const sortBy = searchParams.get('sort') || 'created_at';

  const [searchInput, setSearchInput] = useState(search);

  const patch = useCallback((changes, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v == null || v === false) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          is_distressed: true,
          page, limit: PER_PAGE,
          sort_by: sortBy,
          sort_order: sortBy === 'price' || sortBy === 'distress.auction_date' ? 'asc' : 'desc',
        };
        if (types.length) params.distress_type = types.join(',');
        if (state) params.state = state;
        if (search) params.search = search;
        if (maxPrice) params.max_price = maxPrice;
        if (claimableOnly) params.claim_status = 'unclaimed';

        const res = await propertyAPI.list(params);
        if (cancelled) return;
        setProperties(res.data.properties || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.total_pages || 0);
      } catch (err) {
        if (!cancelled) { console.error(err); setProperties([]); setTotal(0); setTotalPages(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, sortBy, state, search, maxPrice, claimableOnly, types]);

  const toggleType = (value) => {
    const next = types.includes(value) ? types.filter(t => t !== value) : [...types, value];
    patch({ type: next.join(',') });
  };

  const activeFilters = types.length + (state ? 1 : 0) + (maxPrice ? 1 : 0) + (claimableOnly ? 1 : 0);
  const clearAll = () => setSearchParams(new URLSearchParams());

  return (
    <div className="pt-[90px] pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-5">

        {/* Hero */}
        <div className="bg-neutral-900 rounded-3xl px-7 py-9 md:px-10 md:py-12 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} className="text-emerald-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-400">
              Below-market opportunities
            </span>
          </div>
          <h1 className="text-3xl md:text-[42px] font-black tracking-tight leading-[1.1] mb-3">
            Distressed Properties
          </h1>
          <p className="text-neutral-300 text-[15px] max-w-2xl leading-relaxed">
            Pre-foreclosures, foreclosures, auctions and bank-owned homes, refreshed
            automatically. Own one of these? Claim it and manage the listing yourself.
          </p>
          {total > 0 && (
            <p className="mt-5 text-sm font-semibold text-white/70">
              {total.toLocaleString()} propert{total === 1 ? 'y' : 'ies'} available
            </p>
          )}
        </div>

        {/* Type pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          <button
            onClick={() => patch({ type: '' })}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border
              ${types.length === 0
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
          >
            All types
          </button>
          {DISTRESS_TYPES.map(t => {
            const on = types.includes(t.value);
            return (
              <button key={t.value} onClick={() => toggleType(t.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border
                  ${on ? `${distressClass(t.value)} border-transparent`
                       : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); patch({ q: searchInput.trim() }); }}
            className="flex-1 min-w-[220px] relative"
          >
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by city, address or neighbourhood…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm
                         focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </form>

          <select value={sortBy} onChange={(e) => patch({ sort: e.target.value })}
            className="px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-semibold
                       focus:outline-none focus:border-neutral-900 cursor-pointer">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-colors
              ${activeFilters > 0 ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'}`}>
            <SlidersHorizontal size={16} />
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-6 grid gap-5 md:grid-cols-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-neutral-400 mb-2">
                State
              </label>
              <select value={state} onChange={(e) => patch({ state: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900">
                <option value="">Any state</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-neutral-400 mb-2">
                Max price
              </label>
              <input type="number" value={maxPrice} placeholder="No maximum"
                onChange={(e) => patch({ max_price: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900" />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={claimableOnly}
                  onChange={(e) => patch({ claimable: e.target.checked ? '1' : '' })}
                  className="w-4 h-4 accent-neutral-900 cursor-pointer" />
                <span className="text-sm font-semibold text-neutral-700">Only show claimable</span>
              </label>
            </div>

            {activeFilters > 0 && (
              <button onClick={clearAll}
                className="md:col-span-3 justify-self-start flex items-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-neutral-900">
                <X size={15} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 py-20 text-center">
            <Gavel size={34} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-1.5">No distressed properties found</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              {activeFilters > 0
                ? 'Try widening your filters — new listings are imported every few days.'
                : 'New distressed listings are imported automatically. Check back soon.'}
            </p>
            {activeFilters > 0 && (
              <button onClick={clearAll}
                className="mt-5 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button disabled={page <= 1} onClick={() => patch({ page: page - 1 }, false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-bold
                             disabled:opacity-40 disabled:cursor-not-allowed hover:border-neutral-400">
                  Previous
                </button>
                <span className="px-4 text-sm font-semibold text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => patch({ page: page + 1 }, false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-bold
                             disabled:opacity-40 disabled:cursor-not-allowed hover:border-neutral-400">
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Disclaimer — distressed data is time-sensitive and often incomplete */}
        <div className="mt-10 flex gap-3 items-start bg-white rounded-2xl border border-neutral-200 p-5">
          <Info size={17} className="text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-neutral-500 leading-relaxed">
            Distressed listings are sourced from third-party data and can change quickly.
            Auction dates, opening bids and occupancy status must be verified with the
            trustee or county before you make an offer.
          </p>
        </div>
      </div>
    </div>
  );
}
