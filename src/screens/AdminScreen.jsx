import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  Settings,
  Users,
  Clock,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Sparkles,
  Scissors,
  CheckCircle,
} from 'lucide-react';

export const AdminScreen = () => {
  const { t, lang } = useLanguage();
  const {
    queueState,
    toggleQueueOpen,
    toggleBarberDuty,
    resetToDefaults,
  } = useQueue();

  const waitingCount = (queueState.queue || []).filter((c) => c.status === 'Waiting').length;
  const servedCount = queueState.dailyStats?.servedToday || 0;
  const noShowCount = queueState.dailyStats?.noShowCount || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Screen 7: Salon Owner Settings & Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('adminTitle')}
        </h1>
      </div>

      {/* Daily Performance Metrics */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          {t('adminDailyStats')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-1">{t('adminServedToday')}</span>
            <span className="text-3xl font-extrabold text-emerald-400">{servedCount}</span>
          </div>
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-1">{t('adminWaitingNow')}</span>
            <span className="text-3xl font-extrabold text-[#D4A017]">{waitingCount}</span>
          </div>
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-1">{t('adminAvgWait')}</span>
            <span className="text-3xl font-extrabold text-white">~18m</span>
          </div>
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-1">{t('adminNoShows')}</span>
            <span className="text-3xl font-extrabold text-rose-400">{noShowCount}</span>
          </div>
        </div>
      </div>

      {/* Online Queue Control */}
      <Card highlight className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#D4A017]" />
              {t('adminQueueStatusTitle')}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              When closed, customer screens will block new online registrations.
            </p>
          </div>

          <button
            onClick={() => toggleQueueOpen()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              queueState.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {queueState.isOpen ? (
              <>
                <ToggleRight className="w-5 h-5" />
                <span>{t('adminToggleCloseBtn')}</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                <span>{t('adminToggleOpenBtn')}</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Barber Duty Roster */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-700/60 pb-3">
          <Scissors className="w-4 h-4 text-[#D4A017]" />
          {t('adminBarberRosterTitle')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {queueState.barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#1F2937] p-4 rounded-xl border border-gray-700/50 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-white">
                  {lang === 'gu' ? barber.nameGu : barber.name}
                </p>
                <span className="text-[11px] text-gray-400">Status: {barber.status}</span>
              </div>

              <button
                onClick={() => toggleBarberDuty(barber.name)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  barber.onDuty
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                }`}
              >
                {barber.onDuty ? t('adminDutyOn') : t('adminDutyOff')}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Services & Pricing Menu */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-gray-700/60 pb-3">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4A017]" />
            {t('adminServicesPricingTitle')}
          </span>
          <GoldBadge>{queueState.services.length} Active Services</GoldBadge>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-200">
            <thead className="text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 pb-2">
              <tr>
                <th className="py-2">Service (EN)</th>
                <th className="py-2">Service (GU)</th>
                <th className="py-2">{t('adminDurationHeader')}</th>
                <th className="py-2 text-right">{t('adminPriceHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {queueState.services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/40">
                  <td className="py-2.5 font-semibold text-white">{s.nameEn}</td>
                  <td className="py-2.5 text-gray-300">{s.nameGu}</td>
                  <td className="py-2.5 text-gray-400">{s.duration} {t('mins')}</td>
                  <td className="py-2.5 font-bold text-[#D4A017] text-right">₹{s.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Danger Zone: Reset Demo Data */}
      <div className="border border-rose-900/60 bg-rose-950/20 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          {t('adminDangerZone')}
        </h3>
        <p className="text-xs text-rose-200/80 leading-relaxed">
          {t('adminResetDataDesc')}
        </p>
        <button
          onClick={() => {
            if (window.confirm('Reset all queue data to defaults (Ravi, Amit, Imran + 6 customers)?')) {
              resetToDefaults();
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('adminResetDataDesc')}</span>
        </button>
      </div>
    </div>
  );
};
