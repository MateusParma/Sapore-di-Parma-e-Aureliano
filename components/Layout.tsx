import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Settings, HelpCircle, ChefHat, Heart } from 'lucide-react';
import BeeBackground from './BeeBackground';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/fridge', icon: ChefHat, label: 'Chef IA' },
    { path: '/shopping', icon: ShoppingCart, label: 'Compras' },
    { path: '/manage', icon: Settings, label: 'Gerenciar' },
    { path: '/help', icon: HelpCircle, label: 'Ajuda' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-0 md:pl-64 relative overflow-x-hidden">
      
      {/* Animated Interactive Background */}
      <BeeBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur shadow-xl z-50 flex-col p-6 border-r border-sage-100">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 mb-3">
            <ChefHat size={32} />
          </div>
          <h1 className="font-hand text-2xl text-sage-700 font-bold leading-tight">Sapore di Parma e Aureliano</h1>
          <div className="flex items-center justify-center gap-1 text-rose-400 mt-2">
             <Heart size={12} fill="currentColor" />
             <p className="text-stone-400 text-xs font-hand tracking-widest uppercase">Feito com Amor</p>
             <Heart size={12} fill="currentColor" />
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-sage-100 text-sage-700 font-bold shadow-sm'
                  : 'text-stone-500 hover:bg-sage-50 hover:text-sage-600'
              }`}
            >
              <item.icon size={20} className={isActive(item.path) ? "stroke-[2.5px]" : "stroke-2"} />
              <span className="font-hand text-lg tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-sage-100 text-center">
           <p className="font-hand text-stone-400 text-sm">Para Deborah & Mateus</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-sage-100 px-4 py-3 flex justify-between items-center shadow-sm">
         <h1 className="font-hand text-xl text-sage-700 font-bold leading-tight">Sapore di Parma</h1>
         <Heart size={20} className="text-rose-400" fill="currentColor" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-sage-200 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive(item.path) ? 'text-sage-600' : 'text-stone-400'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className="text-[10px] font-medium font-hand tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;