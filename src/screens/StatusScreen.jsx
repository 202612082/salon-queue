import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  Clock,
  User,
  Scissors,
  AlertTriangle,
  CheckCircle,
  Ban,
  Bell,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const StatusScreen = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const {
    queueState,
    calculateWaitTimeForCustomer,
    getQueuePosition,
    cancelSpot,
  } = useQueue();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const customer = (queueState.queue || []).find((c) => c.id === id);
  const positionInfo = customer ? getQueuePosition(customer.id) : null;
  const estWait = customer ? calculateWaitTimeForCustomer(customer.id) : 0;

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <div className="bg-[#243042] border border-gray-700 rounded-xl p-6 shadow-xl">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">{t('statusNotFound')}</h2>
          <p className="text-xs text-gray-400 mb-4">
            Token "{id}" was not found in the active or recent queue.
          </p>
          <div className="text-left bg-[#1F2937] p-3 rounded-lg border border-gray-700/60 mb-5">
            <span className="text-xs text-gray-300 block mb-2 font-medium">
              {t('statusTrySampleTokens')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(queueState.queue || []).map((c) => (
                <Link
                  key={c.id}
                  to={`/status/${c.id}`}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 hover:bg-[#D4A017] hover:text-gray-950 border border-gray-700 transition"
                >
                  {c.id} ({c.status})
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/join"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A017] text-gray-950 hover:bg-[#B8860B] transition"
          >
            <span>{t('statusBackToJoin')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const selectedServices = (queueState.services || []).filter((s) =>
    (customer.serviceIds || []).includes(s.id)
  );

  const handleConfirmCancel = () => {
    try {
      cancelSpot(customer.id);
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const isSecondInLine = customer.status === 'Waiting' && positionInfo?.position === 2;
  const isCalled = customer.status === 'Called';
  const isInChair = customer.status === 'In Chair';
  const isDone = customer.status === 'Done';
  const isCancelled = customer.status === 'Cancelled';
  const isNoShow = customer.status === 'No-Show';

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Screen Sub-header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Screen 3: Customer Live Status (Mobile-First)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('statusTitle')}
        </h1>
      </div>

      {/* 1. High-Visibility Gold Alert when CALLED */}
      {isCalled && (
        <div className="bg-[#D4A017] text-gray-950 p-5 rounded-xl shadow-gold-md animate-pulse-gold flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-950 text-[#D4A017] flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-900 block">
              {t('statusCalledHeading')}
            </span>
            <p className="font-extrabold text-base sm:text-lg text-gray-950 leading-snug mt-0.5">
              {t('statusAlertCalled', {
                barber: customer.assignedBarber || 'your barber',
              })}
            </p>
            <p className="text-xs font-semibold text-gray-900/90 mt-1">
              {t('statusAlertCalledDesc')}
            </p>
          </div>
        </div>
      )}

      {/* 2. Amber Alert when 2nd in Line */}
      {isSecondInLine && (
        <div className="bg-amber-500/20 border-2 border-amber-500 text-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-white">
              {t('statusAlertSecondInLine')}
            </p>
            <p className="text-xs text-amber-300/90 mt-0.5">
              {t('statusAlertSecondInLineDesc')}
            </p>
          </div>
        </div>
      )}

      {/* 3. In Chair Status */}
      {isInChair && (
        <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 p-4 rounded-xl flex items-center gap-3">
          <Scissors className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-bold text-sm">
            {t('statusAlertInChair', {
              barber: customer.assignedBarber || 'your barber',
            })}
          </p>
        </div>
      )}

      {/* 4. Service Done */}
      {isDone && (
        <div className="bg-blue-950/80 border border-blue-600 text-blue-200 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="font-bold text-sm">{t('statusAlertDone')}</p>
        </div>
      )}

      {/* 5. Cancelled */}
      {isCancelled && (
        <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-4 rounded-xl flex items-center gap-3">
          <Ban className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="font-bold text-sm">{t('statusAlertCancelled')}</p>
        </div>
      )}

      {/* 6. No-Show */}
      {isNoShow && (
        <div className="bg-gray-800 border border-gray-600 text-gray-300 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="font-bold text-sm">{t('statusAlertNoShow')}</p>
        </div>
      )}

      {/* Main Status Card */}
      <Card highlight className="space-y-6">
        {/* Token Header */}
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              {t('statusTokenLabel')}
            </span>
            <span className="text-4xl sm:text-5xl font-black text-[#D4A017] tracking-tight">
              {customer.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Status
            </span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                customer.status === 'Waiting'
                  ? 'bg-blue-950/60 text-blue-300 border-blue-700/60'
                  : customer.status === 'Called'
                  ? 'bg-[#D4A017] text-gray-950 border-[#D4A017]'
                  : customer.status === 'In Chair'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  : customer.status === 'Done'
                  ? 'bg-gray-800 text-gray-300 border-gray-700'
                  : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
              }`}
            >
              {customer.status}
            </span>
          </div>
        </div>

        {/* Live Wait Metrics (if Waiting) */}
        {customer.status === 'Waiting' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1F2937] p-3.5 rounded-xl border border-gray-700/50 text-center">
              <span className="text-xs text-gray-400 block mb-0.5">
                {t('statusPositionLabel')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {positionInfo?.positionText || '1st'}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {t('statusPositionText', { pos: positionInfo?.positionText || '1st' })}
              </span>
            </div>
            <div className="bg-[#1F2937] p-3.5 rounded-xl border border-gray-700/50 text-center">
              <span className="text-xs text-gray-400 block mb-0.5">
                {t('statusEstWaitLabel')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#D4A017]">
                ~{estWait}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">{t('mins')}</span>
            </div>
          </div>
        )}

        {/* Customer & Service Info */}
        <div className="space-y-3 bg-[#1F2937] p-4 rounded-xl border border-gray-700/50 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
            <span className="text-gray-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D4A017]" />
              {t('statusCustomerLabel')}
            </span>
            <span className="text-white font-bold">{customer.name}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
              {t('statusPhoneLabel')}
            </span>
            <span className="text-white font-mono">{customer.phone}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#D4A017]" />
              {t('statusYourBarber')}
            </span>
            <span className="text-white font-bold">
              {customer.assignedBarber
                ? `${customer.assignedBarber} (Assigned)`
                : customer.preferredBarber === 'Any'
                ? t('anyBarberShort')
                : customer.preferredBarber}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1.5">{t('statusYourServices')}:</span>
            <div className="space-y-1">
              {selectedServices.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-gray-200 bg-[#243042] px-2.5 py-1 rounded-md"
                >
                  <span>{lang === 'gu' ? s.nameGu : s.nameEn}</span>
                  <span className="text-gray-400">
                    {s.duration} {t('mins')} • ₹{s.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cancel Button (Only if still Waiting) */}
        {customer.status === 'Waiting' && (
          <div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 transition cursor-pointer"
            >
              {t('statusCancelBtn')}
            </button>
          </div>
        )}

        {/* Quick Link to Join Again if Cancelled or Done */}
        {(isDone || isCancelled || isNoShow) && (
          <Link
            to="/join"
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-center block bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 transition shadow-gold-sm"
          >
            {t('statusBackToJoin')}
          </Link>
        )}
      </Card>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                {t('statusCancelModalTitle')}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('statusCancelModalDesc', { token: customer.id })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                {t('statusKeepSpotBtn')}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
              >
                {t('statusConfirmCancelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
