import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import {
  Scissors,
  Clock,
  Maximize,
  Minimize,
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

export const DisplayScreen = () => {
  const { t, lang } = useLanguage();
  const { queueState, calculateWaitTimeForCustomer } = useQueue();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const waitingCustomers = (queueState.queue || [])
    .filter((c) => c.status === 'Waiting')
    .slice(0, 5); // Take top 5 waiting tokens

  const activeBarbers = queueState.barbers || [];

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between selection:bg-[#D4A017] selection:text-gray-950">
      {/* Top TV Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5 mb-6">
        {/* Salon Brand & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#997300] flex items-center justify-center shadow-gold-md shrink-0">
            <Scissors className="w-7 h-7 text-gray-950 -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-wider text-white">
              {t('displayTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-[#D4A017] font-semibold tracking-wide">
              {t('salonTagline')} • {t('displaySubtitle')}
            </p>
          </div>
        </div>

        {/* Live Clock, Date & Screen Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-5">
          {/* Clock & Date */}
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest flex items-center justify-end gap-2">
              <Clock className="w-5 h-5 text-[#D4A017] animate-pulse" />
              <span>{currentTime}</span>
            </div>
            <div className="text-xs text-gray-400 font-medium flex items-center justify-end gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-[#D4A017]" />
                  <span className="hidden md:inline">{t('displayFullscreenExit')}</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 text-[#D4A017]" />
                  <span className="hidden md:inline">{t('displayFullscreenEnter')}</span>
                </>
              )}
            </button>

            <a
              href="/"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-800/90 hover:bg-[#D4A017] hover:text-gray-950 text-gray-300 border border-gray-700 text-xs font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('displayExitToApp')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main TV Layout Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* Left Column: NOW SERVING (7 Cols) */}
        <div className="lg:col-span-7 bg-[#1F2937]/95 border-2 border-gray-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#D4A017] flex items-center gap-3 uppercase tracking-wider">
              <Scissors className="w-6 h-6 text-[#D4A017]" />
              <span>{t('displayNowServing')}</span>
            </h2>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold bg-[#111827] px-3 py-1 rounded-full border border-gray-800">
              Live Chairs
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1">
            {activeBarbers.map((barber) => {
              const customer = (queueState.queue || []).find(
                (c) => c.id === barber.currentTokenId
              );
              const isCalled = customer?.status === 'Called';
              const isInChair = customer?.status === 'In Chair';
              const isAvailable = barber.onDuty && barber.status === 'Available' && !customer;
              const isOnBreak = barber.status === 'On Break';
              const isOffDuty = !barber.onDuty;

              return (
                <div
                  key={barber.id}
                  className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
                    isCalled
                      ? 'bg-gradient-to-r from-[#D4A017]/25 to-[#1F2937] border-[#D4A017] shadow-gold-md animate-pulse-gold'
                      : isInChair
                      ? 'bg-gradient-to-r from-emerald-950/40 to-[#1F2937] border-emerald-500/70 shadow-lg'
                      : isOnBreak
                      ? 'bg-[#19212D] border-indigo-900/60'
                      : isOffDuty
                      ? 'bg-[#19212D] border-gray-800 opacity-60'
                      : 'bg-[#19212D] border-gray-700/80'
                  }`}
                >
                  {/* Barber Info */}
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400 block">
                      {t('displayBarberStation')} {barber.id.toUpperCase()}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {lang === 'gu' ? barber.nameGu : barber.name}
                    </h3>
                    <div>
                      {isCalled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#D4A017] text-gray-950 shadow-sm animate-pulse">
                          <Bell className="w-3.5 h-3.5 fill-current" />
                          {t('displayStatusCalled')}
                        </span>
                      )}
                      {isInChair && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-sm">
                          <Scissors className="w-3.5 h-3.5" />
                          {t('displayStatusInChair')}
                        </span>
                      )}
                      {isAvailable && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                          {t('displayStatusAvailable')}
                        </span>
                      )}
                      {isOnBreak && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                          {t('displayStatusBreak')}
                        </span>
                      )}
                      {isOffDuty && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-gray-800 text-gray-400 border border-gray-700">
                          {t('displayStatusOffDuty')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Token & Customer Name */}
                  <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-700/50">
                    {customer ? (
                      <div>
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 block font-semibold">
                          {t('displayToken')}
                        </span>
                        <span className="text-5xl sm:text-6xl font-black text-[#D4A017] tracking-tight leading-none block my-1">
                          {customer.id}
                        </span>
                        <p className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                          {customer.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-500 py-2">
                        {isOnBreak
                          ? 'Taking break'
                          : isOffDuty
                          ? 'Not on duty today'
                          : 'Ready for customer'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: UPCOMING QUEUE (NEXT 5) (5 Cols) */}
        <div className="lg:col-span-5 bg-[#1F2937]/95 border-2 border-gray-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
              <Clock className="w-6 h-6 text-[#D4A017]" />
              <span>{t('displayUpcomingQueue')}</span>
            </h2>
            <span className="text-xs uppercase tracking-widest text-[#D4A017] font-bold bg-[#111827] px-3 py-1 rounded-full border border-gray-800">
              Next 5
            </span>
          </div>

          {waitingCustomers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 opacity-80" />
              <p className="text-lg font-bold text-white">{t('displayEmptyQueue')}</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Walk-in customers will be served immediately by available barbers.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {waitingCustomers.map((customer, index) => {
                const wait = calculateWaitTimeForCustomer(customer.id);
                const isNextUp = index === 0;

                return (
                  <div
                    key={customer.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isNextUp
                        ? 'bg-gradient-to-r from-[#D4A017]/20 to-[#19212D] border-[#D4A017] shadow-gold-sm'
                        : 'bg-[#19212D] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {/* Position & Token */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          isNextUp
                            ? 'bg-[#D4A017] text-gray-950 font-extrabold shadow-sm'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#D4A017]">
                            {customer.id}
                          </span>
                          {isNextUp && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                              {t('displayUpcomingNextUp')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[180px]">
                          {customer.name}
                        </p>
                      </div>
                    </div>

                    {/* Wait Time & Barber Pref */}
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-white block">
                        ~{wait} {t('mins')}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {customer.preferredBarber === 'Any'
                          ? t('anyBarberShort')
                          : customer.preferredBarber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Banner */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Cross-Screen Broadcast Active</span>
        </span>
        <span>Royal Salon Queue System • Automatic turn tracking across all displays</span>
      </div>
    </div>
  );
};
