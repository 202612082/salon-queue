import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Tv, Sparkles, Scissors, Clock } from 'lucide-react';

export const DisplayScreen = () => {
  const { t, lang } = useLanguage();
  const { queueState, calculateWaitTimeForCustomer } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const waitingCustomers = (queueState.queue || [])
    .filter((c) => c.status === 'Waiting')
    .slice(0, 5); // Display top 5

  const activeBarbers = queueState.barbers;

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 sm:p-8 flex flex-col justify-between">
      {/* Top TV Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#997300] flex items-center justify-center shadow-gold-md">
            <Scissors className="w-6 h-6 text-gray-950 -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
              {t('displayTitle')}
            </h1>
            <p className="text-xs text-[#D4A017] font-semibold tracking-wide">
              {t('salonTagline')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-mono font-bold text-gray-300">
            {currentTime}
          </span>
          <span className="block text-[10px] text-gray-500 uppercase tracking-widest">
            Screen 6: Waiting Area Display (TV)
          </span>
        </div>
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Currently Served Barbers (7 Cols) */}
        <div className="lg:col-span-7 bg-[#1F2937]/90 border border-gray-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#D4A017] flex items-center gap-2 border-b border-gray-700 pb-3 uppercase tracking-wider">
            <Scissors className="w-5 h-5 text-[#D4A017]" />
            {t('displayNowServing')}
          </h2>

          <div className="grid grid-cols-1 gap-3.5">
            {activeBarbers.map((barber) => {
              const customer = (queueState.queue || []).find(
                (c) => c.id === barber.currentTokenId
              );
              const isCalled = customer?.status === 'Called';
              const isInChair = customer?.status === 'In Chair';

              return (
                <div
                  key={barber.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isCalled
                      ? 'bg-[#D4A017]/20 border-[#D4A017] animate-pulse-gold'
                      : isInChair
                      ? 'bg-[#243042] border-emerald-500/50'
                      : 'bg-[#19212D] border-gray-800'
                  }`}
                >
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block">
                      Barber Station
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {lang === 'gu' ? barber.nameGu : barber.name}
                    </h3>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 uppercase ${
                        barber.status === 'Busy'
                          ? 'bg-[#D4A017]/30 text-[#D4A017]'
                          : barber.status === 'Available'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-indigo-950 text-indigo-300'
                      }`}
                    >
                      {barber.status}
                    </span>
                  </div>

                  <div className="text-right">
                    {customer ? (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                          {customer.status === 'Called' ? '🔔 CALLED' : '💈 IN CHAIR'}
                        </span>
                        <span className="text-4xl sm:text-5xl font-black text-[#D4A017] tracking-tight">
                          {customer.id}
                        </span>
                        <p className="text-xs text-gray-200 font-semibold">{customer.name}</p>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        {barber.status === 'On Break' ? 'On Break' : 'Ready / Open'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upcoming Queue Next 5 (5 Cols) */}
        <div className="lg:col-span-5 bg-[#1F2937]/90 border border-gray-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2 border-b border-gray-700 pb-3 uppercase tracking-wider">
            <Clock className="w-5 h-5 text-[#D4A017]" />
            {t('displayUpcomingQueue')}
          </h2>

          {waitingCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {t('displayEmptyQueue')}
            </div>
          ) : (
            <div className="space-y-2.5">
              {waitingCustomers.map((customer, index) => {
                const wait = calculateWaitTimeForCustomer(customer.id);
                return (
                  <div
                    key={customer.id}
                    className="p-3.5 rounded-xl bg-[#19212D] border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-800 text-gray-300 font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="text-xl font-black text-[#D4A017]">
                          {customer.id}
                        </span>
                        <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                          {customer.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        ~{wait} {t('mins')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {customer.preferredBarber === 'Any'
                          ? 'Any Barber'
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

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-800 pt-3">
        Royal Salon Smart Queue System • Real-time cross-tab synchronization active
      </div>
    </div>
  );
};
