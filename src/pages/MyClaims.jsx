import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock, XCircle, CheckCircle2, FileEdit, Trash2,
  ArrowRight, Gavel, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { claimAPI, editRequestAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/distress';

const STATUS = {
  pending:  { label: 'Awaiting admin review', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  approved: { label: 'Approved',              cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  rejected: { label: 'Not approved',          cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${s.cls}`}>
      <s.Icon size={12} /> {s.label}
    </span>
  );
}

export default function MyClaims() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('claims');
  const [claims, setClaims] = useState([]);
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, e] = await Promise.all([claimAPI.mine({ limit: 50 }), editRequestAPI.mine({ limit: 50 })]);
      setClaims(c.data.claims || []);
      setEdits(e.data.edit_requests || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load your claims');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const withdrawClaim = async (id) => {
    try {
      await claimAPI.cancel(id);
      toast.success('Claim withdrawn');
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Could not withdraw'); }
  };

  const withdrawEdit = async (id) => {
    try {
      await editRequestAPI.cancel(id);
      toast.success('Changes withdrawn');
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Could not withdraw'); }
  };

  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const pendingEdits = edits.filter(e => e.status === 'pending').length;

  return (
    <div className="pt-[90px] pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-[900px] mx-auto px-5">
        <h1 className="text-[32px] font-black tracking-tight text-neutral-900 mb-1.5">My Claims</h1>
        <p className="text-neutral-500 text-[15px] mb-7">
          Track the properties you have claimed and any changes waiting for approval.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[['claims', 'Claims', pendingClaims], ['edits', 'Pending changes', pendingEdits]].map(([id, label, count]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border
                ${tab === id ? 'bg-neutral-900 text-white border-neutral-900'
                             : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}>
              {label}{count > 0 ? ` (${count})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-100 skeleton" />
            ))}
          </div>
        ) : tab === 'claims' ? (
          claims.length === 0 ? (
            <Empty
              icon={Gavel}
              title="You haven't claimed any property yet"
              body="Find a distressed property you own and claim it — once an admin approves, it lands in My Listings."
              action={<Link to="/distressed" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold no-underline">
                Browse distressed properties <ArrowRight size={15} />
              </Link>}
            />
          ) : (
            <div className="space-y-3">
              {claims.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex gap-4">
                  {c.property_image
                    ? <img src={c.property_image} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    : <div className="w-24 h-24 rounded-xl bg-neutral-100 shrink-0" />}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] text-neutral-900 leading-snug truncate">
                          {c.property_title || 'Property'}
                        </h3>
                        {c.property_address && (
                          <p className="text-[13px] text-neutral-400 mt-0.5 truncate">{c.property_address}</p>
                        )}
                      </div>
                      <StatusPill status={c.status} />
                    </div>

                    {c.message && (
                      <p className="text-[13px] text-neutral-500 mt-2 line-clamp-2">“{c.message}”</p>
                    )}

                    {c.status === 'rejected' && c.rejection_reason && (
                      <div className="mt-2.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-[12.5px] leading-relaxed">
                        <strong className="font-bold">Reason:</strong> {c.rejection_reason}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-[12px] text-neutral-400">Submitted {timeAgo(c.created_at)}</span>
                      {c.status === 'approved' && (
                        <Link to="/my-listings"
                          className="text-[12.5px] font-bold text-neutral-900 no-underline hover:underline">
                          Manage listing →
                        </Link>
                      )}
                      {c.status === 'pending' && (
                        <button onClick={() => withdrawClaim(c.id)}
                          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-neutral-400 hover:text-red-600">
                          <Trash2 size={13} /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          edits.length === 0 ? (
            <Empty
              icon={FileEdit}
              title="No changes waiting"
              body="When you edit a property you have claimed, the change waits here until an admin approves it."
            />
          ) : (
            <div className="space-y-3">
              {edits.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex gap-3 min-w-0">
                      {r.property_image
                        ? <img src={r.property_image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-neutral-100 shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="font-bold text-[14px] text-neutral-900 truncate">{r.property_title}</h3>
                        <p className="text-[12px] text-neutral-400 mt-0.5">
                          {r.diff?.length || 0} field(s) · {timeAgo(r.created_at)}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={r.status} />
                  </div>

                  <div className="rounded-xl border border-neutral-100 overflow-hidden">
                    {(r.diff || []).map((d, i) => (
                      <div key={i}
                        className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr_1fr] gap-2 sm:gap-3 px-3 py-2 text-[12.5px] border-b border-neutral-100 last:border-0">
                        <span className="font-bold text-neutral-500">{d.label}</span>
                        <span className="text-neutral-400 line-through truncate">{fmt(d.old)}</span>
                        <span className="text-emerald-700 font-semibold truncate">{fmt(d.new)}</span>
                      </div>
                    ))}
                  </div>

                  {r.status === 'rejected' && r.rejection_reason && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-[12.5px]">
                      <strong className="font-bold">Reason:</strong> {r.rejection_reason}
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <button onClick={() => withdrawEdit(r.id)}
                      className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-neutral-400 hover:text-red-600">
                      <Trash2 size={13} /> Withdraw changes
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        <div className="mt-8 flex gap-3 items-start bg-white rounded-2xl border border-neutral-200 p-5">
          <Info size={17} className="text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-neutral-500 leading-relaxed">
            Claims are reviewed manually to make sure the right person gets the listing.
            Have a deed, tax bill or closing document ready if the team asks for proof.
          </p>
        </div>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function Empty({ icon: Icon, title, body, action }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center px-6">
      <Icon size={32} className="mx-auto text-neutral-300 mb-4" />
      <h3 className="text-lg font-bold text-neutral-900 mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
