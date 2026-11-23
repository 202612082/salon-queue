import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  LayoutDashboard,
  UserPlus,
  PhoneCall,
  UserX,
  XCircle,
  Scissors,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ReceptionScreen = () => {
  const { t, lang } = useLanguage();
  const {
    queueState,
    callNextCustomer,
    markNoShow,
    cancelSpot,
    joinQueue,
    calculateWaitTimeForCustomer,
  } = useQueue();

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1']);
  const [preferredBarber, setPreferredBarber] = useState('Any');
  const [walkInError, setWalkInError] = useState('');

  const waitingCustomers = (queueState.queue || []).filter((c) => c.status === 'Waiting');

  const handleCallNext = (barberName) => {
    try {
      const called = callNextCustomer(barberName);
      if (!called) {
        alert('No eligible waiting customer found for ' + barberName);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    setWalkInError('');

    try {
      joinQueue({
        name,
        phone,
        serviceIds: selectedServiceIds,
        preferredBarber,
      });
      setShowWalkInModal(false);
      setName('');
      setPhone('');
      setSelectedServiceIds(['s1']);
      setPreferredBarber('Any');
    } catch (err) {
      setWalkInError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Screen 4: Receptionist Dashboard (Tablet / Desktop)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('receptionTitle')}
          </h1>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 transition shadow-gold-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('receptionAddWalkIn')}</span>
        </button>
      </div>

      {/* Barber Stations Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#D4A017]" />
          {t('receptionBarbersTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {queueState.barbers.map((barber) => {
            const currentCustomer = (queueState.queue || []).find(
              (c) => c.id === barber.currentTokenId
            );
            const isIdle = barber.onDuty && barber.status === 'Available';
            const isOnBreak = barber.status === 'On Break';

            return (
              <Card
                key={barber.id}
                className={`relative ${
                  barber.status === 'Busy' ? 'border-[#D4A017]/70' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-gray-700/60 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'gu' ? barber.nameGu : barber.name}
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {barber.onDuty ? 'Station ' + barber.id.toUpperCase() : 'Off Duty'}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase border ${
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

                {/* Current Customer Card / Idle state */}
                <div className="min-h-[90px] flex flex-col justify-center bg-[#1F2937] p-3 rounded-xl border border-gray-700/50 mb-4">
                  {currentCustomer ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-extrabold text-[#D4A017]">
                          {currentCustomer.id}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-300 uppercase">
                          {currentCustomer.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {currentCustomer.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {currentCustomer.phone}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs">
                      {isOnBreak ? 'Barber is taking a break' : 'Station is currently idle'}
                    </div>
                  )}
                </div>

                {/* Action: Call Next */}
                <button
                  onClick={() => handleCallNext(barber.name)}
                  disabled={isOnBreak || !!currentCustomer}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isOnBreak || !!currentCustomer
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                      : 'bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 shadow-gold-sm cursor-pointer'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    {t('receptionCallNext')} ({lang === 'gu' ? barber.nameGu : barber.name})
                  </span>
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Waiting Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4A017]" />
            {t('receptionWaitingQueueTitle')} ({waitingCustomers.length})
          </h2>
          <span className="text-xs text-gray-400">First-Come, First-Served</span>
        </div>

        {waitingCustomers.length === 0 ? (
          <Card className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">{t('receptionEmptyWaiting')}</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700/80 bg-[#1F2937]">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-[#19212D] text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4">{t('receptionColToken')}</th>
                  <th className="py-3 px-4">{t('receptionColCustomer')}</th>
                  <th className="py-3 px-4">{t('receptionColServices')}</th>
                  <th className="py-3 px-4">{t('receptionColBarber')}</th>
                  <th className="py-3 px-4">{t('receptionColWait')}</th>
                  <th className="py-3 px-4 text-right">{t('receptionColActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/60">
                {waitingCustomers.map((customer, index) => {
                  const estWait = calculateWaitTimeForCustomer(customer.id);
                  const selectedServices = queueState.services.filter((s) =>
                    customer.serviceIds.includes(s.id)
                  );

                  return (
                    <tr key={customer.id} className="hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4 font-bold text-[#D4A017] text-sm">
                        {customer.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        <div>{customer.name}</div>
                        <div className="text-[10px] text-gray-400">{customer.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {selectedServices.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px]"
                            >
                              {lang === 'gu' ? s.nameGu : s.nameEn}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-300">
                          {customer.preferredBarber === 'Any'
                            ? t('anyBarberShort')
                            : customer.preferredBarber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#D4A017]">~{estWait} mins</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => cancelSpot(customer.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/60 transition"
                            title="Cancel spot"
                          >
                            <XCircle className="w-3.5 h-3.5 inline mr-1" />
                            {t('receptionActionCancel')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-In Customer Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#D4A017]" />
                {t('receptionAddWalkIn')}
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {walkInError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                {walkInError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Verma"
                  className="w-full px-3 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9898012345"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Services (Max 3)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {queueState.services.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedServiceIds.length > 1) {
                              setSelectedServiceIds(selectedServiceIds.filter((x) => x !== s.id));
                            }
                          } else if (selectedServiceIds.length < 3) {
                            setSelectedServiceIds([...selectedServiceIds, s.id]);
                          }
                        }}
                        className={`p-2 rounded-lg text-left text-xs border transition ${
                          isSelected
                            ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-semibold'
                            : 'bg-[#1F2937] border-gray-700 text-gray-300'
                        }`}
                      >
                        <span className="block truncate">{lang === 'gu' ? s.nameGu : s.nameEn}</span>
                        <span className="text-[10px] text-gray-400">₹{s.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Barber Preference
                </label>
                <select
                  value={preferredBarber}
                  onChange={(e) => setPreferredBarber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden"
                >
                  <option value="Any">{t('anyBarber')}</option>
                  {queueState.barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {lang === 'gu' ? b.nameGu : b.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D4A017] text-gray-950 hover:bg-[#B8860B] transition"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
