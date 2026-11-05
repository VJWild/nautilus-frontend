import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Book, CheckCircle, Plus, CheckSquare, Lock, X,
    GitBranch, ChevronDown, ChevronUp, Unlock, LogOut,
    Save, Loader2, Sparkles, Calendar, LayoutGrid,
    Layers, Clock, MapPin, Trash2
} from 'lucide-react';
import { dbMaterias, ROMANOS, DAYS } from '../../mocks/data';
import { usePensum } from '../../context/PensumContext';

const SCHEDULE_COLORS = ['emerald', 'sapphire', 'champagne', 'purple', 'amber'];
const MAX_UC_PER_SEMESTER = 21;

const Enrollment = () => {
    const {
        materiasAprobadas,
        materiasInscritas,
        setMateriasInscritas,
        ucAprobadas
    } = usePensum();

    const [mencionActual, setMencionActual] = useState('Ver Todo');
    const [filtroSemestre, setFiltroSemestre] = useState('Todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [modoVista, setModoVista] = useState('semestres');
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [isTrayOpen, setIsTrayOpen] = useState(false); // Controla el despliegue del Dock de Pre-Inscripción
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const verificarEstadoInscripcion = (materia) => {
        if (materiasAprobadas.has(materia.codigo)) return 'aprobada';
        if (materiasInscritas.find((m) => m.codigo === materia.codigo)) return 'inscrita';

        if (materia.tipo === 'Electiva') {
            const electivaAprobada = Array.from(materiasAprobadas).some((codigo) => {
                const m = dbMaterias.find((mat) => mat.codigo === codigo);
                return m && m.tipo === 'Electiva' && m.semestre === materia.semestre;
            });
            const electivaInscrita = materiasInscritas.some(
                (m) => m.tipo === 'Electiva' && m.semestre === materia.semestre
            );
            if (electivaAprobada || electivaInscrita) return 'bloqueada-electiva';
        }

        if (!materia.prelacion) return 'disponible';
        const str = materia.prelacion.toUpperCase();
        if (str.includes('UC APROB') || str.includes('UC') || str.includes('50%')) {
            const ucReqMatch = str.match(/(\d+)\s*UC/);
            if (ucReqMatch && ucAprobadas < parseInt(ucReqMatch[1], 10)) return 'bloqueada';
            if (str.includes('50%') && ucAprobadas < 112) return 'bloqueada';
        }

        const codigosPrevios = str
            .replace(/\d+\s*UC.*/g, '')
            .replace(/50%.*/g, '')
            .split(/[/-]/);
        for (let req of codigosPrevios) {
            req = req.trim();
            if (req.match(/^[A-Z]{3}-\d{3}$/) && !materiasAprobadas.has(req)) return 'bloqueada';
        }
        return 'disponible';
    };

    const generarHorarioMock = () => {
        const dayIdx = Math.floor(Math.random() * 5);
        const startHour = 7 + Math.floor(Math.random() * 7);
        return {
            day: DAYS[dayIdx],
            dayIdx,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 2).toString().padStart(2, '0')}:00`,
            room: `Aula ${Math.floor(Math.random() * 12) + 1}`,
            color: SCHEDULE_COLORS[Math.floor(Math.random() * SCHEDULE_COLORS.length)],
            duration: 2,
            professor: 'Ing. Carlos Pérez'
        };
    };

    const handleToggleInscripcion = (materia) => {
        const isEnrolled = materiasInscritas.find((m) => m.codigo === materia.codigo);
        if (isEnrolled) {
            const nextList = materiasInscritas.filter((m) => m.codigo !== materia.codigo);
            setMateriasInscritas(nextList);
            if (nextList.length === 0) setIsTrayOpen(false);
            showToast(`${materia.nombre} retirada de tu selección`, 'info');
        } else {
            setMateriasInscritas([...materiasInscritas, { ...materia, ...generarHorarioMock() }]);
            showToast(`${materia.nombre} añadida a tu pre-inscripción`, 'success');
        }
        setSelectedMateria(null);
    };

    const handleSaveEnrollment = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsTrayOpen(false);
            showToast('¡Inscripción académica confirmada exitosamente!', 'success');
        }, 500);
    };

    const mencionesOpciones = [
        'Ver Todo',
        'Redes y Telecomunicaciones',
        'Gestión de Datos',
        'Seguridad Informática',
        'Automatización de Procesos'
    ];

    const materiasFiltradas = useMemo(() => {
        return dbMaterias.filter((m) => {
            const cumpleMencion =
                mencionActual === 'Ver Todo' ||
                m.mencion === 'Todas' ||
                m.mencion === mencionActual;
            const cumpleSemestre =
                filtroSemestre === 'Todos' ||
                m.semestre === parseInt(filtroSemestre, 10);

            if (!cumpleMencion || !cumpleSemestre) return false;

            if (filtroEstado === 'todos') return true;
            const estado = verificarEstadoInscripcion(m);
            if (filtroEstado === 'bloqueada') {
                return estado === 'bloqueada' || estado === 'bloqueada-electiva';
            }
            return estado === filtroEstado;
        });
    }, [mencionActual, filtroSemestre, filtroEstado, materiasAprobadas, materiasInscritas, ucAprobadas]);

    const stats = useMemo(() => {
        let disponibles = 0;
        let inscritas = materiasInscritas.length;
        let aprobadas = materiasAprobadas.size;

        dbMaterias.forEach((m) => {
            if (verificarEstadoInscripcion(m) === 'disponible') disponibles++;
        });

        return { disponibles, inscritas, aprobadas };
    }, [materiasAprobadas, materiasInscritas, ucAprobadas]);

    const totalUcInscritas = materiasInscritas.reduce((acc, curr) => acc + curr.uc, 0);
    const ucProgressPercent = Math.min(Math.round((totalUcInscritas / MAX_UC_PER_SEMESTER) * 100), 100);

    const renderSubjectCard = (materia) => {
        const estado = verificarEstadoInscripcion(materia);

        return (
            <div
                key={materia.codigo}
                onClick={() => setSelectedMateria(materia)}
                className={`p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group ${
                    estado === 'aprobada'
                        ? 'apple-card border-emerald-500/35 bg-emerald-500/5'
                        : estado === 'inscrita'
                            ? 'apple-card border-[#E7E2CE]/65 shadow-[0_0_25px_rgba(231,226,206,0.12)]'
                            : estado === 'disponible'
                                ? 'apple-card'
                                : 'glass-pill opacity-45 hover:opacity-70'
                }`}
            >
                <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                        estado === 'aprobada'
                            ? 'bg-emerald-400'
                            : estado === 'inscrita'
                                ? 'bg-[#E7E2CE]'
                                : estado === 'disponible'
                                    ? 'bg-[#3B507D]'
                                    : 'bg-transparent'
                    }`}
                />

                <div>
                    <div className="flex justify-between items-center gap-2 mb-3 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="glass-pill text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md theme-text-accent">
                                Sem {ROMANOS[materia.semestre - 1]}
                            </span>
                            <span className="glass-pill text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md theme-text-secondary">
                                {materia.uc} UC
                            </span>
                            {materia.tipo === 'Electiva' && (
                                <span className="glass-pill text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-300">
                                    Electiva
                                </span>
                            )}
                        </div>

                        {estado === 'aprobada' && (
                            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                        )}
                        {estado === 'inscrita' && (
                            <CheckSquare size={18} className="theme-text-accent shrink-0" />
                        )}
                        {(estado === 'bloqueada' || estado === 'bloqueada-electiva') && (
                            <Lock size={16} className="theme-text-secondary shrink-0" />
                        )}
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.18em] theme-text-secondary mb-1">
                        {materia.codigo}
                    </p>
                    <h4 className="text-base font-semibold theme-text-primary leading-snug mb-3">
                        {materia.nombre}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] theme-text-secondary font-normal pt-2 border-t border-current/10">
                        <span className="flex items-center gap-1.5 truncate">
                            <GitBranch size={13} className="theme-text-accent shrink-0" />
                            <span className="truncate">Req: {materia.prelacion || ' Libre'}</span>
                        </span>
                        {mencionActual === 'Ver Todo' && materia.mencion !== 'Todas' && (
                            <span className="text-[10px] theme-text-accent shrink-0 ml-2">
                                {materia.mencion.split(' ')[0]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-1">
                    {estado === 'aprobada' && (
                        <div className="w-full py-2.5 rounded-xl text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-1.5">
                            <CheckCircle size={14} /> Aprobada
                        </div>
                    )}

                    {estado === 'inscrita' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleInscripcion(materia);
                            }}
                            className="apple-btn-glass w-full py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 text-rose-300 border-rose-400/30 cursor-pointer"
                        >
                            <span>Retirar</span>
                            <LogOut size={14} />
                        </button>
                    )}

                    {estado === 'disponible' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleInscripcion(materia);
                            }}
                            className="apple-btn-primary w-full py-2.5 rounded-xl text-xs uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer"
                        >
                            <span>Pre-Inscribir</span>
                            <Plus size={15} />
                        </button>
                    )}

                    {(estado === 'bloqueada' || estado === 'bloqueada-electiva') && (
                        <div className="w-full py-2.5 rounded-xl text-xs glass-pill theme-text-secondary flex justify-center items-center gap-1.5">
                            <Lock size={13} /> Prelada
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col space-y-5 pb-28 relative">
            {toast && (
                <div className="fixed top-24 right-6 glass-panel px-5 py-3.5 rounded-2xl z-50 flex items-center gap-3 border-emerald-400/50 shadow-2xl">
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-xs theme-text-primary">{toast.message}</span>
                </div>
            )}

            {/* 1. Cabecera Principal */}
            <div className="glass-panel rounded-[2.25rem] p-6 md:px-8 md:py-7 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div>
                    <div className="inline-flex items-center gap-2 glass-pill px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] theme-text-accent mb-2">
                        <Sparkles size={12} />
                        <span>Planificador Curricular • UMC</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary tracking-tight">
                        Inscripción Académica
                    </h2>
                    <p className="text-xs sm:text-sm theme-text-secondary font-normal mt-0.5">
                        Explora la malla curricular, filtra asignaturas disponibles y arma tu horario.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:pr-1">
                    <button
                        type="button"
                        onClick={() => materiasInscritas.length > 0 && setIsTrayOpen(!isTrayOpen)}
                        className="glass-pill px-4 py-2.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-current/40 transition-all"
                    >
                        <div className="w-8 h-8 rounded-xl apple-card flex items-center justify-center theme-text-accent">
                            <Book size={15} />
                        </div>
                        <div className="text-left">
                            <span className="text-[10px] uppercase tracking-wider theme-text-secondary block">
                                Mi Selección
                            </span>
                            <span className="text-sm theme-text-primary">
                                {totalUcInscritas} UC • {materiasInscritas.length} Mat.
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={handleSaveEnrollment}
                        disabled={isSaving || materiasInscritas.length === 0}
                        className="apple-btn-primary px-5 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {isSaving ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Save size={15} />
                        )}
                        <span>{isSaving ? 'Guardando...' : 'Confirmar Inscripción'}</span>
                    </button>
                </div>
            </div>

            {/* 2. Dock de Filtros */}
            <div className="glass-panel rounded-[2rem] p-4 md:px-6 md:py-4 flex flex-col space-y-4">
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                    <div className="relative w-full xl:w-72 shrink-0">
                        <label className="text-[9px] uppercase tracking-[0.18em] theme-text-secondary block mb-1 pl-1">
                            Mención / Especialidad:
                        </label>
                        <div className="relative">
                            <select
                                value={mencionActual}
                                onChange={(e) => setMencionActual(e.target.value)}
                                className="nautilus-select w-full pl-4 pr-9 py-2.5 rounded-xl text-xs outline-none appearance-none cursor-pointer font-medium"
                            >
                                {mencionesOpciones.map((m) => (
                                    <option key={m} value={m} className="bg-[#112250] text-[#F5F4F0]">
                                        {m === 'Ver Todo' ? 'Pensum General (Todas)' : m}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={15}
                                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary pointer-events-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 xl:pr-1 shrink-0 pt-2 xl:pt-5">
                        <div className="glass-pill p-1 rounded-xl flex items-center gap-1">
                            {[
                                { id: 'todos', label: 'Todas' },
                                { id: 'disponible', label: `Disponibles (${stats.disponibles})` },
                                { id: 'inscrita', label: `Inscritas (${stats.inscritas})` },
                                { id: 'aprobada', label: 'Aprobadas' }
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => setFiltroEstado(st.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        filtroEstado === st.id
                                            ? 'apple-btn-primary shadow-sm'
                                            : 'theme-text-secondary hover:theme-text-primary'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-36 shrink-0">
                            <select
                                value={filtroSemestre}
                                onChange={(e) => setFiltroSemestre(e.target.value)}
                                className="nautilus-select w-full pl-3.5 pr-8 py-2 rounded-xl text-xs outline-none appearance-none cursor-pointer font-medium"
                            >
                                <option value="Todos" className="bg-[#112250] text-[#F5F4F0]">
                                    Sem: Todos
                                </option>
                                {ROMANOS.map((r, i) => (
                                    <option key={r} value={i + 1} className="bg-[#112250] text-[#F5F4F0]">
                                        Semestre {r}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-text-secondary pointer-events-none"
                            />
                        </div>

                        <div className="glass-pill p-1 rounded-xl flex items-center gap-1">
                            <button
                                onClick={() => setModoVista('semestres')}
                                title="Vista por Bloques de Semestre"
                                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                                    modoVista === 'semestres' ? 'apple-btn-primary' : 'theme-text-secondary'
                                }`}
                            >
                                <Layers size={15} />
                            </button>
                            <button
                                onClick={() => setModoVista('malla')}
                                title="Vista Malla Continua"
                                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                                    modoVista === 'malla' ? 'apple-btn-primary' : 'theme-text-secondary'
                                }`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cinta Interactiva de Semestres */}
                <div className="flex items-center gap-2 pt-3 border-t border-current/10 overflow-x-auto custom-scrollbar">
                    <span className="text-[10px] uppercase tracking-[0.2em] theme-text-secondary shrink-0 mr-1">
                        Semestre:
                    </span>
                    <button
                        onClick={() => setFiltroSemestre('Todos')}
                        className={`px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                            filtroSemestre === 'Todos' ? 'apple-btn-primary' : 'glass-pill theme-text-secondary'
                        }`}
                    >
                        Todos
                    </button>
                    {ROMANOS.map((rom, i) => {
                        const num = (i + 1).toString();
                        const active = filtroSemestre === num;
                        return (
                            <button
                                key={rom}
                                onClick={() => setFiltroSemestre(active ? 'Todos' : num)}
                                className={`w-9 py-1 rounded-lg text-xs cursor-pointer transition-all shrink-0 text-center ${
                                    active
                                        ? 'apple-btn-primary'
                                        : 'glass-pill theme-text-secondary hover:theme-text-primary'
                                }`}
                            >
                                {rom}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Despliegue de Asignaturas */}
            {materiasFiltradas.length === 0 ? (
                <div className="glass-panel rounded-[2rem] p-12 text-center space-y-3">
                    <p className="text-base theme-text-primary">
                        No se encontraron asignaturas con los filtros seleccionados.
                    </p>
                    <button
                        onClick={() => {
                            setFiltroSemestre('Todos');
                            setFiltroEstado('todos');
                            setMencionActual('Ver Todo');
                        }}
                        className="apple-btn-glass px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Restablecer Filtros
                    </button>
                </div>
            ) : modoVista === 'malla' ? (
                <div className="glass-panel rounded-[2.25rem] p-5 md:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materiasFiltradas.map((materia) => renderSubjectCard(materia))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {ROMANOS.map((rom, index) => {
                        const numSemestre = index + 1;
                        const materiasSemestre = materiasFiltradas.filter(
                            (m) => m.semestre === numSemestre
                        );
                        if (materiasSemestre.length === 0) return null;

                        const ucSemestre = materiasSemestre.reduce((acc, m) => acc + m.uc, 0);

                        return (
                            <div
                                key={rom}
                                className="glass-panel rounded-[2.25rem] p-5 md:p-7 space-y-5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-current/10 pb-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl apple-card flex items-center justify-center text-sm theme-text-accent">
                                            {rom}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold uppercase tracking-[0.16em] theme-text-primary">
                                                Semestre {rom}
                                            </h3>
                                            <p className="text-[11px] theme-text-secondary font-normal">
                                                {materiasSemestre.length} asignaturas • {ucSemestre} Unidades de Crédito
                                            </p>
                                        </div>
                                    </div>

                                    {filtroSemestre === 'Todos' && (
                                        <button
                                            onClick={() => setFiltroSemestre(numSemestre.toString())}
                                            className="apple-btn-glass px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider cursor-pointer"
                                        >
                                            Enfocar Semestre
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {materiasSemestre.map((materia) => renderSubjectCard(materia))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 4. DOCK ACADÉMICO EXPANDIBLE DE PRE-INSCRIPCIÓN */}
            {materiasInscritas.length > 0 && (
                <>
                    {/* Fondo difuminado cuando la bandeja está expandida */}
                    {isTrayOpen && (
                        <div
                            className="fixed inset-0 bg-[#112250]/60 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsTrayOpen(false)}
                        />
                    )}

                    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl z-50">
                        <div className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl border border-[#E7E2CE]/40 transition-all duration-500">
                            {/* Panel Expandible con el Detalle de Materias Pre-Inscritas */}
                            {isTrayOpen && (
                                <div className="p-6 border-b border-current/10 space-y-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] theme-text-accent block">
                                                Resumen de Pre-Inscripción
                                            </span>
                                            <h4 className="text-lg font-semibold theme-text-primary">
                                                Asignaturas Seleccionadas ({materiasInscritas.length})
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setMateriasInscritas([]);
                                                    setIsTrayOpen(false);
                                                    showToast('Selección vaciada', 'info');
                                                }}
                                                className="apple-btn-glass px-3.5 py-2 rounded-xl text-xs text-rose-300 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                                <span>Vaciar</span>
                                            </button>
                                            <button
                                                onClick={() => setIsTrayOpen(false)}
                                                className="apple-btn-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tarjetas de Materias dentro del Dock */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {materiasInscritas.map((m) => (
                                            <div
                                                key={m.codigo}
                                                className="apple-card p-4 rounded-2xl flex items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="glass-pill text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md theme-text-accent">
                                                            {m.codigo}
                                                        </span>
                                                        <span className="text-[11px] theme-text-secondary">
                                                            {m.uc} UC • Sem {ROMANOS[m.semestre - 1]}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold theme-text-primary truncate">
                                                        {m.nombre}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-[11px] theme-text-secondary font-normal">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={11} className="theme-text-accent" />
                                                            {m.day?.slice(0, 3)} {m.startTime}-{m.endTime}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={11} className="theme-text-accent" />
                                                            {m.room || 'Aula 1'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleToggleInscripcion(m)}
                                                    title="Retirar asignatura"
                                                    className="apple-btn-glass w-9 h-9 rounded-xl flex items-center justify-center text-rose-300 shrink-0 cursor-pointer"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Barra Principal del Dock (Siempre Visible cuando hay materias) */}
                            <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Indicador de Créditos y Botón Desplegable */}
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                    <button
                                        onClick={() => setIsTrayOpen(!isTrayOpen)}
                                        className="apple-btn-glass px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs cursor-pointer"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-emerald-400 text-[#112250] font-bold text-[11px] flex items-center justify-center">
                                            {materiasInscritas.length}
                                        </span>
                                        <span className="font-semibold theme-text-primary">
                                            {isTrayOpen ? 'Ocultar Selección' : 'Ver Materias a Inscribir'}
                                        </span>
                                        {isTrayOpen ? (
                                            <ChevronDown size={15} className="theme-text-accent" />
                                        ) : (
                                            <ChevronUp size={15} className="theme-text-accent" />
                                        )}
                                    </button>

                                    {/* Medidor Visual de Unidades de Crédito */}
                                    <div className="hidden md:flex flex-col gap-1 min-w-[160px]">
                                        <div className="flex justify-between text-[10px] uppercase tracking-wider">
                                            <span className="theme-text-secondary">Carga Académica</span>
                                            <span className="theme-text-accent">
                                                {totalUcInscritas} / {MAX_UC_PER_SEMESTER} UC
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full glass-pill overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#3B507D] to-emerald-400 transition-all duration-500"
                                                style={{ width: `${ucProgressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones Directas del Dock */}
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                    <Link
                                        to="/app/horario"
                                        className="apple-btn-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Calendar size={14} className="theme-text-accent" />
                                        <span>Simular Horario</span>
                                    </Link>
                                    <button
                                        onClick={handleSaveEnrollment}
                                        disabled={isSaving}
                                        className="apple-btn-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                                    >
                                        <Save size={14} />
                                        <span>Confirmar ({totalUcInscritas} UC)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Detalle de Asignatura */}
            {selectedMateria && (() => {
                const estadoModal = verificarEstadoInscripcion(selectedMateria);
                return (
                    <div
                        className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMateria(null)}
                    >
                        <div
                            className="glass-panel rounded-[2.25rem] w-full max-w-md p-7 space-y-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedMateria(null)}
                                className="apple-btn-glass absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                            >
                                <X size={17} />
                            </button>

                            <div className="space-y-2 pr-8">
                                <span className="glass-pill text-[10px] uppercase tracking-widest px-3 py-1 rounded-full theme-text-accent inline-block">
                                    {selectedMateria.codigo}
                                </span>
                                <h3 className="text-2xl font-semibold theme-text-primary leading-tight">
                                    {selectedMateria.nombre}
                                </h3>
                                <div className="flex gap-2 pt-1 text-xs theme-text-secondary">
                                    <span className="glass-pill px-3 py-1 rounded-lg">
                                        Semestre {ROMANOS[selectedMateria.semestre - 1]}
                                    </span>
                                    <span className="glass-pill px-3 py-1 rounded-lg">
                                        {selectedMateria.uc} Unidades de Crédito
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-[0.18em] theme-text-secondary">
                                    Requisitos (Prelaciones)
                                </p>
                                {!selectedMateria.prelacion ? (
                                    <div className="glass-pill p-3.5 rounded-xl text-xs theme-text-primary flex items-center gap-2">
                                        <Unlock size={15} className="text-emerald-400" />
                                        <span>Sin requisitos previos</span>
                                    </div>
                                ) : (
                                    <div className="glass-pill p-3.5 rounded-xl text-xs theme-text-primary flex items-center gap-2">
                                        <GitBranch size={15} className="theme-text-accent" />
                                        <span>{selectedMateria.prelacion}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                {estadoModal === 'aprobada' && (
                                    <div className="w-full py-3.5 rounded-2xl text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-2">
                                        <CheckCircle size={17} /> Asignatura ya aprobada
                                    </div>
                                )}

                                {estadoModal === 'inscrita' && (
                                    <button
                                        onClick={() => handleToggleInscripcion(selectedMateria)}
                                        className="apple-btn-glass w-full py-3.5 rounded-2xl text-xs uppercase tracking-wider text-rose-300 border-rose-400/30 flex justify-center items-center gap-2 cursor-pointer"
                                    >
                                        <LogOut size={16} /> Retirar Asignatura
                                    </button>
                                )}

                                {estadoModal === 'disponible' && (
                                    <button
                                        onClick={() => handleToggleInscripcion(selectedMateria)}
                                        className="apple-btn-primary w-full py-3.5 rounded-2xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
                                    >
                                        <span>Pre-Inscribir Asignatura</span>
                                        <Plus size={16} />
                                    </button>
                                )}

                                {estadoModal === 'bloqueada' && (
                                    <p className="text-center text-xs text-rose-300">
                                        No cumples con las prelaciones o Unidades de Crédito requeridas.
                                    </p>
                                )}

                                {estadoModal === 'bloqueada-electiva' && (
                                    <p className="text-center text-xs text-amber-300">
                                        Ya tienes una electiva aprobada o pre-inscrita en este semestre.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                .nautilus-select {
                    background: var(--glass-card-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
};

export default Enrollment;