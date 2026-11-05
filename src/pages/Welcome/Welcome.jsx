import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ChevronRight, Sun, Moon } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen w-full bg-atmosphere flex flex-col justify-between relative overflow-hidden p-6 md:p-10 select-none">

            {/* Barra Superior Minimalista */}
            <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
                <div className="glass-pill px-4 py-2 rounded-full flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-current theme-text-accent opacity-80" />
                    <span className="text-[11px] tracking-[0.16em] uppercase theme-text-secondary font-semibold">
                        EN LINEA
                    </span>
                </div>

                {/* Botón de Modo Claro / Oscuro con Hover Apple */}
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

            {/* Centro Minimalista en Panel Glassmorphic */}
            <main className="relative z-10 my-auto w-full max-w-xl mx-auto">
                <div className="glass-panel rounded-[2.5rem] px-8 py-14 sm:px-14 sm:py-16 text-center space-y-9">

                    {/* Insignia Central con Hover Apple */}
                    <div className="flex justify-center">
                        <div className="apple-card w-20 h-20 rounded-[1.75rem] flex items-center justify-center group">
                            <Anchor
                                size={38}
                                strokeWidth={2.2}
                                className="theme-text-accent transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                        </div>
                    </div>

                    {/* Título NAUTILUS con Acabado Editorial */}
                    <div className="space-y-4">
                        <div className="inline-flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-[0.35em] theme-text-secondary opacity-80 mb-2">
                                App Estudiantil • UMC
                            </span>
                            <h1 className="nautilus-title text-4xl sm:text-6xl font-semibold tracking-[0.18em] uppercase leading-none pl-[0.18em]">
                                NAUTILUS
                            </h1>
                            <div className="mt-4 w-16 h-[2px] rounded-full bg-current theme-text-accent opacity-40" />
                        </div>

                        <p className="text-base sm:text-lg theme-text-secondary font-semibold max-w-sm mx-auto leading-relaxed pt-1">
                            Tu aula virtual acompañándote a tu destino.
                        </p>
                    </div>

                    {/* Botón Principal con Hover Apple */}
                    <div className="pt-2">
                        <button
                            onClick={() => navigate('/auth')}
                            className="apple-btn-primary group inline-flex items-center justify-center gap-3 px-11 py-4 rounded-2xl text-base font-semibold tracking-wider cursor-pointer"
                        >
                            <span>INGRESAR</span>
                            <ChevronRight
                                size={19}
                                strokeWidth={2.5}
                                className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                            />
                        </button>
                    </div>

                </div>
            </main>

            {/* Footer Institucional */}
            <footer className="relative z-10 text-center">
                <p className="text-[10px] theme-text-secondary opacity-70 font-semibold tracking-[0.2em] uppercase">
                    © 2026 Universidad Nacional Experimental Marítima del Caribe
                </p>
            </footer>

            {/* Degradado tipográfico adaptable al Modo Claro / Oscuro */}
            <style>{`
                .nautilus-title {
                    background: linear-gradient(135deg, #F5F4F0 0%, #E7E2CE 55%, #BEB7A7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 8px 24px rgba(8, 16, 38, 0.35));
                }
                [data-theme="light"] .nautilus-title {
                    background: linear-gradient(135deg, #112250 0%, #3B507D 60%, #112250 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 6px 16px rgba(17, 34, 80, 0.12));
                }
            `}</style>
        </div>
    );
};

export default Welcome;