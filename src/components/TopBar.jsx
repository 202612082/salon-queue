import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useQueue } from '../context/QueueContext';
import {
  Scissors,
  Globe,
  RotateCcw,
  Home,
  UserPlus,
  Clock,
  LayoutDashboard,
  UserCheck,
  Tv,
  Settings,
  CheckCircle2,
} from 'lucide-react';

export const TopBar = () => {
  const { lang, toggleLanguage, t } = useLanguage();
  const { queueState, resetToDefaults } = useQueue();
  const location = useLocation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);

  const isTvDisplay = location.pathname === '/display';

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    setResetAlert(true);
    setTimeout(() => setResetAlert(false), 2500);
  };

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Home },
    { to: '/join', label: t('navJoin'), icon: UserPlus },
    { to: '/status/S-4', label: t('navStatus'), icon: Clock },
    { to: '/reception', label: t('navReception'), icon: LayoutDashboard },
    { to: '/barber/Ravi', label: t('navBarber'), icon: UserCheck },
    { to: '/display', label: t('navDisplay'), icon: Tv },
    { to: '/admin', label: t('navAdmin'), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#19212D]/95 backdrop-blur-md border-b border-gray-700/80 shadow-md">
      {/* Toast Alert for Reset */}
      {resetAlert && (
        <div className="bg-emerald-600/90 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white" />
          {t('resetSuccessMsg')}
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Queue Status */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#997300] flex items-center justify-center shadow-gold-sm group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 text-gray-950 font-bold -rotate-45" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  {t('salonName')}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]"></span>
                </span>
                <span className="hidden sm:block text-[10px] text-gray-400 font-medium">
                  {t('salonTagline')}
                </span>
              </div>
            </NavLink>

            {/* Live Queue Open/Closed Badge */}
            <div
              className={`ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                queueState.isOpen
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  queueState.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="hidden xs:inline">
                {queueState.isOpen ? t('queueOpenBadge') : t('queueClosedBadge')}
              </span>
            </div>
          </div>

          {/* Right Action Controls: Language Toggle & Reset */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4A017]" />
              <span className="font-semibold">{t('switchToLang')}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 hover:bg-rose-950/50 hover:text-rose-300 text-gray-400 border border-gray-700/60 hover:border-rose-800/50 transition"
              title={t('resetDemoData')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('resetDemoData')}</span>
            </button>
          </div>
        </div>

        {/* Role Switcher Pill Bar (All 7 Screens for seamless testing) */}
        <div className="py-2 overflow-x-auto scrollbar-none border-t border-gray-800/70 flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 shrink-0">
            {t('roleSwitcher')}:
          </span>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.to ||
              (link.to.startsWith('/status') && location.pathname.startsWith('/status')) ||
              (link.to.startsWith('/barber') && location.pathname.startsWith('/barber'));

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#D4A017] text-gray-950 shadow-gold-sm font-semibold'
                    : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gray-950' : 'text-[#D4A017]'}`} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#243042] border border-gray-700 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D4A017]" />
              {t('resetDemoData')}
            </h3>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              This will restore all queue tokens, barbers (Ravi, Amit, Imran), and 6 sample customers to their default demo state.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#D4A017] hover:bg-[#B8860B] text-gray-950 transition shadow-gold-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
