import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Select } from './ui/Select.jsx';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Factory, 
  CreditCard, 
  Settings, 
  LogOut, 
  Sparkles,
  Plus,
  Menu,
  X
} from 'lucide-react';

export function Layout({ children, factories = [], activeFactoryId, onSelectFactory }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/parties', label: 'Parties / Buyers', icon: Users },
    { to: '/items', label: 'Items & Rates', icon: Package },
    { to: '/factories', label: 'Factory Units', icon: Factory },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-y2k-bg text-y2k-text flex flex-col font-sans">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-y2k-surface text-y2k-text border-b border-y2k-border shadow-y2k-sm px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-y2k-text hover:bg-y2k-bg border border-y2k-border rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Brand emblem */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-y2k-text text-y2k-bg border border-y2k-border rounded-lg flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight uppercase">INNERVOISES</span>
            </div>

            {/* Factory location switcher */}
            {factories.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs font-bold text-y2k-muted uppercase">Unit:</span>
                <Select
                  value={activeFactoryId}
                  onChange={(e) => onSelectFactory(e.target.value)}
                  options={factories.map(f => ({ label: `${f.name} (${f.state})`, value: f._id }))}
                  className="!py-1 !px-2.5 text-xs w-48 font-bold"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/invoices/create')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-y2k-green text-y2k-greenDark font-bold text-xs border border-y2k-greenDark rounded-lg shadow-y2k-sm hover:translate-y-[-1px] transition-all min-h-[38px]"
            >
              <Plus size={16} /> New Invoice
            </button>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-y2k-border">
              <div className="w-8 h-8 bg-y2k-purple text-y2k-purpleDark border border-y2k-border rounded-lg font-bold text-xs flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-xs font-bold truncate max-w-[120px]">{user?.name}</span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 bg-y2k-red/40 hover:bg-y2k-red text-y2k-redDark border border-y2k-redDark rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
        <aside 
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 md:w-auto bg-y2k-surface md:bg-transparent p-4 md:p-0 border-r md:border-r-0 border-y2k-border shadow-y2k md:shadow-none transition-transform duration-200 ease-in-out md:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="md:hidden flex items-center justify-between pb-4 mb-3 border-b border-y2k-border">
            <span className="font-extrabold text-sm uppercase text-y2k-text">Navigation</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-y2k-muted">
              <X size={20} />
            </button>
          </div>

          <div className="bg-y2k-surface text-y2k-text border border-y2k-border rounded-xl shadow-y2k p-3 space-y-1">
            <p className="text-[10px] font-bold text-y2k-muted uppercase tracking-wider px-3 py-1">Main Menu</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all border rounded-lg ${
                      isActive
                        ? 'bg-y2k-green text-y2k-greenDark border-y2k-greenDark shadow-y2k-sm'
                        : 'bg-transparent text-y2k-text border-transparent hover:bg-y2k-bg hover:border-y2k-border'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="min-w-0">
          {children || <Outlet />}
        </main>
      </div>

      {/* Floating Action Button for Mobile Create Invoice */}
      <button
        onClick={() => navigate('/invoices/create')}
        className="sm:hidden fixed right-4 bottom-6 z-30 w-14 h-14 bg-y2k-green text-y2k-greenDark border-2 border-y2k-greenDark rounded-full shadow-y2k flex items-center justify-center font-bold"
        aria-label="Create New Invoice"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
