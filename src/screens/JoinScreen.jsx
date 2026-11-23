import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import {
  UserPlus,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const JoinScreen = () => {
  const { t, lang } = useLanguage();
  const { queueState, joinQueue, estimateInitialWaitTime } = useQueue();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1']);
  const [preferredBarber, setPreferredBarber] = useState('Any');
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateNotice, setDuplicateNotice] = useState(null);
  const [maxNotice, setMaxNotice] = useState(false);

  // Phone input handling: only digits, max 10
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    if (errorMessage) setErrorMessage('');
  };

  // Multi-select services: min 1, max 3
  const toggleService = (id) => {
    setMaxNotice(false);
    if (errorMessage) setErrorMessage('');

    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((s) => s !== id));
      }
    } else {
      if (selectedServiceIds.length >= 3) {
        setMaxNotice(true);
        setTimeout(() => setMaxNotice(false), 3000);
      } else {
        setSelectedServiceIds([...selectedServiceIds, id]);
      }
    }
  };

  const selectedServices = (queueState.services || []).filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const estWait = estimateInitialWaitTime();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setDuplicateNotice(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage(t('joinErrorName'));
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage(t('joinErrorPhone'));
      return;
    }

    if (selectedServiceIds.length === 0 || selectedServiceIds.length > 3) {
      setErrorMessage(t('joinErrorServices'));
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
        setDuplicateNotice({
          phone: cleanPhone,
          token: result.customer.id,
        });
        setTimeout(() => {
          navigate(`/status/${result.customer.id}`);
        }, 1500);
        return;
      }

      navigate(`/status/${result.customer.id}`);
    } catch (err) {
      if (err.message === 'QUEUE_CLOSED') {
        setErrorMessage(t('homeQueueClosedAlert'));
      } else if (err.message === 'INVALID_PHONE') {
        setErrorMessage(t('joinErrorPhone'));
      } else if (err.message === 'INVALID_SERVICES') {
        setErrorMessage(t('joinErrorServices'));
      } else {
        setErrorMessage(err.message);
      }
    }
  };

  const isPhoneValid = phone.length === 10;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Screen 2: Join Queue (Mobile-First)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('joinTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          {t('joinSubtitle')}
        </p>
      </div>

      {/* Duplicate Active Phone Redirect Alert */}
      {duplicateNotice && (
        <div className="bg-[#D4A017]/20 border border-[#D4A017] text-white p-4 rounded-xl shadow-gold-md animate-pulse-gold flex items-start gap-3">
          <Info className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-[#D4A017]">
              {t('joinDuplicateActivePhone')}
            </p>
            <p className="text-gray-200 mt-1">
              {t('joinDuplicateRedirectNotice', {
                phone: duplicateNotice.phone,
                token: duplicateNotice.token,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Contact Details */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-gray-700/60 pb-2">
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#D4A017]" />
              {t('joinContactSection')}
            </span>
            <span className="text-[11px] text-[#D4A017] font-semibold">Required</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {t('joinNameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={t('joinNamePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F2937] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-hidden focus:border-[#D4A017] transition"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">
                  {t('joinPhoneLabel')}
                </label>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isPhoneValid
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
                  pattern="[0-9]*"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={t('joinPhonePlaceholder')}
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1F2937] border text-white placeholder-gray-500 text-sm focus:outline-hidden transition ${
                    isPhoneValid
                      ? 'border-emerald-600 focus:border-emerald-500'
                      : phone.length > 0
                      ? 'border-amber-600 focus:border-[#D4A017]'
                      : 'border-gray-700 focus:border-[#D4A017]'
                  }`}
                  required
                />
                {isPhoneValid && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Multi-Select Services (Max 3) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700/60 pb-2">
            <h2 className="text-sm font-bold text-white">
              2. {t('joinSelectServices')}
            </h2>
            <GoldBadge>
              {t('joinSelectedCountBadge', { count: selectedServiceIds.length })}
            </GoldBadge>
          </div>

          {maxNotice && (
            <div className="bg-amber-950/70 border border-amber-800 text-amber-200 text-xs p-2.5 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('joinMaxServicesReached')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(queueState.services || []).map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4A017]/15 border-[#D4A017] shadow-gold-sm'
                      : 'bg-[#1F2937] border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {lang === 'gu' ? service.nameGu : service.nameEn}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {service.duration} {t('mins')} • ₹{service.price}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-[#D4A017] border-[#D4A017] text-gray-950'
                        : 'border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Step 3: Barber Selection */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-gray-700/60 pb-2">
            3. {t('joinChooseBarber')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setPreferredBarber('Any')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                preferredBarber === 'Any'
                  ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-bold'
                  : 'bg-[#1F2937] border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <p className="text-xs font-semibold">{t('anyBarberShort')}</p>
              <span className="text-[10px] text-[#D4A017] block mt-0.5">
                {t('joinFastestBadge')}
              </span>
            </button>

            {(queueState.barbers || []).map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => setPreferredBarber(b.name)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  preferredBarber === b.name
                    ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-bold'
                    : 'bg-[#1F2937] border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <p className="text-xs font-semibold">
                  {lang === 'gu' ? b.nameGu : b.name}
                </p>
                <span
                  className={`text-[10px] block mt-0.5 font-medium ${
                    b.status === 'Available'
                      ? 'text-emerald-400'
                      : b.status === 'Busy'
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                  }`}
                >
                  {b.status}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Live Dynamic Summary Strip */}
        <div className="bg-[#19212D] border border-gray-700/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {t('joinSummaryTitle')}
            </h3>
            <span className="text-xs text-[#D4A017] font-semibold">
              {preferredBarber === 'Any' ? 'Fastest Turn' : preferredBarber}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#1F2937] p-2.5 rounded-lg border border-gray-700/50">
              <span className="text-gray-400 block text-[10px]">{t('joinTotalDuration')}</span>
              <span className="text-white font-bold">{totalDuration} {t('mins')}</span>
            </div>
            <div className="bg-[#1F2937] p-2.5 rounded-lg border border-gray-700/50">
              <span className="text-gray-400 block text-[10px]">{t('joinTotalPrice')}</span>
              <span className="text-[#D4A017] font-bold">₹{totalPrice}</span>
            </div>
            <div className="bg-[#1F2937] p-2.5 rounded-lg border border-gray-700/50">
              <span className="text-gray-400 block text-[10px]">{t('joinEstInitialWait')}</span>
              <span className="text-emerald-400 font-bold">~{estWait} {t('mins')}</span>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={!queueState.isOpen}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-gold-sm ${
            queueState.isOpen
              ? 'bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 active:scale-[0.99] cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }`}
        >
          <span>{t('joinSubmitBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
