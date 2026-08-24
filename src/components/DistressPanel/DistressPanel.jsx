import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gavel, TrendingDown, Calendar, Landmark, FileText, ShieldCheck,
  Clock, CheckCircle2, X, Info, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { claimAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  distressLabel, distressClass, discountPct, formatMoney, formatDate, daysUntil,
} from '../../utils/distress';

/**
 * Foreclosure/auction facts for a distressed listing, plus the claim entry
 * point. Rendered only when `property.distress.is_distressed` is set.
 */
export default function DistressPanel({ property, onClaimed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  const d = property.distress || {};
  const claim = property.claim || {};
  const discount = discountPct(property);
  const auctionIn = daysUntil(d.auction_date);
  // Ordinary imported listings are claimable too — they just have no
  // foreclosure header or case facts to show.
  const isDistressed = !!d.is_distressed;

  const facts = [
    d.estimated_value  && { icon: TrendingDown, label: 'Est. market value', value: formatMoney(d.estimated_value) },
    d.estimated_equity && { icon: TrendingDown, label: 'Est. equity',       value: formatMoney(d.estimated_equity) },
    d.opening_bid      && { icon: Gavel,        label: 'Opening bid',       value: formatMoney(d.opening_bid) },
    d.auction_date     && { icon: Calendar,     label: 'Auction date',      value: formatDate(d.auction_date) },
    d.unpaid_balance   && { icon: Landmark,     label: 'Unpaid balance',    value: formatMoney(d.unpaid_balance) },
    d.default_amount   && { icon: Landmark,     label: 'Amount in default', value: formatMoney(d.default_amount) },
    d.lender           && { icon: Landmark,     label: 'Lender',            value: d.lender },
    d.case_number      && { icon: FileText,     label: 'Case number',       value: d.case_number },
    d.filed_date       && { icon: Calendar,     label: 'Filed',             value: formatDate(d.filed_date) },
  ].filter(Boolean);

  const submitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await claimAPI.submit(property.id, {
        message: message.trim() || null,
        contact_phone: phone.trim() || null,
      });
      toast.success(res.data.message || 'Claim submitted');
      setModalOpen(false);
      setMessage('');
      onClaimed?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not submit your claim');
    } finally { setSubmitting(false); }
  };

  const openClaim = () => {
    if (!user) {
      toast('Sign in to claim this property');
      navigate('/login', { state: { from: `/property/${property.slug}` } });
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="mb-8">
      {/* Headline strip */}
      <div className="rounded-2xl overflow-hidden border border-neutral-200">
        {isDistressed && (
        <div className={`px-5 py-4 flex items-center justify-between gap-4 flex-wrap ${distressClass(d.type)}`}>
          <div className="flex items-center gap-2.5">
            <Gavel size={18} />
            <div>
              <div className="text-[15px] font-extrabold leading-tight">{distressLabel(d.type)}</div>
              {auctionIn != null && auctionIn >= 0 && (
                <div className="text-[12px] opacity-90 mt-0.5">
                  Auction in {auctionIn} day{auctionIn === 1 ? '' : 's'}
                </div>
              )}
            </div>
          </div>
          {discount > 0 && (
            <div className="text-right">
              <div className="text-[22px] font-black leading-none">{discount}%</div>
              <div className="text-[11px] font-bold uppercase tracking-wide opacity-90">below est. value</div>
            </div>
          )}
        </div>
        )}

        {/* Facts */}
        {isDistressed && facts.length > 0 && (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-6 gap-y-0 px-5 py-2 bg-white">
            {facts.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-100 last:border-0">
                <span className="flex items-center gap-2 text-[13px] text-neutral-400 font-medium">
                  <f.icon size={14} /> {f.label}
                </span>
                <span className="text-[13.5px] font-bold text-neutral-900 text-right">{f.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Claim call-to-action */}
        <div className={`px-5 py-4 bg-neutral-50 ${isDistressed ? 'border-t border-neutral-100' : ''}`}>
          {claim.status === 'claimed' && property.is_owner ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-emerald-700">
                <CheckCircle2 size={16} /> You own this listing
              </span>
              <Link to="/my-listings"
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-[13px] font-bold no-underline">
                Manage listing
              </Link>
            </div>
          ) : claim.status === 'claimed' ? (
            <span className="flex items-center gap-2 text-[13.5px] font-semibold text-neutral-500">
              <ShieldCheck size={16} /> This property has been claimed by its owner.
            </span>
          ) : claim.status === 'pending' ? (
            <span className="flex items-center gap-2 text-[13.5px] font-semibold text-amber-700">
              <Clock size={16} /> A claim on this property is under review.
              {' '}
              <button onClick={openClaim} className="underline font-bold bg-transparent border-none cursor-pointer text-amber-700 p-0">
                Claim it too
              </button>
            </span>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[13.5px] font-bold text-neutral-900">Is this your property?</div>
                <div className="text-[12.5px] text-neutral-500 mt-0.5">
                  Claim it to manage the listing, photos and price yourself.
                </div>
              </div>
              <button onClick={openClaim}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-[13px] font-bold
                           hover:bg-neutral-800 transition-colors border-none cursor-pointer shrink-0">
                Claim this property
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Claim modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5"
             onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <form onSubmit={submitClaim}
                className="bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-[19px] font-black tracking-tight text-neutral-900">Claim this property</h3>
              <button type="button" onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center border-none cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-4">
              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <Info size={16} className="text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-neutral-500 leading-relaxed m-0">
                  An admin reviews every claim before the property moves into your account.
                  After that you can edit the listing — your changes also go through approval.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-neutral-400 mb-2">
                  Why is this yours?
                </label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)} rows={4} autoFocus
                  placeholder="e.g. I am the owner of record. I can provide the deed and the 2025 county tax bill."
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm resize-y
                             focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-neutral-400 mb-2">
                  Contact phone
                </label>
                <input
                  value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567"
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm
                             focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold border-none
                             cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit claim'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
