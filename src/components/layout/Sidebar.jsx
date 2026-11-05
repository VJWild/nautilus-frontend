import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Book, Calendar, MessageSquare, Anchor, Power, ShieldCheck } from 'lucide-react';
import { usePensum } from '../../context/PensumContext';

const Sidebar = ({ isSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = usePensum();

    const handleLogout = () => {
        if (logout) logout();
        navigate('/auth');
    };

    const navItems = [
        { id: '/app', icon: User, label: 'Mi Tablero' },
        { id: '/app/inscripciones', icon: Book, label: 'Inscripción' },
        { id: '/app/horario', icon: Calendar, label: 'Mi Horario' },
        { id: '/app/aula-virtual', icon: MessageSquare, label: 'Aula Virtual' }
    ];

    if (user && user.role && String(user.role).toLowerCase() === 'admin') {
        navItems.push({
            id: '/app/admin-panel',
            icon: ShieldCheck,
            label: 'Panel Admin'
        });
    }

    return (
        <aside
            className={`h-screen glass-panel border-r border-current/10 transition-all duration-500 ease-in-out flex flex-col z-50 fixed lg:sticky top-0 left-0 select-none ${
                isSidebarOpen
                    ? 'w-64 translate-x-0'
                    : '-translate-x-full lg:translate-x-0 lg:w-20'
            }`}
        >
            {/* Encabezado con Logo */}
            <div className="h-20 flex items-center justify-center px-4 border-b border-current/10 shrink-0">
                <div
                    className={`flex items-center w-full ${
                        isSidebarOpen ? 'gap-3.5 px-2' : 'justify-center'
                    }`}
                >
                    <div className="apple-card w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                        <Anchor size={21} className="theme-text-accent" />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-lg font-semibold tracking-[0.18em] uppercase theme-text-primary truncate">
                            NAUTILUS
                        </span>
                    )}
                </div>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-1 py-6 px-3 space-y-2.5 overflow-y-auto custom-scrollbar overflow-x-hidden flex flex-col items-center">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.id;
                    return (
                        <Link
                            key={item.id}
                            to={item.id}
                            title={!isSidebarOpen ? item.label : undefined}
                            className={`flex items-center rounded-2xl transition-all duration-300 group relative ${
                                isSidebarOpen
                                    ? 'w-full px-4 py-3.5 gap-3.5 justify-start'
                                    : 'w-12 h-12 justify-center p-0'
                            } ${
                                isActive
                                    ? 'apple-btn-primary'
                                    : 'theme-text-secondary hover:theme-text-primary apple-card border-transparent'
                            }`}
                        >
                            <item.icon
                                size={20}
                                className="shrink-0 transition-transform duration-300 group-hover:scale-110"
                            />

                            {isSidebarOpen && (
                                <span className="text-xs tracking-wider uppercase truncate whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}

                            {isSidebarOpen && item.label === 'Panel Admin' && (
                                <span className="ml-auto glass-pill text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Admin
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Botón de Cierre de Sesión */}
            <div className="p-4 border-t border-current/10 flex justify-center shrink-0">
                <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    className={`apple-btn-glass rounded-2xl flex items-center justify-center cursor-pointer ${
                        isSidebarOpen ? 'w-full py-3 px-4 gap-3' : 'w-12 h-12 p-0'
                    }`}
                >
                    <Power size={19} className="shrink-0 theme-text-accent" />
                    {isSidebarOpen && (
                        <span className="text-xs uppercase tracking-wider">Cerrar Sesión</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;