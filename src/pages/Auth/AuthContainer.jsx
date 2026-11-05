import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Anchor, User, Lock, Mail, ChevronRight, ArrowLeft,
    Info, AlertCircle, Loader2, Sun, Moon
} from 'lucide-react';

const FloatingInput = ({ label, name, type = 'text', icon: Icon, value, onChange, required = false }) => (
    <div className="relative mb-5">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-secondary transition-colors z-10 pointer-events-none">
            {Icon && <Icon size={18} />}
        </div>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder=" "
            required={required}
            className="nautilus-input peer w-full pl-12 pr-4 py-4 rounded-2xl outline-none font-semibold text-sm placeholder-transparent"
        />
        <label className="nautilus-label absolute left-11 top-4 theme-text-secondary font-semibold transition-all pointer-events-none px-2 rounded-md peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:theme-text-accent peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:theme-text-accent uppercase tracking-widest">
            {label}
        </label>
    </div>
);

const AuthContainer = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showLoginContent, setShowLoginContent] = useState(true);
    const [showPassInfo, setShowPassInfo] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Sincronización del Modo Claro / Oscuro
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('miumc_theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('miumc_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const [formData, setFormData] = useState({
        studentCode: '',
        password: '',
        email: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleAuthMode = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIsLogin(!isLogin);

        setTimeout(() => {
            setShowLoginContent(!showLoginContent);
        }, 280);

        setTimeout(() => {
            setIsAnimating(false);
        }, 560);
    };

    const handleAction = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (showLoginContent) {
                sessionStorage.setItem('nautilus_user', JSON.stringify({
                    code: formData.studentCode || 'INGINF-26327337',
                    name: 'Víctor J. González'
                }));
                navigate('/app');
            } else {
                sessionStorage.setItem('pending_student_code', formData.studentCode);
                navigate('/onboarding');
            }
        }, 450);
    };

    return (
        <div className="min-h-screen w-full bg-atmosphere flex flex-col justify-between p-6 md:p-10 relative overflow-hidden select-none">

            {/* Barra Superior con Botón Volver y Selector de Tema */}
            <header className="relative z-30 w-full max-w-5xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="apple-btn-glass px-4 py-2.5 rounded-full flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="apple-btn-glass px-4 py-2.5 rounded-full flex items-center gap-2.5 text-xs tracking-wider cursor-pointer"
                    aria-label="Cambiar tema"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={15} className="text-[#E7E2CE]" />
                        </>
                    ) : (
                        <>
                            <Moon size={15} className="text-[#112250]" />
                        </>
                    )}
                </button>
            </header>

            {/* Contenedor Principal Glassmorphic */}
            <main className="relative z-10 my-auto w-full max-w-[980px] mx-auto py-4">
                <div className="w-full min-h-[600px] md:h-[580px] glass-panel rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative">

                    {/* Panel Lateral Deslizante */}
                    <div
                        className={`hidden md:flex w-2/5 nautilus-side-panel p-12 flex-col justify-between relative transition-all duration-700 ease-in-out z-20 ${
                            !isLogin ? 'md:translate-x-[150%]' : ''
                        }`}
                    >
                        <div className="glass-pill px-3.5 py-1.5 rounded-full w-fit flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current theme-text-accent" />
                            <span className="text-[10px] tracking-[0.2em] uppercase theme-text-secondary">
                                Nautilus • UMC
                            </span>
                        </div>

                        <div className="space-y-6 my-auto">
                            <div className="apple-card w-16 h-16 rounded-2xl flex items-center justify-center">
                                <Anchor size={30} className="theme-text-accent" />
                            </div>

                            <h2 className="text-3xl font-semibold leading-tight theme-text-primary">
                                {isLogin ? '¡Hola de nuevo, Cadete!' : 'Únete a la Tripulación'}
                            </h2>

                            <p className="theme-text-secondary text-sm font-normal leading-relaxed">
                                {isLogin
                                    ? 'Ingresa tus credenciales y sube a bordo.'
                                    : 'Crea tu cuenta y registra tu progreso academico.'}
                            </p>

                            <button
                                type="button"
                                onClick={toggleAuthMode}
                                disabled={isAnimating}
                                className="apple-btn-glass px-7 py-3.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer disabled:opacity-50"
                            >
                                {isLogin ? 'Crear Cuenta' : 'Ya tengo cuenta'}
                            </button>
                        </div>

                        <p className="text-[10px] theme-text-secondary opacity-60 uppercase tracking-[0.2em]">
                            App Estudiantil
                        </p>
                    </div>

                    {/* Panel de Formularios */}
                    <div
                        className={`flex-1 flex flex-col transition-all duration-700 ease-in-out overflow-y-auto overflow-x-hidden ${
                            !isLogin ? 'md:-translate-x-[66.6%]' : ''
                        }`}
                    >
                        <div className="max-w-md mx-auto w-full h-full flex flex-col px-8 py-10 md:py-12 justify-center">
                            {showLoginContent ? (
                                <form onSubmit={handleAction} className="my-auto space-y-2">
                                    <div className="mb-8 text-center md:text-left">
                                        <p className="text-[11px] uppercase tracking-[0.22em] theme-text-secondary mb-1">

                                        </p>
                                        <h1 className="text-3xl sm:text-4xl font-semibold theme-text-primary tracking-tight">
                                            Iniciar Sesión
                                        </h1>
                                    </div>

                                    <FloatingInput
                                        label="Código de Estudiante"
                                        name="studentCode"
                                        icon={User}
                                        value={formData.studentCode}
                                        onChange={handleChange}
                                        required
                                    />

                                    <div className="relative">
                                        <FloatingInput
                                            label="Contraseña"
                                            name="password"
                                            type="password"
                                            icon={Lock}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onMouseEnter={() => setShowPassInfo(true)}
                                            onMouseLeave={() => setShowPassInfo(false)}
                                            className="absolute right-4 top-4 theme-text-secondary hover:opacity-100 opacity-70 transition-opacity z-10 cursor-pointer"
                                        >
                                            <Info size={18} />
                                        </button>

                                        {showPassInfo && (
                                            <div className="absolute right-0 bottom-full mb-2 w-64 glass-panel p-4 rounded-2xl z-50 text-left">
                                                <p className="font-semibold text-xs theme-text-primary mb-1.5 flex items-center gap-1.5">
                                                    <AlertCircle size={13} className="theme-text-accent" /> REQUISITOS:
                                                </p>
                                                <ul className="space-y-1 theme-text-secondary text-[11px] font-normal">
                                                    <li>• Mínimo 8 caracteres</li>
                                                    <li>• Al menos 1 Mayúscula</li>
                                                    <li>• 1 Carácter especial</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end pb-4">
                                        <button
                                            type="button"
                                            className="text-xs theme-text-secondary hover:underline cursor-pointer"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="apple-btn-primary w-full py-4 rounded-2xl text-base font-semibold uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" /> Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar Sesión</span>
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <div className="md:hidden pt-6 text-center border-t border-current/10 mt-6">
                                        <p className="text-xs theme-text-secondary mb-2">¿No tienes una cuenta aún?</p>
                                        <button
                                            type="button"
                                            onClick={toggleAuthMode}
                                            disabled={isAnimating}
                                            className="theme-text-primary uppercase tracking-widest text-xs cursor-pointer"
                                        >
                                            Crear Cuenta Nueva
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleAction} className="my-auto space-y-3">
                                    <div className="mb-6 text-center md:text-left">
                                        <p className="text-[11px] uppercase tracking-[0.22em] theme-text-secondary mb-1">
                                            Paso 1 • Credenciales Estudiantiles
                                        </p>
                                        <h1 className="text-3xl sm:text-4xl font-semibold theme-text-primary tracking-tight">
                                            Crear Cuenta
                                        </h1>
                                    </div>

                                    <div>
                                        <FloatingInput
                                            label="Código Estudiante (ID)"
                                            name="studentCode"
                                            icon={User}
                                            value={formData.studentCode}
                                            onChange={handleChange}
                                            required
                                        />
                                        <FloatingInput
                                            label="Correo Electrónico"
                                            name="email"
                                            type="email"
                                            icon={Mail}
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <FloatingInput
                                            label="Establecer Contraseña"
                                            name="password"
                                            type="password"
                                            icon={Lock}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="apple-btn-primary w-full py-4 rounded-2xl text-base font-semibold uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" /> Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <span>Continuar Registro</span>
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <div className="md:hidden pt-6 text-center border-t border-current/10 mt-6">
                                        <p className="text-xs theme-text-secondary mb-2">¿Ya estás registrado en Nautilus?</p>
                                        <button
                                            type="button"
                                            onClick={toggleAuthMode}
                                            disabled={isAnimating}
                                            className="theme-text-primary uppercase tracking-widest text-xs cursor-pointer"
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer Institucional */}
            <footer className="relative z-10 text-center">
                <p className="text-[10px] theme-text-secondary opacity-70 font-semibold tracking-[0.2em] uppercase">
                    © 2026 Universidad Nacional Experimental Marítima del Caribe
                </p>
            </footer>

            {/* Estilos adaptables al Modo Claro / Oscuro para Inputs y Panel Lateral */}
            <style>{`
                .nautilus-side-panel {
                    background: rgba(17, 34, 80, 0.55);
                    border-left: 1px solid var(--glass-border);
                    border-right: 1px solid var(--glass-border);
                }
                [data-theme="light"] .nautilus-side-panel {
                    background: rgba(231, 226, 206, 0.55);
                }
                .nautilus-input {
                    background: var(--glass-card-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .nautilus-input:focus {
                    background: var(--glass-panel-bg);
                    border-color: var(--glass-border-hover);
                    box-shadow: 0 0 0 4px rgba(190, 183, 167, 0.15);
                }
                .nautilus-label {
                    background: transparent;
                }
                .peer:focus ~ .nautilus-label,
                .peer:not(:placeholder-shown) ~ .nautilus-label {
                    background: var(--bg-primary);
                }
            `}</style>
        </div>
    );
};

export default AuthContainer;