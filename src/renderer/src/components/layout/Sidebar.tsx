import {
  Swords,
  Scroll,
  Settings,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  ArrowLeft,
  Skull
} from 'lucide-react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import logo from '../../assets/logo.svg';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { sidebarAutoHide } = useSettings();

  // Detectar si estamos dentro de una campaña
  const campaignMatch = matchPath({ path: "/campaign/:id", end: false }, location.pathname);
  const campaignId = campaignMatch?.params.id;

  const globalItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: Scroll, label: t('nav.campaigns'), path: '/campaigns' },
  ];

  const campaignItems = campaignId ? [
    { icon: LayoutDashboard, label: t('nav.overview'), path: `/campaign/${campaignId}` },
    { icon: Calendar, label: t('nav.sessions'), path: `/campaign/${campaignId}/sessions` },
    { icon: Swords, label: t('nav.combat'), path: `/campaign/${campaignId}/combat` },
    { icon: UserCheck, label: t('nav.characters'), path: `/campaign/${campaignId}/characters` },
    { icon: Users, label: t('nav.npcs'), path: `/campaign/${campaignId}/npcs` },
    { icon: Skull, label: t('monsters.title'), path: `/campaign/${campaignId}/monsters` },
    // { icon: Map, label: t('nav.maps'), path: `/campaign/${campaignId}/maps` },
  ] : [];

  const currentItems = campaignId ? campaignItems : globalItems;

  return (
    <aside
      className={`
        group/sidebar h-screen bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 text-slate-400 z-50 transition-all duration-300 ease-in-out
        ${sidebarAutoHide
          ? 'w-4 hover:w-20 -ml-3 hover:ml-0 opacity-50 hover:opacity-100 absolute left-0'
          : 'w-20 relative'
        }
      `}
    >
      <div className={`mb-4 p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20 transition-opacity duration-200 ${sidebarAutoHide ? 'opacity-0 group-hover/sidebar:opacity-100' : ''}`}>
        <img src={logo} alt="DM Toolbox" className="w-7 h-7" />
      </div>

      <nav className={`flex flex-col gap-4 w-full px-2 transition-opacity duration-200 ${sidebarAutoHide ? 'opacity-0 group-hover/sidebar:opacity-100' : ''}`}>
        {/* Botón Volver (Solo en modo campaña) */}
        {campaignId && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/50 hover:text-slate-200 mb-2 border-b border-slate-800 group/item relative"
          >
            <ArrowLeft size={24} />
            <span className="text-[10px] font-medium opacity-0 group-hover/item:opacity-100 transition-opacity absolute left-16 bg-slate-900 px-2 py-1 rounded border border-slate-700 pointer-events-none z-50 whitespace-nowrap text-white shadow-xl">
              {t('common.back')}
            </span>
          </button>
        )}

        {currentItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== `/campaign/${campaignId}` && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group/item relative
                ${isActive
                  ? 'bg-slate-800 text-indigo-400 shadow-inner ring-1 ring-slate-700'
                  : 'hover:bg-slate-800/50 hover:text-slate-200'}
              `}
            >
              <item.icon size={24} className={`mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium opacity-0 group-hover/item:opacity-100 transition-opacity absolute left-16 bg-slate-900 px-2 py-1 rounded border border-slate-700 pointer-events-none z-50 whitespace-nowrap text-white shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className={`mt-auto w-full px-2 transition-opacity duration-200 ${sidebarAutoHide ? 'opacity-0 group-hover/sidebar:opacity-100' : ''}`}>
        <button
          onClick={() => navigate('/settings')}
          className={`w-full p-3 rounded-xl transition-all duration-200 group/item relative ${
            location.pathname === '/settings'
              ? 'bg-slate-800 text-indigo-400 shadow-inner ring-1 ring-slate-700'
              : 'hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Settings size={24} className="mx-auto" />
          <span className="text-[10px] font-medium opacity-0 group-hover/item:opacity-100 transition-opacity absolute left-16 bg-slate-900 px-2 py-1 rounded border border-slate-700 pointer-events-none z-50 whitespace-nowrap text-white shadow-xl">
            {t('nav.settings')}
          </span>
        </button>
      </div>
    </aside>
  );
}
