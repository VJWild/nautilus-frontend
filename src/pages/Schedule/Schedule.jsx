import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Calendar, Download, Clock, MapPin, X, ChevronDown,
    Image as ImageIcon, FileText, User as UserIcon,
    Loader2, Plus, LayoutGrid, List, CheckCircle2,
    BookOpen, Sparkles, ArrowUpRight
} from 'lucide-react';
import { DAYS, HOURS } from '../../mocks/data';
import { usePensum } from '../../context/PensumContext';

const Schedule = () => {
    const { materiasInscritas, user, theme } = usePensum();
    const scheduleRef = useRef(null);
    const navigate = useNavigate();

    const [selectedClass, setSelectedClass] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'

    // Rango horario profesional (07:00 a 19:00 por defecto o dinámico)
    const displayHours = useMemo(() => {
        return HOURS.slice(0, 13); // 7:00 a 19:00 para una grilla más proporcionada y ejecutiva
    }, []);

    const totalHours = displayHours.length;
    const firstHour = displayHours[0] || 7;

    // Métricas ejecutivas del horario
    const scheduleStats = useMemo(() => {
        const totalMaterias = materiasInscritas.length;
        const totalUC = materiasInscritas.reduce((acc, m) => acc + (m.uc || 0), 0);
        const totalWeeklyHours = materiasInscritas.reduce((acc, m) => acc + (m.duration || 2), 0);
        const activeDays = new Set(materiasInscritas.map((m) => m.day)).size;
        return { totalMaterias, totalUC, totalWeeklyHours, activeDays };
    }, [materiasInscritas]);

    const getPositionStyles = (startTime = '08:00', duration = 2) => {
        const startHour = parseInt(startTime.split(':')[0], 10);
        const offset = Math.max(0, startHour - firstHour);
        return {
            top: `${(offset / totalHours) * 100}%`,
            height: `${(duration / totalHours) * 100}%`
        };
    };

    const getBlockStyle = (colorString = '') => {
        const c = colorString.toLowerCase();
        if (c.includes('emerald') || c.includes('green')) {
            return {
                border: 'border-l-emerald-400',
                bg: 'bg-emerald-500/12 hover:bg-emerald-500/20',
                badge: 'text-emerald-400 bg-emerald-500/15'
            };
        }
        if (c.includes('purple') || c.includes('indigo')) {
            return {
                border: 'border-l-purple-400',
                bg: 'bg-purple-500/12 hover:bg-purple-500/20',
                badge: 'text-purple-300 bg-purple-500/15'
            };
        }
        if (c.includes('amber') || c.includes('orange')) {
            return {
                border: 'border-l-amber-400',
                bg: 'bg-amber-500/12 hover:bg-amber-500/20',
                badge: 'text-amber-300 bg-amber-500/15'
            };
        }
        return {
            border: 'border-l-[#E7E2CE]',
            bg: 'bg-[#3B507D]/30 hover:bg-[#3B507D]/45',
            badge: 'theme-text-accent bg-current/10'
        };
    };

    const handleExport = async (format) => {
        if (!scheduleRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);

        await new Promise((resolve) => setTimeout(resolve, 250));

        try {
            const html2canvas = (await import('html2canvas')).default;
            const exportBg = theme === 'light' ? '#F5F4F0' : '#112250';

            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: exportBg,
                logging: false,
                width: scheduleRef.current.scrollWidth,
                height: scheduleRef.current.scrollHeight,
                windowWidth: scheduleRef.current.scrollWidth,
                windowHeight: scheduleRef.current.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const fileCode = user?.code || user?.student_code || 'Cadete';

            if (format === 'png') {
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `Horario_Nautilus_${fileCode}.png`;
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = await import('jspdf');
                const orientation = canvas.width > canvas.height ? 'l' : 'p';
                const pdf = new jsPDF(orientation, 'px', [canvas.width, canvas.height]);
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Horario_Nautilus_${fileCode}.pdf`);
            }
        } catch (error) {
            console.error('Error al exportar el horario:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col space-y-5 pb-10 relative">
            {/* Overlay invisible para cerrar el desplegable al hacer clic fuera */}
            {showExportMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowExportMenu(false)}
                />
            )}

            {/* 1. CABECERA EJECUTIVA (z-40 para que el desplegable SIEMPRE flote por encima de la grilla) */}
            <div className="glass-panel rounded-[2.25rem] p-6 md:px-8 md:py-7 relative z-40">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 glass-pill px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] theme-text-accent mb-2">
                            <Sparkles size={12} />
                            <span>Cronograma Oficial • Período 2026-I</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary tracking-tight flex items-center gap-3">
                            <span>Horario Académico</span>
                        </h2>
                        <p className="text-xs sm:text-sm theme-text-secondary font-normal mt-0.5">
                            Distribución semanal de cátedras, aulas asignadas y bloques horarios.
                        </p>
                    </div>

                    {/* Barra de Herramientas Derecha */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                        {/* Conmutador Grilla vs Agenda */}
                        <div className="glass-pill p-1 rounded-2xl flex items-center gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewMode === 'grid'
                                        ? 'apple-btn-primary'
                                        : 'theme-text-secondary hover:theme-text-primary'
                                }`}
                            >
                                <LayoutGrid size={14} />
                                <span>Grilla</span>
                            </button>
                            <button
                                onClick={() => setViewMode('agenda')}
                                className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewMode === 'agenda'
                                        ? 'apple-btn-primary'
                                        : 'theme-text-secondary hover:theme-text-primary'
                                }`}
                            >
                                <List size={14} />
                                <span>Agenda</span>
                            </button>
                        </div>

                        {/* Menú de Exportación con Z-Index Elevado */}
                        <div className="relative z-50">
                            <button
                                onClick={() => !isExporting && setShowExportMenu(!showExportMenu)}
                                className="apple-btn-primary px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                            >
                                {isExporting ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <Download size={15} />
                                )}
                                <span>{isExporting ? 'Generando...' : 'Descargar'}</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 ${
                                        showExportMenu ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 top-full mt-2.5 w-64 glass-panel rounded-2xl p-2 z-[100] shadow-2xl border border-current/20 space-y-1 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 border-b border-current/10">
                                        <p className="text-[10px] uppercase tracking-[0.18em] theme-text-secondary">
                                            Exportar Comprobante
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs theme-text-primary hover:bg-current/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-rose-400">
                                                <FileText size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Documento PDF</p>
                                                <p className="text-[10px] theme-text-secondary font-normal">
                                                    Ideal para impresión
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={14} className="theme-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <button
                                        onClick={() => handleExport('png')}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs theme-text-primary hover:bg-current/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-emerald-400">
                                                <ImageIcon size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Imagen PNG HD</p>
                                                <p className="text-[10px] theme-text-secondary font-normal">
                                                    Alta resolución (2x)
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={14} className="theme-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Banda de Resumen Ejecutivo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-current/10">
                    <div className="glass-pill px-4 py-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider theme-text-secondary">
                                Asignaturas
                            </p>
                            <p className="text-lg font-semibold theme-text-primary">
                                {scheduleStats.totalMaterias} Inscritas
                            </p>
                        </div>
                        <BookOpen size={18} className="theme-text-accent opacity-80" />
                    </div>

                    <div className="glass-pill px-4 py-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider theme-text-secondary">
                                Carga Horaria
                            </p>
                            <p className="text-lg font-semibold theme-text-primary">
                                {scheduleStats.totalWeeklyHours}h / Semana
                            </p>
                        </div>
                        <Clock size={18} className="theme-text-accent opacity-80" />
                    </div>

                    <div className="glass-pill px-4 py-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider theme-text-secondary">
                                Días Presenciales
                            </p>
                            <p className="text-lg font-semibold theme-text-primary">
                                {scheduleStats.activeDays} de 7 Días
                            </p>
                        </div>
                        <Calendar size={18} className="theme-text-accent opacity-80" />
                    </div>

                    <div className="glass-pill px-4 py-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider theme-text-secondary">
                                Estado de Bloques
                            </p>
                            <p className="text-sm font-semibold text-emerald-400">
                                Sin Choques
                            </p>
                        </div>
                        <CheckCircle2 size={18} className="text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO DEL HORARIO (z-10 para mantenerse debajo del menú de exportación) */}
            {materiasInscritas.length === 0 ? (
                <div className="glass-panel rounded-[2.25rem] p-12 text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl apple-card flex items-center justify-center mx-auto theme-text-accent">
                        <Calendar size={30} />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold theme-text-primary">
                            Tu horario académico está vacío
                        </h3>
                        <p className="text-xs theme-text-secondary font-normal leading-relaxed">
                            Aún no has pre-inscrito asignaturas para este período. Dirígete al módulo de inscripciones para seleccionar tus materias.
                        </p>
                    </div>
                    <Link
                        to="/app/inscripciones"
                        className="apple-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase tracking-wider"
                    >
                        <Plus size={16} />
                        <span>Ir a Inscripciones</span>
                    </Link>
                </div>
            ) : viewMode === 'agenda' ? (
                /* MODO AGENDA EJECUTIVA POR DÍA */
                <div ref={scheduleRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {DAYS.slice(0, 6).map((day) => {
                        const dayClasses = materiasInscritas
                            .filter((m) => m.day === day)
                            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

                        return (
                            <div key={day} className="glass-panel rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                                    <h3 className="text-sm uppercase tracking-[0.18em] theme-text-primary">
                                        {day}
                                    </h3>
                                    <span className="glass-pill px-2.5 py-0.5 rounded-full text-[10px] theme-text-accent">
                                        {dayClasses.length} {dayClasses.length === 1 ? 'Cátedra' : 'Cátedras'}
                                    </span>
                                </div>

                                {dayClasses.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-xs theme-text-secondary font-normal opacity-60">
                                            Día libre de carga académica
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 my-auto">
                                        {dayClasses.map((materia) => {
                                            const st = getBlockStyle(materia.color);
                                            return (
                                                <div
                                                    key={materia.codigo}
                                                    onClick={() => setSelectedClass(materia)}
                                                    className={`apple-card ${st.border} border-l-4 p-4 rounded-2xl cursor-pointer space-y-2`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${st.badge}`}>
                                                            {materia.codigo}
                                                        </span>
                                                        <span className="text-xs theme-text-accent flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {materia.startTime} - {materia.endTime}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold theme-text-primary leading-snug">
                                                        {materia.nombre}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-[11px] theme-text-secondary font-normal pt-1">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={12} className="theme-text-accent" />
                                                            {materia.room || 'Aula Virtual'}
                                                        </span>
                                                        <span>{materia.uc} UC • Sec 01</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* MODO GRILLA SEMANAL PROFESIONAL */
                <div className="glass-panel rounded-[2.25rem] p-4 md:p-6 overflow-auto custom-scrollbar relative z-10">
                    <div
                        ref={scheduleRef}
                        data-schedule-container
                        className="relative rounded-2xl border border-current/15 overflow-hidden"
                        style={{
                            minWidth: '980px',
                            height: `${totalHours * 72 + 54}px`
                        }}
                    >
                        {/* Encabezado de Columnas (Días) */}
                        <div className="h-[54px] flex border-b border-current/15 glass-pill">
                            <div className="w-20 border-r border-current/15 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] theme-text-secondary shrink-0">
                                Bloque
                            </div>
                            {DAYS.slice(0, 6).map((day) => {
                                const count = materiasInscritas.filter((m) => m.day === day).length;
                                return (
                                    <div
                                        key={day}
                                        className="flex-1 border-r border-current/15 last:border-0 px-3 flex items-center justify-between"
                                    >
                                        <span className="text-xs uppercase tracking-[0.15em] theme-text-primary">
                                            {day}
                                        </span>
                                        {count > 0 && (
                                            <span className="w-5 h-5 rounded-full glass-pill text-[10px] theme-text-accent flex items-center justify-center">
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cuerpo de la Grilla */}
                        <div className="relative" style={{ height: `${totalHours * 72}px` }}>
                            {/* Filas Horarias */}
                            {displayHours.map((hour, idx) => (
                                <div
                                    key={hour}
                                    className="absolute w-full border-b border-current/10 flex items-stretch"
                                    style={{
                                        top: `${(idx / totalHours) * 100}%`,
                                        height: `${(1 / totalHours) * 100}%`
                                    }}
                                >
                                    <div className="w-20 border-r border-current/15 flex flex-col items-center justify-start pt-2 shrink-0">
                                        <span className="text-[11px] theme-text-primary">
                                            {hour.toString().padStart(2, '0')}:00
                                        </span>
                                        <span className="text-[9px] theme-text-secondary opacity-60 font-normal">
                                            {(hour + 1).toString().padStart(2, '0')}:00
                                        </span>
                                    </div>
                                    {DAYS.slice(0, 6).map((day) => (
                                        <div
                                            key={day}
                                            className="flex-1 border-r border-current/10 last:border-0"
                                        />
                                    ))}
                                </div>
                            ))}

                            {/* Bloques de Asignaturas */}
                            <div className="absolute inset-0 flex ml-20">
                                {DAYS.slice(0, 6).map((day) => (
                                    <div key={day} className="flex-1 relative h-full px-1.5">
                                        {materiasInscritas
                                            .filter((m) => m.day === day)
                                            .map((materia) => {
                                                const pos = getPositionStyles(
                                                    materia.startTime,
                                                    materia.duration || 2
                                                );
                                                const st = getBlockStyle(materia.color);

                                                return (
                                                    <div
                                                        key={materia.codigo}
                                                        onClick={() => setSelectedClass(materia)}
                                                        className="absolute w-full left-0 right-0 p-1.5 z-10 cursor-pointer"
                                                        style={pos}
                                                    >
                                                        <div
                                                            className={`apple-card ${st.border} ${st.bg} border-l-4 rounded-2xl p-3 h-full flex flex-col justify-between overflow-hidden`}
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md ${st.badge}`}>
                                                                        {materia.codigo}
                                                                    </span>
                                                                    <span className="text-[9px] theme-text-secondary">
                                                                        Sec 01
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-semibold theme-text-primary leading-snug line-clamp-2">
                                                                    {materia.nombre}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center justify-between text-[10px] theme-text-secondary pt-1.5 border-t border-current/10 mt-auto">
                                                                <span className="flex items-center gap-1 truncate">
                                                                    <Clock size={10} className="theme-text-accent shrink-0" />
                                                                    {materia.startTime}-{materia.endTime}
                                                                </span>
                                                                <span className="flex items-center gap-1 truncate ml-1">
                                                                    <MapPin size={10} className="theme-text-accent shrink-0" />
                                                                    {materia.room || 'Lab 1'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle de la Clase */}
            {selectedClass && (
                <div
                    className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedClass(null)}
                >
                    <div
                        className="glass-panel rounded-[2.5rem] w-full max-w-md p-8 space-y-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="apple-btn-glass absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-2 pr-8">
                            <div className="flex items-center gap-2">
                                <span className="glass-pill text-[10px] uppercase tracking-[0.22em] px-3 py-1 rounded-full theme-text-accent">
                                    {selectedClass.codigo}
                                </span>
                                <span className="glass-pill text-[10px] uppercase tracking-wider px-3 py-1 rounded-full theme-text-secondary">
                                    {selectedClass.uc || 3} UC
                                </span>
                            </div>
                            <h3 className="text-2xl font-semibold theme-text-primary leading-tight pt-1">
                                {selectedClass.nombre}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div className="glass-pill p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl apple-card flex items-center justify-center theme-text-accent shrink-0">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest theme-text-secondary">
                                        Horario Asignado
                                    </p>
                                    <p className="text-sm theme-text-primary">
                                        {selectedClass.day} • {selectedClass.startTime} a {selectedClass.endTime}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-pill p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl apple-card flex items-center justify-center text-emerald-400 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest theme-text-secondary">
                                        Ubicación y Sección
                                    </p>
                                    <p className="text-sm theme-text-primary">
                                        {selectedClass.room || 'Aula Virtual'} • Sección 01
                                    </p>
                                </div>
                            </div>

                            <div className="glass-pill p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl apple-card flex items-center justify-center theme-text-accent shrink-0">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest theme-text-secondary">
                                        Docente Titular
                                    </p>
                                    <p className="text-sm theme-text-primary">
                                        {selectedClass.professor || 'Ing. Carlos Pérez'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/app/aula-virtual')}
                            className="apple-btn-primary w-full py-4 rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Ir al Aula Virtual de la Materia
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;