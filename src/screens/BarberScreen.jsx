import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  Scissors,
  Play,
  CheckCircle,
  Coffee,
  Clock,
  Sparkles,
  User,
  Phone,
  AlertTriangle,
  UserX,
  Timer,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

export const BarberScreen = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const {
    queueState,
    startService,
    completeService,
    markNoShow,
    toggleBarberBreak,
    calculateWaitTimeForCustomer,
  } = useQueue();

  const activeBarberName = name || 'Ravi';
  const barber =
    queueState.barbers.find((b) => b.name === activeBarberName) ||
    queueState.barbers[0] || { name: 'Ravi', status: 'Available', onDuty: true };

  const currentCustomer = (queueState.queue || []).find(
    (c) => c.id === barber.currentTokenId
  );

  // Live timer for elapsed stage duration
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (!currentCustomer) {
      setElapsedSeconds(0);
      return;
    }

    const startTime =
      currentCustomer.status === 'In Chair'
        ? currentCustomer.startedAt || currentCustomer.calledAt || Date.now()
        : currentCustomer.calledAt || Date.now();

    const updateTimer = () => {
      const diffSecs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentCustomer?.id, currentCustomer?.status, currentCustomer?.startedAt, currentCustomer?.calledAt]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Upcoming customers waiting for this barber or 'Any'
  const upcomingCustomers = (queueState.queue || []).filter(
    (c) =>
      c.status === 'Waiting' &&
      (c.preferredBarber === barber.name || c.preferredBarber === 'Any')
  );

  const handleStart = () => {
    if (currentCustomer && currentCustomer.status === 'Called') {
      startService(currentCustomer.id);
    }
  };

  const handleConfirmComplete = () => {
    if (currentCustomer && currentCustomer.status === 'In Chair') {
      completeService(currentCustomer.id);
      setShowCompleteModal(false);
    }
  };

  const handleConfirmNoShow = () => {
    if (currentCustomer && currentCustomer.status === 'Called') {
      markNoShow(currentCustomer.id);
      setShowNoShowModal(false);
    }
  };

  const handleToggleBreak = () => {
    toggleBarberBreak(barber.name);
  };

  const isCurrentCalled = currentCustomer?.status === 'Called';
  const isCurrentInChair = currentCustomer?.status === 'In Chair';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Screen Sub-header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Screen 5: Barber Station View (Mobile & Tablet)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('barberViewTitle')} — {lang === 'gu' ? barber.nameGu : barber.name}
        </h1>
      </div>

      {/* 1. Barber Switcher Tabs (Ravi, Amit, Imran) */}
      <div className="bg-[#19212D] p-1.5 rounded-2xl border border-gray-700/80 shadow-md">
        <div className="text-[11px] font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">
          {t('barberSelectPrompt')}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {queueState.barbers.map((b) => {
            const isActive = b.name === barber.name;
            return (
              <button
                key={b.id}
                onClick={() => navigate(`/barber/${b.name}`)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#D4A017] text-gray-950 shadow-gold-sm'
                    : 'bg-[#1F2937] text-gray-300 hover:bg-gray-800 border border-gray-700/60'
                }`}
              >
                <span>{lang === 'gu' ? b.nameGu : b.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-semibold uppercase ${
                    isActive
                      ? 'bg-gray-950/20 text-gray-950'
                      : b.status === 'Available'
                      ? 'bg-emerald-950 text-emerald-400'
                      : b.status === 'Busy'
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-indigo-950 text-indigo-300'
                  }`}
                >
                  {b.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Station Status & [ Take Break / End Break ] Toggle */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              barber.status === 'Available'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                : barber.status === 'Busy'
                ? 'bg-[#D4A017]/20 border-[#D4A017]/50 text-[#D4A017]'
                : 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
            }`}
          >
            {barber.status === 'On Break' ? (
              <Coffee className="w-5 h-5" />
            ) : (
              <Scissors className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
              Station Availability Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-sm font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  barber.status === 'Available'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                    : barber.status === 'Busy'
                    ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/50'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                }`}
              >
                {barber.status}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {barber.onDuty ? 'On Duty' : 'Off Duty'}
              </span>
            </div>
          </div>
        </div>

        {/* Break Toggle Button */}
        <button
          onClick={handleToggleBreak}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
            barber.status === 'On Break'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>
            {barber.status === 'On Break'
              ? t('barberBreakToggleResume')
              : t('barberBreakToggleBreak')}
          </span>
        </button>
      </Card>

      {/* 3. Active Customer Station Card with Control Action Flow */}
      <Card highlight className="space-y-5">
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#D4A017]" />
            {t('barberCurrentCustomer')}
          </h2>

          {currentCustomer && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#D4A017] flex items-center gap-1 bg-[#1F2937] px-2.5 py-1 rounded-lg border border-gray-700">
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </span>
              <GoldBadge>{currentCustomer.status}</GoldBadge>
            </div>
          )}
        </div>

        {currentCustomer ? (
          <div className="space-y-5">
            {/* Customer Details Box */}
            <div className="bg-[#1F2937] p-4 sm:p-5 rounded-xl border border-gray-700/50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Active Token
                  </span>
                  <span className="text-4xl font-black text-[#D4A017] tracking-tight">
                    {currentCustomer.id}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {currentCustomer.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>{currentCustomer.phone}</span>
                  </p>
                </div>

                {/* Stage Banner */}
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] px-3 py-1 rounded-full font-bold uppercase border ${
                      isCurrentInChair
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 animate-pulse'
                        : 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]'
                    }`}
                  >
                    {isCurrentInChair
                      ? t('barberStageInChair')
                      : t('barberStageCalled')}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t('barberTimerElapsed')}: <span className="text-white font-mono font-bold">{formatTimer(elapsedSeconds)}</span>
                  </p>
                </div>
              </div>

              {/* Services List */}
              <div className="pt-3 border-t border-gray-700/60">
                <span className="text-[11px] text-gray-400 block mb-1.5 font-semibold uppercase">
                  Requested Services:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(queueState.services || [])
                    .filter((s) => (currentCustomer.serviceIds || []).includes(s.id))
                    .map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#243042] text-gray-200 border border-gray-700 font-medium"
                      >
                        {lang === 'gu' ? s.nameGu : s.nameEn} ({s.duration} {t('mins')}) • ₹{s.price}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* ACTION FLOW BUTTONS */}
            {isCurrentCalled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* [ Start Service ] (Called -> In Chair) */}
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 flex items-center justify-center gap-2 shadow-gold-sm transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('barberStartService')}</span>
                </button>

                {/* [ Mark No-Show ] (Called -> No-Show, frees barber) */}
                <button
                  onClick={() => setShowNoShowModal(true)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <UserX className="w-4 h-4" />
                  <span>{t('barberMarkNoShow')}</span>
                </button>
              </div>
            )}

            {isCurrentInChair && (
              <div>
                {/* [ Complete Service ] (In Chair -> Done, frees barber to Available) */}
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full py-4 px-6 rounded-xl text-sm sm:text-base font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('barberCompleteService')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">
              {barber.status === 'On Break'
                ? t('barberOnBreakMessage')
                : t('barberIdleMessage')}
            </p>
          </div>
        )}
      </Card>

      {/* 4. Upcoming Queue Preview for this Station */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A017]" />
              {t('barberUpcomingTitle')} ({upcomingCustomers.length})
            </h3>
            <p className="text-[11px] text-gray-400">
              {t('barberUpcomingSubtitle')}
            </p>
          </div>
          <GoldBadge>{upcomingCustomers.length} in line</GoldBadge>
        </div>

        {upcomingCustomers.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-5">
            {t('barberUpcomingEmpty')}
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {upcomingCustomers.map((cust, index) => {
              const wait = calculateWaitTimeForCustomer(cust.id);
              return (
                <div
                  key={cust.id}
                  className="bg-[#1F2937] p-3 rounded-xl border border-gray-700/50 flex items-center justify-between text-xs hover:border-gray-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-gray-800 text-gray-300 font-bold text-[11px] flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="font-black text-[#D4A017] text-sm">
                        {cust.id}
                      </span>
                      <p className="font-semibold text-white truncate max-w-[130px]">
                        {cust.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block">
                      ~{wait} {t('mins')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {cust.preferredBarber === 'Any'
                        ? t('anyBarberShort')
                        : cust.preferredBarber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Complete Service Confirmation Modal */}
      {showCompleteModal && currentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Complete Service
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('barberCompleteConfirm', {
                token: currentCustomer.id,
                name: currentCustomer.name,
              })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Complete Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No-Show Confirmation Modal */}
      {showNoShowModal && currentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                {t('barberMarkNoShow')}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('barberNoShowConfirm', {
                token: currentCustomer.id,
                name: currentCustomer.name,
              })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowNoShowModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNoShow}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Mark No-Show
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
