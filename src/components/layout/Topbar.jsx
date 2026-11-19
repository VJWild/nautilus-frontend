import React from 'react';
import { Menu, Search, Bell, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Topbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const {user} = useAuth();
    const {theme, toggleTheme } = useTheme();

 
    return (
        <header className="h-20 glass-panel border-b border-current/10 flex justify-between items-center px-4 lg:px-8 z-30 shrink-0 select-none">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="apple-btn-glass w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
                    aria-label="Alternar menú"
                >
                    <Menu size={20} className="theme-text-primary" />
                </button>

                <div className="hidden md:flex items-center relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-secondary" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar asignatura..."
                        className="nautilus-input pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2.5 md:gap-4">
                {/* Conmutador Modo Claro / Modo Oscuro */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="apple-btn-glass px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs tracking-wider cursor-pointer"
                    aria-label="Cambiar tema"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={16} className="text-[#E7E2CE] shrink-0" />
                        </>
                    ) : (
                        <>
                            <Moon size={16} className="text-[#112250] shrink-0" />
                        </>
                    )}
                </button>

                {/* Notificaciones */}
                <button className="apple-btn-glass relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer">
                    <Bell size={18} className="theme-text-primary" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                </button>

                {/* Perfil del Estudiante */}
                <div className="flex items-center gap-3 border-l border-current/10 pl-3 md:pl-5">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm theme-text-primary leading-tight">{user?.name}</p>
                        <p className="text-[11px] theme-text-secondary font-normal">{user?.code}</p>
                    </div>

                    <div className="apple-card w-10 h-10 rounded-xl flex items-center justify-center theme-text-accent text-xs uppercase">
                        {user?.avatar}
                    </div>
                </div>
            </div>

            <style>{`
                .nautilus-input {
                    background: var(--glass-card-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .nautilus-input:focus {
                    background: var(--glass-panel-bg);
                    border-color: var(--glass-border-hover);
                }
            `}</style>
        </header>
    );
};

export default Topbar;