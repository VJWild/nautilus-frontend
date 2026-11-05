import React from 'react';
import { Link } from 'react-router-dom';
import {
    Target, Anchor, Award, Sparkles, Calendar,
    Book, TrendingUp, ChevronRight, MapPin, GraduationCap
} from 'lucide-react';
import { usePensum } from '../../context/PensumContext';
import { USER } from '../../mocks/data';

const Dashboard = () => {
    const {
        user,
        ucAprobadas,
        materiasAprobadas,
        materiasInscritas,
        totalesCarrera
    } = usePensum();

    const TOTAL_UC_CARRERA = totalesCarrera?.uc || 225;
    const TOTAL_MATERIAS_CARRERA = totalesCarrera?.materias || 71;

    const porcentajeProgreso = TOTAL_UC_CARRERA > 0
        ? Math.min(Math.round((ucAprobadas / TOTAL_UC_CARRERA) * 100), 100)
        : 0;
    const materiasCompletadas = materiasAprobadas ? materiasAprobadas.size : 0;

    // Se activa al completar las UC y Pasantías (o 100% del progreso)
    const esIngeniero =
        (ucAprobadas >= TOTAL_UC_CARRERA && materiasAprobadas?.has('PAP-10020')) ||
        porcentajeProgreso === 100;
    const esCasiIngeniero =
        !esIngeniero &&
        ucAprobadas >= TOTAL_UC_CARRERA - 20 &&
        !materiasAprobadas?.has('PAP-10020');

    const getMotivationalMessage = () => {
        if (esIngeniero) return '¡Misión Cumplida, Ingeniero! 🎓 Has aprobado el 100% del pensum académico.';
        if (esCasiIngeniero) return '¡Impresionante! 🎉 Solo te faltan las Pasantías Profesionales para culminar tu carrera.';
        if (porcentajeProgreso >= 50) return '¡Felicidades, ya superaste la mitad de la carrera! Mantén el buen ritmo.';
        if (porcentajeProgreso > 0) return 'Vas por buen camino. Cada asignatura aprobada te acerca más a tu meta. ⚓';
        return 'Cada gran travesía comienza con un paso. ¡Mucho éxito en este nuevo inicio, Cadete! ⚓';
    };

    const userData = user || USER;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* 1. Banner Principal (Se ilumina en Dorado al graduarse) */}
            <div
                className={`glass-panel rounded-[2.25rem] p-6 md:p-9 relative overflow-hidden group transition-all duration-700 ${
                    esIngeniero ? 'nautilus-gold-banner' : ''
                }`}
            >
                <div className="absolute right-4 -bottom-8 opacity-10 transform group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                    {esIngeniero ? (
                        <GraduationCap size={210} className="text-amber-400" />
                    ) : (
                        <Anchor size={210} />
                    )}
                </div>

                <div className="relative z-10 space-y-3">
                    <span
                        className={`text-[10px] uppercase tracking-[0.25em] block ${
                            esIngeniero ? 'text-amber-400 font-bold' : 'theme-text-secondary'
                        }`}
                    >
                        {esIngeniero ? '★ Pensum Completado con Honores ★' : 'Panel de Control Estudiantil'}
                    </span>

                    <h2 className="text-2xl md:text-4xl font-semibold theme-text-primary tracking-tight">
                        {esIngeniero
                            ? `¡Felicidades, Ingeniero ${userData.name.split(' ')[0]}!`
                            : `¡Bienvenido a bordo, ${userData.name}!`}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <span
                            className={`px-3.5 py-1 rounded-full text-xs tracking-wider border ${
                                esIngeniero
                                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                                    : 'glass-pill theme-text-accent'
                            }`}
                        >
                            {userData.code}
                        </span>
                        <span className="text-sm theme-text-secondary">
                            {userData.career} •{' '}
                            <strong className={esIngeniero ? 'text-amber-400' : 'theme-text-primary'}>
                                {userData.mencion}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Tarjeta de Resumen de Progreso */}
            <div
                className={`glass-panel rounded-[2.25rem] p-6 md:p-8 space-y-6 transition-all duration-700 ${
                    esIngeniero ? 'border-amber-400/40' : ''
                }`}
            >
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] theme-text-secondary">
                            Avance Curricular
                        </span>
                        <h3 className="text-lg md:text-xl font-semibold theme-text-primary flex items-center gap-2.5">
                            <Target
                                className={esIngeniero ? 'text-amber-400' : 'text-emerald-400'}
                                size={20}
                            />
                            <span>Resumen de Progreso</span>
                        </h3>
                    </div>

                    <span
                        className={`text-3xl md:text-4xl font-semibold ${
                            esIngeniero ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]' : 'text-emerald-400'
                        }`}
                    >
                        {porcentajeProgreso}%
                    </span>
                </div>

                {/* Barra de Progreso: Degradado a Verde o Dorado al 100% */}
                <div className="w-full h-4 rounded-full glass-pill overflow-hidden p-0.5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                            esIngeniero ? 'nautilus-progress-gold' : 'nautilus-progress-emerald'
                        }`}
                        style={{ width: `${Math.max(porcentajeProgreso, 2)}%` }}
                    />
                </div>

                {/* Cajas de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div
                        className={`apple-card p-5 rounded-2xl ${
                            esIngeniero ? 'border-amber-400/35 bg-amber-500/5' : ''
                        }`}
                    >
                        <p className="text-[11px] theme-text-secondary uppercase tracking-[0.16em] mb-1">
                            Unidades de Crédito
                        </p>
                        <p className="text-2xl md:text-3xl font-semibold theme-text-primary">
                            <span className={esIngeniero ? 'text-amber-400' : ''}>{ucAprobadas}</span>{' '}
                            <span className="text-sm font-normal theme-text-secondary">
                                / {TOTAL_UC_CARRERA} UC
                            </span>
                        </p>
                    </div>

                    <div
                        className={`apple-card p-5 rounded-2xl ${
                            esIngeniero ? 'border-amber-400/35 bg-amber-500/5' : ''
                        }`}
                    >
                        <p className="text-[11px] theme-text-secondary uppercase tracking-[0.16em] mb-1">
                            Materias Aprobadas
                        </p>
                        <p className="text-2xl md:text-3xl font-semibold theme-text-primary">
                            <span className={esIngeniero ? 'text-amber-400' : ''}>{materiasCompletadas}</span>{' '}
                            <span className="text-sm font-normal theme-text-secondary">
                                / {TOTAL_MATERIAS_CARRERA} Asignaturas
                            </span>
                        </p>
                    </div>
                </div>

                {/* Mensaje Motivacional */}
                <div
                    className={`p-4 rounded-2xl flex items-center gap-3.5 border transition-all duration-700 ${
                        esIngeniero
                            ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                            : 'glass-pill'
                    }`}
                >
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            esIngeniero
                                ? 'bg-amber-400 text-[#112250] shadow-md'
                                : 'apple-card text-emerald-400'
                        }`}
                    >
                        {esIngeniero || esCasiIngeniero ? <Award size={20} /> : <Sparkles size={20} />}
                    </div>
                    <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                            esIngeniero ? 'theme-text-primary font-semibold' : 'theme-text-primary font-normal'
                        }`}
                    >
                        {getMotivationalMessage()}
                    </p>
                </div>
            </div>

            {/* 3. Próximas Clases e Indicadores Rápidos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel rounded-[2.25rem] p-6 md:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold theme-text-primary flex items-center gap-2.5">
                            <Calendar className="theme-text-accent" size={20} />
                            <span>Próximas Clases</span>
                        </h3>

                        <Link
                            to="/app/inscripciones"
                            className="apple-btn-glass px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider"
                        >
                            Gestionar
                        </Link>
                    </div>

                    <div className="space-y-3 my-auto">
                        {materiasInscritas && materiasInscritas.length > 0 ? (
                            materiasInscritas.slice(0, 3).map((m, idx) => (
                                <div
                                    key={m.codigo || m.code || idx}
                                    className="apple-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
                                >
                                    <div className="glass-pill px-3 py-2 rounded-xl text-center min-w-[60px]">
                                        <p className="text-[10px] uppercase tracking-wider theme-text-secondary">
                                            {m.day ? m.day.slice(0, 3) : 'LUN'}
                                        </p>
                                        <p className="text-xs font-semibold theme-text-accent">
                                            {m.startTime || '08:00'}
                                        </p>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold theme-text-primary truncate">
                                            {m.nombre || m.name}
                                        </h4>
                                        <p className="text-xs theme-text-secondary flex items-center gap-1.5 mt-0.5 font-normal">
                                            <MapPin size={12} className="theme-text-accent" />
                                            <span>{m.room || 'Aula Virtual'}</span>
                                        </p>
                                    </div>

                                    <ChevronRight size={18} className="theme-text-secondary" />
                                </div>
                            ))
                        ) : (
                            <div className="glass-pill rounded-2xl p-8 text-center space-y-3">
                                <p className="text-sm theme-text-secondary font-normal">
                                    {esIngeniero
                                        ? 'Has completado satisfactoriamente todo tu pensum académico.'
                                        : 'Aún no tienes asignaturas inscritas para este período académico.'}
                                </p>
                                {!esIngeniero && (
                                    <Link
                                        to="/app/inscripciones"
                                        className="apple-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                                    >
                                        <span>Ir a Inscripciones</span>
                                        <ChevronRight size={15} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tarjetas de Estadísticas Rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="apple-card p-6 rounded-[2rem] flex flex-col justify-between">
                        <div className="w-11 h-11 rounded-2xl glass-pill flex items-center justify-center text-emerald-400 mb-4">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <span className="text-3xl font-semibold theme-text-primary block">
                                15.5
                            </span>
                            <p className="text-[11px] theme-text-secondary uppercase tracking-[0.16em] mt-1">
                                Índice Académico
                            </p>
                        </div>
                    </div>

                    <div className="apple-card p-6 rounded-[2rem] flex flex-col justify-between">
                        <div className="w-11 h-11 rounded-2xl glass-pill flex items-center justify-center theme-text-accent mb-4">
                            <Book size={22} />
                        </div>
                        <div>
                            <span className="text-3xl font-semibold theme-text-primary block">
                                {materiasInscritas ? materiasInscritas.length : 0}
                            </span>
                            <p className="text-[11px] theme-text-secondary uppercase tracking-[0.16em] mt-1">
                                Materias en Curso
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Degradado hacia verde esmeralda durante el progreso */
                .nautilus-progress-emerald {
                    background: linear-gradient(90deg, #3B507D 0%, #059669 55%, #34d399 100%);
                    box-shadow: 0 0 14px rgba(16, 185, 129, 0.35);
                }
                /* Degradado Dorado Conmemorativo al 100% */
                .nautilus-progress-gold {
                    background: linear-gradient(90deg, #d97706 0%, #fbbf24 55%, #fef08a 100%);
                    box-shadow: 0 0 18px rgba(251, 191, 36, 0.5);
                }
                .nautilus-gold-banner {
                    border-color: rgba(251, 191, 36, 0.45);
                    box-shadow: 0 24px 48px -12px rgba(217, 119, 6, 0.2), inset 0 1px 1px 0 rgba(254, 240, 138, 0.35);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;