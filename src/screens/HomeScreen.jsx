import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import { Users, Clock, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const HomeScreen = () => {
  const { t, lang } = useLanguage();
  const { queueState, estimateInitialWaitTime } = useQueue();
  const navigate = useNavigate();

  const waitingCustomers = (queueState.queue || []).filter(c => c.status === 'Waiting');
  const estWait = estimateInitialWaitTime();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Screen 1: Customer Home (Mobile-First)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('homeHeroTitle')}
        </h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          {t('homeHeroSubtitle')}
        </p>
      </div>

      {/* Closed Queue Alert if closed */}
      {!queueState.isOpen && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-300">{t('queueClosedBadge')}</p>
            <p className="text-xs text-rose-300/80 mt-0.5">{t('homeQueueClosedAlert')}</p>
          </div>
        </div>
      )}

      {/* Live Queue Summary Card */}
      <Card highlight className="relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-3 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4A017]" />
            {t('homeLiveWaitCard')}
          </h2>
          <GoldBadge>Live Sync</GoldBadge>
        </div>

        {waitingCustomers.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-base font-semibold text-white">{t('homeEmptyQueue')}</p>
            <p className="text-xs text-gray-400">Chairs are ready for immediate service.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700/50 text-center">
              <span className="text-xs text-gray-400 font-medium block mb-1">
                {t('homeWaitingCount')}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {waitingCustomers.length}
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">in line right now</span>
            </div>
            <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700/50 text-center">
              <span className="text-xs text-gray-400 font-medium block mb-1">
                {t('homeEstWaitTime')}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#D4A017]">
                ~{estWait}
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">{t('mins')}</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/join')}
            disabled={!queueState.isOpen}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-gold-sm ${
              queueState.isOpen
                ? 'bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 active:scale-[0.99] cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            <span>{t('homeJoinBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Barbers Availability Roster */}
      <Card>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4A017]" />
          {t('homeBarberRosterTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {queueState.barbers.map((barber) => {
            const isAvailable = barber.onDuty && barber.status === 'Available';
            const isBusy = barber.onDuty && barber.status === 'Busy';
            const isOnBreak = barber.status === 'On Break';

            return (
              <div
                key={barber.id}
                className="bg-[#1F2937] p-3.5 rounded-xl border border-gray-700/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {lang === 'gu' ? barber.nameGu : barber.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {barber.onDuty ? 'Station ' + barber.id.toUpperCase() : 'Off Duty'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    isAvailable
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : isBusy
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : isOnBreak
                      ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {isAvailable
                    ? t('barberAvailable')
                    : isBusy
                    ? t('barberBusy')
                    : isOnBreak
                    ? t('barberOnBreak')
                    : t('barberOffDuty')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
