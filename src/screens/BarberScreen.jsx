import React, { useState } from 'react';
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
  AlertCircle,
} from 'lucide-react';

export const BarberScreen = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const {
    queueState,
    startService,
    completeService,
    toggleBarberBreak,
  } = useQueue();

  const activeBarberName = name || 'Ravi';
  const barber = queueState.barbers.find((b) => b.name === activeBarberName) || queueState.barbers[0];

  const currentCustomer = (queueState.queue || []).find((c) => c.id === barber.currentTokenId);

  // Next eligible customer waiting for this barber or 'Any'
  const nextCustomer = (queueState.queue || []).find(
    (c) =>
      c.status === 'Waiting' &&
      (c.preferredBarber === barber.name || c.preferredBarber === 'Any')
  );

  const handleStart = () => {
    if (currentCustomer && currentCustomer.status === 'Called') {
      startService(currentCustomer.id);
    }
  };

  const handleComplete = () => {
    if (currentCustomer && currentCustomer.status === 'In Chair') {
      completeService(currentCustomer.id);
    }
  };

  const handleToggleBreak = () => {
    toggleBarberBreak(barber.name);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Screen 5: Barber View (Mobile & Tablet)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('barberViewTitle')} — {lang === 'gu' ? barber.nameGu : barber.name}
          </h1>
        </div>

        {/* Barber Station Switcher */}
        <div className="flex items-center gap-1.5">
          {queueState.barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/barber/${b.name}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                b.name === barber.name
                  ? 'bg-[#D4A017] text-gray-950 shadow-gold-sm'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {lang === 'gu' ? b.nameGu : b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Barber Availability & Break Control */}
      <Card className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 block mb-0.5">Station Availability</span>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              barber.status === 'Available'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : barber.status === 'Busy'
                ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/50'
                : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
            }`}
          >
            {barber.status}
          </span>
        </div>

        <button
          onClick={handleToggleBreak}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            barber.status === 'On Break'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>
            {barber.status === 'On Break'
              ? t('barberBreakToggleResume')
              : t('barberBreakToggleBreak')}
          </span>
        </button>
      </Card>

      {/* Active Customer Station Card */}
      <Card highlight className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#D4A017]" />
            {t('barberCurrentCustomer')}
          </h2>
          {currentCustomer && (
            <GoldBadge>{currentCustomer.status}</GoldBadge>
          )}
        </div>

        {currentCustomer ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#1F2937] p-4 rounded-xl border border-gray-700/50">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Token</span>
                <span className="text-3xl font-black text-[#D4A017]">
                  {currentCustomer.id}
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  {currentCustomer.name}
                </p>
                <p className="text-xs text-gray-400">{currentCustomer.phone}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block mb-1">Services:</span>
                <div className="space-y-1">
                  {queueState.services
                    .filter((s) => currentCustomer.serviceIds.includes(s.id))
                    .map((s) => (
                      <span
                        key={s.id}
                        className="inline-block px-2 py-0.5 rounded text-[11px] bg-gray-800 text-gray-200 font-medium block"
                      >
                        {lang === 'gu' ? s.nameGu : s.nameEn} ({s.duration}m)
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Service Step Controls */}
            {currentCustomer.status === 'Called' && (
              <button
                onClick={handleStart}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 flex items-center justify-center gap-2 shadow-gold-sm transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('barberStartService')}</span>
              </button>
            )}

            {currentCustomer.status === 'In Chair' && (
              <button
                onClick={handleComplete}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('barberCompleteService')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-xs">
            No customer currently assigned. Reception can call next customer to this station.
          </div>
        )}
      </Card>

      {/* Next In Line Preview */}
      <Card>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
          {t('barberNextInLine')}
        </h3>

        {nextCustomer ? (
          <div className="bg-[#1F2937] p-3.5 rounded-xl border border-gray-700/50 flex items-center justify-between">
            <div>
              <span className="text-base font-extrabold text-[#D4A017]">
                {nextCustomer.id}
              </span>
              <p className="text-xs font-bold text-white">{nextCustomer.name}</p>
              <p className="text-[10px] text-gray-400">
                Pref: {nextCustomer.preferredBarber === 'Any' ? 'Any Barber' : nextCustomer.preferredBarber}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-300 font-semibold block">
                {nextCustomer.serviceIds.length} Service(s)
              </span>
              <span className="text-[10px] text-emerald-400">Waiting in line</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-3">
            {t('barberNoNextCustomer')}
          </p>
        )}
      </Card>
    </div>
  );
};
