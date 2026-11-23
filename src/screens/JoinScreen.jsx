import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { Card, GoldBadge } from '../components/Card';
import { UserPlus, Check, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export const JoinScreen = () => {
  const { t, lang } = useLanguage();
  const { queueState, joinQueue, estimateInitialWaitTime } = useQueue();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1']);
  const [preferredBarber, setPreferredBarber] = useState('Any');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter(s => s !== id));
      }
    } else {
      if (selectedServiceIds.length < 3) {
        setSelectedServiceIds([...selectedServiceIds, id]);
      }
    }
  };

  const selectedServices = queueState.services.filter(s => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const estWait = estimateInitialWaitTime();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
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
        name,
        phone: cleanPhone,
        serviceIds: selectedServiceIds,
        preferredBarber,
      });

      if (result.isDuplicate) {
        setErrorMessage(t('joinDuplicateActivePhone'));
        setTimeout(() => {
          navigate(`/status/${result.customer.id}`);
        }, 1200);
        return;
      }

      navigate(`/status/${result.customer.id}`);
    } catch (err) {
      if (err.message === 'QUEUE_CLOSED') {
        setErrorMessage(t('homeQueueClosedAlert'));
      } else {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
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

      {errorMessage && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Details */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-gray-700/60 pb-2">
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#D4A017]" />
              1. Your Contact Info
            </span>
            <span className="text-[11px] text-gray-400">Required</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {t('joinNameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('joinNamePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F2937] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-hidden focus:border-[#D4A017] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {t('joinPhoneLabel')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('joinPhonePlaceholder')}
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F2937] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-hidden focus:border-[#D4A017] transition"
                required
              />
            </div>
          </div>
        </Card>

        {/* Step 2: Service Selection */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700/60 pb-2">
            <h2 className="text-sm font-bold text-white">
              2. {t('joinSelectServices')}
            </h2>
            <GoldBadge>{selectedServiceIds.length} / 3 Selected</GoldBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {queueState.services.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
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
              className={`p-3 rounded-xl border text-center transition ${
                preferredBarber === 'Any'
                  ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-bold'
                  : 'bg-[#1F2937] border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <p className="text-xs font-semibold">{t('anyBarberShort')}</p>
              <span className="text-[10px] text-[#D4A017] block mt-0.5">Fastest Turn</span>
            </button>

            {queueState.barbers.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => setPreferredBarber(b.name)}
                className={`p-3 rounded-xl border text-center transition ${
                  preferredBarber === b.name
                    ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-bold'
                    : 'bg-[#1F2937] border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <p className="text-xs font-semibold">{lang === 'gu' ? b.nameGu : b.name}</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">{b.status}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Live Summary Bar */}
        <div className="bg-[#19212D] border border-gray-700/80 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            {t('joinSummaryTitle')}
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#1F2937] p-2 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('joinTotalDuration')}</span>
              <span className="text-white font-bold">{totalDuration} {t('mins')}</span>
            </div>
            <div className="bg-[#1F2937] p-2 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('joinTotalPrice')}</span>
              <span className="text-[#D4A017] font-bold">₹{totalPrice}</span>
            </div>
            <div className="bg-[#1F2937] p-2 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('joinEstInitialWait')}</span>
              <span className="text-emerald-400 font-bold">~{estWait} {t('mins')}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 flex items-center justify-center gap-2 transition shadow-gold-sm cursor-pointer"
        >
          <span>{t('joinSubmitBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
