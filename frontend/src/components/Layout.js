import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { useLang, STAFF_LANGUAGES } from '../i18n';
import NotificationBell from './NotificationBell';
import {
  ChartPieSlice,
  UsersThree,
  UserCircle,
  MagnifyingGlass,
  Database,
  SignOut,
  CaretDown,
  CaretUp,
  UserPlus,
  Percent,
  Sliders,
  Wrench,
  List,
  X,
  Globe,
  Phone,
  Bell,
  LockKey,
  FileText,
  ShieldCheck,
} from '@phosphor-icons/react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [expandedSections, setExpandedSections] = useState({
    crm: false,
    settings: false,
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchItems = [
    { path: '/admin', label: t('dashboard') || 'Dashboard', keywords: ['dashboard', 'панель'] },
    { path: '/admin/leads', label: t('leads') || 'Leads', keywords: ['leads', 'лиды'] },
    { path: '/admin/customers', label: t('customers') || 'Customers', keywords: ['customers', 'клиенты'] },
    { path: '/admin/calculator', label: t('calculatorAdmin') || 'Calculator', keywords: ['calculator', 'калькулятор'] },
    { path: '/admin/parser', label: 'VIN Parser', keywords: ['parser', 'vin'] },
    { path: '/admin/settings', label: 'System', keywords: ['settings', 'настройки'] },
  ];

  const filteredSearchItems = searchQuery.trim()
    ? searchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.keywords || []).some((k) => (k || '').toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setIsMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/cabinet/login');
  };

  const toggleSection = (id) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const isItemActive = (path) => {
    const [base] = path.split('?');
    return location.pathname === base;
  };

  const isSectionActive = (items) =>
    Array.isArray(items) && items.some((it) => isItemActive(it.path));

  // ── Сильно урезанное меню — только то, что осталось после чистки.
  //    Удалено: tasks, insights (analytics), login-audit, security-2fa-page
  //    (2FA настройка живёт в /admin/settings).
  //    Ранее удалено: deals, deposits, legal, finance, delivery, operations,
  //    forecast, contracts, executive, actions, notifications-center,
  //    customer-portal, staff, team/*, manager/*, tracking, vesselfinder,
  //    payments (Stripe), services, owner-dashboard, invoice-reminders,
  //    routing-rules, cadences, score-rules, predictive-leads, kpi,
  //    call-board, staff-sessions, journey, risk, escalations, control hub.
  const navGroups = [
    {
      id: 'dashboard',
      type: 'single',
      item: { path: '/admin', icon: ChartPieSlice, label: t('dashboard') || 'Dashboard' },
    },
    {
      id: 'crm',
      type: 'group',
      label: t('crm') || 'CRM',
      icon: UsersThree,
      items: [
        { path: '/admin/leads', icon: UserPlus, label: t('leads') || 'Leads' },
        { path: '/admin/customers', icon: UserCircle, label: t('customers') || 'Customers' },
      ],
    },
    {
      id: 'calculator',
      type: 'single',
      item: { path: '/admin/calculator', icon: Percent, label: t('calculatorAdmin') || 'Calculator' },
    },
    {
      id: 'parser',
      type: 'single',
      item: { path: '/admin/parser', icon: Database, label: 'VIN Parser' },
    },
    {
      id: 'moderation',
      type: 'single',
      item: { path: '/admin/moderation', icon: ShieldCheck, label: 'Moderation' },
    },
    {
      id: 'notifications',
      type: 'single',
      item: { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    },
    {
      id: 'ringostat',
      type: 'single',
      item: { path: '/admin/ringostat', icon: Phone, label: 'Ringostat' },
    },
    {
      id: 'settings',
      type: 'group',
      label: t('settings') || 'Settings',
      icon: Sliders,
      items: [
        { path: '/admin/settings', icon: Wrench, label: 'System' },
        { path: '/admin/settings/notifications', icon: Bell, label: 'Notifications hub' },
        { path: '/admin/system-settings', icon: Globe, label: 'Domain & CORS' },
        { path: '/admin/info', icon: FileText, label: 'Info' },
      ],
    },
  ];

  const roleLabels = {
    master_admin: t('roleMasterAdmin') || 'Master Admin',
    admin: t('roleAdmin') || 'Admin',
    moderator: t('roleModerator') || 'Moderator',
  };

  return (
    <div className="admin-layout flex h-screen bg-[#F7F7F8]">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E4E4E7]
          transform transition-transform duration-300 ease-out
          flex flex-col
          md:static md:translate-x-0 md:w-[260px] md:flex
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 md:p-5 border-b border-[#E4E4E7] flex items-center justify-between">
          <img src="/images/logo.svg" alt="Logo" className="h-8 md:h-10 w-auto" />
          <button
            className="md:hidden p-2 -mr-2 text-[#71717A] hover:text-[#18181B]"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="mobile-menu-close"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <nav className="flex-1 py-3 md:py-4 overflow-y-auto" data-testid="sidebar-nav">
          {navGroups.map((group) => {
            if (group.type === 'single') {
              const { path, icon: Icon, label } = group.item;
              return (
                <NavLink
                  key={group.id}
                  to={path}
                  end
                  className={() =>
                    `sidebar-item min-h-[44px] ${isItemActive(path) ? 'active' : ''}`
                  }
                  data-testid={`nav-${group.id}`}
                >
                  <Icon size={20} weight="duotone" />
                  <span style={{ flex: 1 }}>{label}</span>
                </NavLink>
              );
            }

            const isExpanded = expandedSections[group.id];
            const isActive = isSectionActive(group.items);
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="mb-1">
                <button
                  onClick={() => toggleSection(group.id)}
                  className={`sidebar-group-header min-h-[44px] ${isActive ? 'active' : ''}`}
                  data-testid={`nav-group-${group.id}`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={20} weight="duotone" />
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                </button>

                {isExpanded && (
                  <div className="sidebar-group-items">
                    {group.items.map(({ path, icon: Icon, label }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={() =>
                          `sidebar-subitem min-h-[44px] ${isItemActive(path) ? 'active' : ''}`
                        }
                        data-testid={`nav-${path.replace(/\//g, '-')}`}
                      >
                        <Icon size={16} weight="duotone" />
                        <span style={{ flex: 1 }}>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 md:p-4 border-t border-[#E4E4E7]">
          <div className="text-xs text-[#A1A1AA] px-3 mb-2">
            {roleLabels[user?.role] || user?.role}
          </div>
          <NavLink
            to="/admin/profile/password"
            className="w-full flex items-center gap-2 px-3 py-2.5 mb-1 text-sm font-medium text-[#52525B] hover:text-[#18181B] rounded-xl hover:bg-[#F4F4F5] transition-all"
            data-testid="change-password-link"
          >
            <LockKey size={18} weight="duotone" />
            <span>Change password</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#71717A] hover:text-[#DC2626] rounded-xl hover:bg-[#FEE2E2] transition-all"
            data-testid="logout-btn"
          >
            <SignOut size={18} weight="duotone" />
            <span>{t('logout') || 'Logout'}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="relative z-30 h-14 md:h-16 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-3 sm:px-4 md:px-8 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              className="md:hidden p-2 -ml-1 text-[#18181B] hover:bg-[#F4F4F5] rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="mobile-menu-toggle"
            >
              <List size={22} weight="bold" />
            </button>
            <div className="hidden md:block w-80 relative">
              <input
                type="text"
                placeholder={t('search') || 'Search'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full"
                data-testid="search-input"
              />
              {searchQuery && filteredSearchItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-xl shadow-lg z-50 py-2 max-h-64 overflow-auto">
                  {filteredSearchItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSearchSelect(item.path)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[#F4F4F5]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <button
              className="md:hidden p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] rounded-lg"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              data-testid="mobile-search-btn"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </button>

            <div className="relative flex-shrink-0" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 text-sm font-medium text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] rounded-lg"
                data-testid="lang-switcher-btn"
              >
                <Globe size={20} weight="duotone" />
                <span className="hidden sm:inline">
                  {STAFF_LANGUAGES.find((l) => l.code === lang)?.label || 'ENG'}
                </span>
                <CaretDown
                  size={14}
                  className={`transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-xl shadow-lg py-1 min-w-[140px] z-50">
                  {STAFF_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLang(language.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm ${
                        lang === language.code
                          ? 'bg-[#F4F4F5] text-[#18181B] font-medium'
                          : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                      }`}
                      data-testid={`lang-${language.code}`}
                    >
                      <span className="text-base">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6 lg:px-[50px] lg:py-8">
          {isMobileSearchOpen && (
            <div className="md:hidden mb-4 relative">
              <input
                type="text"
                placeholder={t('search') || 'Search'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input w-full"
                data-testid="mobile-search-input"
              />
              {searchQuery && filteredSearchItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E7] rounded-xl shadow-lg z-50 py-2 max-h-64 overflow-auto">
                  {filteredSearchItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSearchSelect(item.path)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F4F5]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
