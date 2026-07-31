import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiArrowLeft, FiPackage } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: FiGrid, end: true },
    { name: 'Products Catalog', path: '/admin/products', icon: FiPackage, end: false },
    { name: 'Orders Management', path: '/admin/orders', icon: FiShoppingBag, end: false },
  ];

  return (
    <aside className="w-64 bg-primary text-cream min-h-screen p-6 flex flex-col justify-between shadow-2xl font-poppins border-r border-accent/20">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-accent/20">
          <div className="w-10 h-10 bg-gradient-btn rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
            <FiPackage />
          </div>
          <div>
            <h1 className="text-xl font-playfair font-black text-gradient-gold">SomValli</h1>
            <p className="text-[10px] text-cream/60 tracking-widest uppercase font-bold">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-gradient-btn text-white shadow-lg scale-105'
                      : 'text-cream/80 hover:bg-white/10 hover:text-accent'
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Back to Store Link */}
      <div className="pt-6 border-t border-accent/20">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-cream/70 hover:text-accent font-bold text-sm transition-colors"
        >
          <FiArrowLeft size={18} /> Back to Store
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
