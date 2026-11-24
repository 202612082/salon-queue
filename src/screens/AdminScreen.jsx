import React, { useState } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  UserX,
  XCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const AdminScreen = () => {
  const { t, lang } = useLanguage();
  const {
    queueState,
    toggleQueueOpen,
    toggleBarberDuty,
    addService,
    updateService,
    deleteService,
    resetToDefaults,
    getAverageWaitTime,
  } = useQueue();

  // Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(null); // { mode: 'add' | 'edit', service?: any }
  const [deleteConfirmService, setDeleteConfirmService] = useState(null);

  // Service form state
  const [nameEn, setNameEn] = useState('');
  const [nameGu, setNameGu] = useState('');
  const [duration, setDuration] = useState('20');
  const [price, setPrice] = useState('150');
  const [serviceError, setServiceError] = useState('');

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const waitingCount = (queueState.queue || []).filter((c) => c.status === 'Waiting').length;
  const servedCount = queueState.dailyStats?.servedToday || 0;
  const noShowCount = queueState.dailyStats?.noShowCount || 0;
  const cancelledCount = queueState.dailyStats?.cancelledCount || 0;
  const avgWait = getAverageWaitTime();

  // Open Service Modal
  const openAddServiceModal = () => {
    setNameEn('');
    setNameGu('');
    setDuration('20');
    setPrice('150');
    setServiceError('');
    setServiceModal({ mode: 'add' });
  };

  const openEditServiceModal = (service) => {
    setNameEn(service.nameEn);
    setNameGu(service.nameGu);
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setServiceError('');
    setServiceModal({ mode: 'edit', service });
  };

  // Submit Add / Edit Service
  const handleServiceSubmit = (e) => {
    e.preventDefault();
    setServiceError('');

    if (!nameEn.trim()) {
      setServiceError('Please provide an English service name.');
      return;
    }

    const durNum = parseInt(duration, 10);
    const priceNum = parseInt(price, 10);

    if (isNaN(durNum) || durNum <= 0) {
      setServiceError('Duration must be a positive number of minutes.');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setServiceError('Price must be a valid positive amount in ₹.');
      return;
    }

    if (serviceModal.mode === 'add') {
      addService({
        nameEn: nameEn.trim(),
        nameGu: nameGu.trim() || nameEn.trim(),
        duration: durNum,
        price: priceNum,
      });
      showToast(`Service "${nameEn}" added to catalog.`);
    } else if (serviceModal.mode === 'edit' && serviceModal.service) {
      updateService(serviceModal.service.id, {
        nameEn: nameEn.trim(),
        nameGu: nameGu.trim() || nameEn.trim(),
        duration: durNum,
        price: priceNum,
      });
      showToast(`Service "${nameEn}" updated successfully.`);
    }

    setServiceModal(null);
  };

  // Delete Service
  const handleConfirmDelete = () => {
    if (!deleteConfirmService) return;
    try {
      deleteService(deleteConfirmService.id);
      showToast(`Service "${deleteConfirmService.nameEn}" removed from catalog.`);
      setDeleteConfirmService(null);
    } catch (err) {
      if (err.message === 'MIN_ONE_SERVICE_REQUIRED') {
        alert(t('adminServiceDeleteMinWarning'));
      } else {
        alert(err.message);
      }
      setDeleteConfirmService(null);
    }
  };

  // Confirm Reset
  const handleConfirmReset = () => {
    resetToDefaults();
    setShowResetModal(false);
    showToast(t('resetSuccessMsg'));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs sm:text-sm py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* 1. Daily Summary KPI Cards (5 Metrics) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#D4A017]" />
          <span>{t('adminDailyStats')}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Served Today */}
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center shadow-md">
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {t('adminServedToday')}
            </span>
            <span className="text-3xl font-black text-emerald-400">{servedCount}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">completed today</span>
          </div>

          {/* 2. Currently Waiting */}
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center shadow-md">
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {t('adminWaitingNow')}
            </span>
            <span className="text-3xl font-black text-[#D4A017]">{waitingCount}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">active in queue</span>
          </div>

          {/* 3. Average Wait Time */}
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center shadow-md">
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {t('adminAvgWait')}
            </span>
            <span className="text-3xl font-black text-white">~{avgWait}m</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">{t('mins')} average</span>
          </div>

          {/* 4. No-Shows Today */}
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center shadow-md">
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {t('adminNoShows')}
            </span>
            <span className="text-3xl font-black text-rose-400">{noShowCount}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">unattended</span>
          </div>

          {/* 5. Cancelled Today */}
          <div className="bg-[#243042] border border-gray-700/60 p-4 rounded-xl text-center shadow-md col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {t('adminKpiCancelled')}
            </span>
            <span className="text-3xl font-black text-amber-400">{cancelledCount}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">cancelled spots</span>
          </div>
        </div>
      </div>

      {/* 2. Master Online Queue Switch (Open / Closed) */}
      <Card highlight className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#D4A017]" />
                {t('adminQueueStatusTitle')}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase border ${
                  queueState.isOpen
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-rose-950 text-rose-400 border-rose-700'
                }`}
              >
                {queueState.isOpen ? t('adminQueueIsOpen') : t('adminQueueIsClosed')}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
              Toggling queue closed immediately prevents online customers from joining via Home (/) and Join Queue (/join). Reception walk-ins can still be registered as needed.
            </p>
          </div>

          <button
            onClick={() => toggleQueueOpen()}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              queueState.isOpen
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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

      {/* 3. Barber On-Duty Management (Ravi, Amit, Imran) */}
      <Card className="space-y-4">
        <div className="border-b border-gray-700/60 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#D4A017]" />
            <span>{t('adminBarberRosterTitle')}</span>
          </h2>
          <span className="text-xs text-gray-400">
            {t('adminOffDutyNotice')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {queueState.barbers.map((barber) => (
            <div
              key={barber.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${
                barber.onDuty
                  ? 'bg-[#1F2937] border-gray-700/60'
                  : 'bg-[#19212D] border-gray-800 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'gu' ? barber.nameGu : barber.name}
                  </h3>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Station {barber.id.toUpperCase()}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    !barber.onDuty
                      ? 'bg-gray-800 text-gray-400 border-gray-700'
                      : barber.status === 'Available'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : barber.status === 'Busy'
                      ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/50'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  }`}
                >
                  {barber.onDuty ? barber.status : 'Off Duty'}
                </span>
              </div>

              {/* On Duty / Off Duty Toggle Button */}
              <button
                onClick={() => toggleBarberDuty(barber.name)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  barber.onDuty
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <span>{barber.onDuty ? t('adminDutyOn') : t('adminDutyOff')}</span>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Editable Service Menu & Pricing */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A017]" />
              <span>{t('adminServicesPricingTitle')}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage salon services, bilingual titles, durations, and pricing in ₹.
            </p>
          </div>

          <button
            onClick={openAddServiceModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 transition shadow-gold-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('adminAddService')}</span>
          </button>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-700/70 bg-[#1F2937]">
          <table className="w-full text-left text-xs text-gray-200">
            <thead className="bg-[#19212D] text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700">
              <tr>
                <th className="py-3 px-4">Service Name (EN)</th>
                <th className="py-3 px-4">Service Name (GU)</th>
                <th className="py-3 px-4">{t('adminDurationHeader')}</th>
                <th className="py-3 px-4">{t('adminPriceHeader')}</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {(queueState.services || []).map((service) => (
                <tr key={service.id} className="hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4 font-bold text-white">
                    {service.nameEn}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {service.nameGu}
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-mono">
                    {service.duration} {t('mins')}
                  </td>
                  <td className="py-3 px-4 font-black text-[#D4A017] text-sm">
                    ₹{service.price}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditServiceModal(service)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 hover:bg-[#D4A017] hover:text-gray-950 text-gray-200 border border-gray-700 transition cursor-pointer flex items-center gap-1"
                        title="Edit service"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{t('adminEditService')}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmService(service)}
                        className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition cursor-pointer flex items-center gap-1"
                        title="Delete service"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t('adminDeleteService')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Danger Zone: Reset Demo Data */}
      <div className="border border-rose-900/60 bg-rose-950/20 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h3 className="text-base font-bold text-white">
            {t('adminDangerZone')}
          </h3>
        </div>

        <p className="text-xs text-rose-200/80 leading-relaxed max-w-2xl">
          {t('adminResetDataDesc')}
        </p>

        <button
          onClick={() => setShowResetModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white transition flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('resetDemoData')}</span>
        </button>
      </div>

      {/* Add / Edit Service Modal */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#D4A017]" />
                {serviceModal.mode === 'add'
                  ? t('adminServiceAddModalTitle')
                  : t('adminServiceEditModalTitle')}
              </h3>
              <button
                onClick={() => setServiceModal(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {serviceError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  {t('adminServiceNameEn')}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Deluxe Beard Styling"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden transition"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  {t('adminServiceNameGu')}
                </label>
                <input
                  type="text"
                  value={nameGu}
                  onChange={(e) => setNameGu(e.target.value)}
                  placeholder="દા.ત. ડીલક્સ દાઢી સ્ટાઇલિંગ"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    {t('adminServiceDurationLabel')}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden transition font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    {t('adminServicePriceLabel')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1F2937] border border-gray-700 text-white text-xs focus:border-[#D4A017] outline-hidden transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D4A017] text-gray-950 hover:bg-[#B8860B] transition shadow-gold-sm cursor-pointer"
                >
                  {t('adminServiceSaveBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Service</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('adminServiceDeleteConfirm', { name: deleteConfirmService.nameEn })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmService(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-rose-400">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                {t('adminResetModalTitle')}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('adminResetModalWarning')}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer"
              >
                {t('adminResetConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
