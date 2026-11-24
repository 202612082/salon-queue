import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  LayoutDashboard,
  UserPlus,
  PhoneCall,
  XCircle,
  Scissors,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const ReceptionScreen = () => {
  const { t, lang } = useLanguage();
  const {
    queueState,
    callNextCustomer,
    callSpecificCustomer,
    cancelSpot,
    joinQueue,
    calculateWaitTimeForCustomer,
  } = useQueue();

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1']);
  const [preferredBarber, setPreferredBarber] = useState('Any');
  const [walkInError, setWalkInError] = useState('');
  const [walkInMaxNotice, setWalkInMaxNotice] = useState(false);

  // Status banners / toasts
  const [notification, setNotification] = useState(null);
  const [cancelModalCustomer, setCancelModalCustomer] = useState(null);

  const waitingCustomers = (queueState.queue || []).filter((c) => c.status === 'Waiting');

  // Trigger temporary notification banner
  const notify = (msg, isError = false) => {
    setNotification({ message: msg, isError });
    setTimeout(() => setNotification(null), 3500);
  };

  // Call Next from station card
  const handleCallNext = (barberName) => {
    try {
      const called = callNextCustomer(barberName);
      if (called) {
        notify(
          t('receptionCallSuccess', {
            token: called.id,
            name: called.name,
            barber: barberName,
          })
        );
      } else {
        notify(t('receptionNoEligibleWaiting'), true);
      }
    } catch (err) {
      if (err.message === 'BARBER_ALREADY_BUSY') {
        notify(t('receptionBarberBusyReason', { token: '' }), true);
      } else if (err.message === 'BARBER_ON_BREAK') {
        notify(t('receptionBarberBreakReason'), true);
      } else {
        notify(err.message, true);
      }
    }
  };

  // Call specific waiting customer from the queue table
  const handleCallRowCustomer = (customer) => {
    try {
      const result = callSpecificCustomer(customer.id);
      if (result) {
        notify(
          t('receptionCallSuccess', {
            token: customer.id,
            name: customer.name,
            barber: result.barber.name,
          })
        );
      } else {
        notify(
          t('receptionNoAvailableBarberForCustomer', {
            token: customer.id,
            pref: customer.preferredBarber === 'Any' ? t('anyBarberShort') : customer.preferredBarber,
          }),
          true
        );
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  // Walk-in phone input formatting
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    if (walkInError) setWalkInError('');
  };

  // Walk-in service toggling (min 1, max 3)
  const toggleService = (id) => {
    setWalkInMaxNotice(false);
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((s) => s !== id));
      }
    } else {
      if (selectedServiceIds.length >= 3) {
        setWalkInMaxNotice(true);
        setTimeout(() => setWalkInMaxNotice(false), 3000);
      } else {
        setSelectedServiceIds([...selectedServiceIds, id]);
      }
    }
  };

  // Walk-in submission
  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    setWalkInError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setWalkInError(t('joinErrorName'));
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setWalkInError(t('joinErrorPhone'));
      return;
    }

    if (selectedServiceIds.length === 0 || selectedServiceIds.length > 3) {
      setWalkInError(t('joinErrorServices'));
      return;
    }

    try {
      const result = joinQueue({
        name: trimmedName,
        phone: cleanPhone,
        serviceIds: selectedServiceIds,
        preferredBarber,
      });

      if (result.isDuplicate) {
        setWalkInError(
          t('joinDuplicateRedirectNotice', {
            phone: cleanPhone,
            token: result.customer.id,
          })
        );
        return;
      }

      setShowWalkInModal(false);
      setName('');
      setPhone('');
      setSelectedServiceIds(['s1']);
      setPreferredBarber('Any');

      notify(
        t('receptionWalkInSuccess', {
          name: result.customer.name,
          token: result.customer.id,
        })
      );
    } catch (err) {
      if (err.message === 'QUEUE_CLOSED') {
        setWalkInError(t('homeQueueClosedAlert'));
      } else {
        setWalkInError(err.message);
      }
    }
  };

  // Confirmation for spot cancellation
  const handleConfirmCancel = () => {
    if (cancelModalCustomer) {
      try {
        cancelSpot(cancelModalCustomer.id);
        notify(`Spot for ${cancelModalCustomer.id} (${cancelModalCustomer.name}) was cancelled.`);
        setCancelModalCustomer(null);
      } catch (err) {
        notify(err.message, true);
      }
    }
  };

  const isWalkInPhoneValid = phone.length === 10;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-lg animate-fadeIn ${
            notification.isError
              ? 'bg-amber-950/90 border-amber-800 text-amber-200'
              : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
          }`}
        >
          {notification.isError ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

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
          onClick={() => {
            setShowWalkInModal(true);
            setWalkInError('');
          }}
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

            // Determine eligibility of Waiting customers for this barber
            const hasEligibleWaiting = waitingCustomers.some(
              (c) => c.preferredBarber === barber.name || c.preferredBarber === 'Any'
            );

            const isBusy = barber.status === 'Busy' || !!currentCustomer;
            const isOnBreak = barber.status === 'On Break';
            const isAvailable = barber.onDuty && barber.status === 'Available' && !currentCustomer;

            // Call next can only be clicked if barber is on duty, Available, not busy, and has waiting customers
            const canCallNext = isAvailable && hasEligibleWaiting;

            return (
              <Card
                key={barber.id}
                className={`relative flex flex-col justify-between ${
                  isBusy ? 'border-[#D4A017]/70' : ''
                }`}
              >
                <div>
                  {/* Station Title & Status Badge */}
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
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        barber.status === 'Available' && !currentCustomer
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : isBusy
                          ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/50'
                          : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                      }`}
                    >
                      {barber.status}
                    </span>
                  </div>

                  {/* Station Active Customer Box */}
                  <div className="min-h-[105px] flex flex-col justify-center bg-[#1F2937] p-3 rounded-xl border border-gray-700/50 mb-4">
                    {currentCustomer ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-[#D4A017]">
                            {currentCustomer.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              currentCustomer.status === 'In Chair'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40'
                            }`}
                          >
                            {currentCustomer.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {currentCustomer.name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {currentCustomer.phone}
                        </p>
                        <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-700/50 flex flex-wrap gap-1">
                          {(queueState.services || [])
                            .filter((s) => (currentCustomer.serviceIds || []).includes(s.id))
                            .map((s) => (
                              <span
                                key={s.id}
                                className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 text-[9px]"
                              >
                                {lang === 'gu' ? s.nameGu : s.nameEn}
                              </span>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-xs py-3 space-y-1">
                        <p className="font-semibold text-gray-300">
                          {isOnBreak ? t('receptionBarberBreakReason') : t('receptionIdle')}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {isOnBreak
                            ? 'Barber taking scheduled rest'
                            : hasEligibleWaiting
                            ? 'Ready for next customer'
                            : 'No matching customers in queue'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Next Button with Disabling Logic & Helper */}
                <div>
                  <button
                    onClick={() => handleCallNext(barber.name)}
                    disabled={!canCallNext}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      canCallNext
                        ? 'bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 shadow-gold-sm cursor-pointer'
                        : 'bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700/60'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>
                      {t('receptionCallNext')} ({lang === 'gu' ? barber.nameGu : barber.name})
                    </span>
                  </button>

                  {/* Small helper status notice under button when disabled */}
                  {!canCallNext && (
                    <span className="block text-[10px] text-gray-400 text-center mt-1.5">
                      {isBusy && currentCustomer
                        ? t('receptionBarberBusyReason', { token: currentCustomer.id })
                        : isOnBreak
                        ? t('receptionBarberBreakReason')
                        : !hasEligibleWaiting
                        ? t('receptionNoEligibleWaiting')
                        : ''}
                    </span>
                  )}
                </div>
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
          <span className="text-xs text-gray-400 font-medium">First-Come, First-Served</span>
        </div>

        {waitingCustomers.length === 0 ? (
          <Card className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">{t('receptionEmptyWaiting')}</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700/80 bg-[#1F2937] shadow-md">
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
                  const selectedServices = (queueState.services || []).filter((s) =>
                    customer.serviceIds.includes(s.id)
                  );
                  const isLongWait = estWait >= 20;

                  return (
                    <tr key={customer.id} className="hover:bg-gray-800/50 transition">
                      {/* Token */}
                      <td className="py-3 px-4">
                        <span className="font-black text-[#D4A017] text-sm">
                          {customer.id}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-normal">
                          #{index + 1} in line
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4 font-medium text-white">
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {customer.phone}
                        </div>
                      </td>

                      {/* Services */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {selectedServices.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] border border-gray-700/60"
                            >
                              {lang === 'gu' ? s.nameGu : s.nameEn}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Preferred Barber */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-200">
                          {customer.preferredBarber === 'Any'
                            ? t('anyBarberShort')
                            : customer.preferredBarber}
                        </span>
                      </td>

                      {/* Wait Time with Long Wait Warning */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              isLongWait ? 'text-amber-400' : 'text-[#D4A017]'
                            }`}
                          >
                            ~{estWait} {t('mins')}
                          </span>
                          {isLongWait && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[9px] font-bold">
                              {t('receptionLongWaitWarning')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons: Call & Cancel */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Call Action */}
                          <button
                            onClick={() => handleCallRowCustomer(customer)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 transition shadow-sm cursor-pointer flex items-center gap-1"
                            title="Call customer to next available eligible barber"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>{t('receptionActionCall')}</span>
                          </button>

                          {/* Cancel Action */}
                          <button
                            onClick={() => setCancelModalCustomer(customer)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition cursor-pointer flex items-center gap-1"
                            title="Cancel spot"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>{t('receptionActionCancel')}</span>
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

      {/* Walk-In Registration Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#D4A017]" />
                  {t('receptionWalkInTitle')}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t('receptionWalkInSubtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {walkInError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('joinNameLabel')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (walkInError) setWalkInError('');
                  }}
                  placeholder={t('joinNamePlaceholder')}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs placeholder-gray-500 focus:border-[#D4A017] outline-hidden transition"
                  required
                />
              </div>

              {/* 10-Digit Phone with Counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    {t('joinPhoneLabel')}
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isWalkInPhoneValid
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : phone.length > 0
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {t('joinDigitCounter', { count: phone.length })}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={t('joinPhonePlaceholder')}
                    maxLength={10}
                    className={`w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border text-white text-xs placeholder-gray-500 focus:outline-hidden transition ${
                      isWalkInPhoneValid
                        ? 'border-emerald-600'
                        : phone.length > 0
                        ? 'border-amber-600 focus:border-[#D4A017]'
                        : 'border-gray-700 focus:border-[#D4A017]'
                    }`}
                    required
                  />
                  {isWalkInPhoneValid && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>

              {/* Service Selection (Max 3) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    {t('joinSelectServices')}
                  </label>
                  <span className="text-[10px] font-semibold text-[#D4A017]">
                    {t('joinSelectedCountBadge', { count: selectedServiceIds.length })}
                  </span>
                </div>

                {walkInMaxNotice && (
                  <div className="mb-2 p-1.5 rounded bg-amber-950/80 border border-amber-800 text-amber-200 text-[10px]">
                    {t('joinMaxServicesReached')}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {(queueState.services || []).map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`p-2 rounded-lg text-left text-xs border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-semibold'
                            : 'bg-[#1F2937] border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <span className="block truncate">
                          {lang === 'gu' ? s.nameGu : s.nameEn}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {s.duration}m • ₹{s.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barber Choice */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {t('joinChooseBarber')}
                </label>
                <select
                  value={preferredBarber}
                  onChange={(e) => setPreferredBarber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden cursor-pointer"
                >
                  <option value="Any">{t('anyBarber')}</option>
                  {(queueState.barbers || []).map((b) => (
                    <option key={b.id} value={b.name}>
                      {lang === 'gu' ? b.nameGu : b.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D4A017] text-gray-950 hover:bg-[#B8860B] transition shadow-gold-sm cursor-pointer"
                >
                  Confirm & Add Walk-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                {t('statusCancelModalTitle')}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('receptionCancelConfirm', {
                token: cancelModalCustomer.id,
                name: cancelModalCustomer.name,
              })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setCancelModalCustomer(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                No, Keep Spot
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Cancel Spot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
