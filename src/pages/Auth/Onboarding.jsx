import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Anchor, ChevronRight, GraduationCap, CheckCircle,
    Plus, CheckCircle2, User, Book, ChevronDown, ChevronUp,
    Lock, Phone, Calendar, Loader2, Sun, Moon, ArrowLeft
} from 'lucide-react';
import { dbMaterias, ROMANOS, CAREERS, SPECIALIZATIONS } from '../../mocks/data';

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

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [approvedSubjects, setApprovedSubjects] = useState(new Set());
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

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

    const studentCode = sessionStorage.getItem('pending_student_code') || 'INGINF-26327337';

    // Detectar carrera por prefijo del código (ej: INGINF)
    const detectedCareer = useMemo(() => {
        const prefix = studentCode.split('-')[0].toUpperCase();
        return CAREERS.find((c) => c.code === prefix) || CAREERS[0];
    }, [studentCode]);

    const [onboardingData, setOnboardingData] = useState({
        fullName: '',
        age: '',
        birthDate: '',
        phone: '',
        careerId: detectedCareer.id,
        mencionId: SPECIALIZATIONS[0].id,
        mencionName: SPECIALIZATIONS[0].name
    });

    const handleInputChange = (e) => {
        setOnboardingData({ ...onboardingData, [e.target.name]: e.target.value });
    };

    const handleMencionChange = (e) => {
        const selectedId = parseInt(e.target.value, 10);
        const selectedSpec = SPECIALIZATIONS.find((s) => s.id === selectedId);
        setOnboardingData({
            ...onboardingData,
            mencionId: selectedId,
            mencionName: selectedSpec?.name || SPECIALIZATIONS[0].name
        });
    };

    // Filtrar asignaturas según la mención elegida
    const subjectsForMencion = useMemo(() => {
        return dbMaterias.filter(
            (m) => m.mencion === 'Todas' || m.mencion === onboardingData.mencionName
        );
    }, [onboardingData.mencionName]);

    // Agrupar asignaturas por semestre
    const groupedSubjects = useMemo(() => {
        const groups = {};
        subjectsForMencion.forEach((m) => {
            if (!groups[m.semestre]) groups[m.semestre] = [];
            groups[m.semestre].push(m);
        });
        return groups;
    }, [subjectsForMencion]);

    // Bloquear electivas adicionales si ya se seleccionó una en el mismo semestre
    const isElectiveDisabled = (subject, currentApprovedSet) => {
        if (subject.tipo !== 'Electiva') return false;
        if (currentApprovedSet.has(subject.codigo)) return false;

        return subjectsForMencion
            .filter((s) => s.semestre === subject.semestre && s.tipo === 'Electiva')
            .some((s) => currentApprovedSet.has(s.codigo));
    };

    const toggleSemesterCollapse = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

    const handleFinalize = () => {
        setIsFinalizing(true);

        setTimeout(() => {
            const profileData = {
                code: studentCode,
                name: onboardingData.fullName,
                age: onboardingData.age,
                birthDate: onboardingData.birthDate,
                phone: onboardingData.phone,
                career: detectedCareer.name,
                mencion: onboardingData.mencionName,
                role: 'cadete'
            };

            sessionStorage.setItem('nautilus_user', JSON.stringify(profileData));
            localStorage.setItem(
                'nautilus_approved_subjects',
                JSON.stringify(Array.from(approvedSubjects))
            );
            sessionStorage.removeItem('pending_student_code');

            setIsFinalizing(false);
            navigate('/app');
        }, 500);
    };

    return (
        <div className="min-h-screen w-full bg-atmosphere flex flex-col justify-between p-6 md:p-10 relative overflow-hidden select-none">

            {/* Barra Superior */}
            <header className="relative z-30 w-full max-w-5xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/auth')}
                    className="apple-btn-glass px-4 py-2.5 rounded-full flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="glass-pill px-4 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase theme-text-secondary">
                        Paso {step} de 3
                    </span>

                    <button
                        onClick={toggleTheme}
                        className="apple-btn-glass px-4 py-2.5 rounded-full flex items-center gap-2.5 text-xs tracking-wider cursor-pointer"
                        aria-label="Cambiar tema"
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun size={15} className="text-[#E7E2CE]" />
                                <span className="hidden sm:inline">Modo Claro</span>
                            </>
                        ) : (
                            <>
                                <Moon size={15} className="text-[#112250]" />
                                <span className="hidden sm:inline">Modo Oscuro</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Contenedor Principal Glassmorphic */}
            <main className="relative z-10 my-auto w-full max-w-[1040px] mx-auto py-4">
                <div className="w-full min-h-[620px] md:h-[610px] glass-panel rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative">

                    {/* Panel Lateral Izquierdo */}
                    <div className="md:w-1/3 nautilus-side-panel p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
                        <div className="space-y-4 relative z-10">
                            <div className="glass-pill px-3.5 py-1.5 rounded-full w-fit flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-current theme-text-accent" />
                                <span className="text-[10px] tracking-[0.2em] uppercase theme-text-secondary">
                                    Nautilus • Registro
                                </span>
                            </div>

                            <h2 className="text-3xl font-semibold leading-tight theme-text-primary pt-2">
                                Configura tu Perfil
                            </h2>

                            <p className="theme-text-secondary text-sm font-normal leading-relaxed">
                                {step === 1 && 'Completa tus datos personales para aperturar tu expediente estudiantil.'}
                                {step === 2 && 'Verifica tu carrera y selecciona tu mención de especialidad.'}
                                {step === 3 && 'Marca las asignaturas que ya has aprobado en tu pensum.'}
                            </p>
                        </div>

                        {/* Indicador de Pasos */}
                        <div className="space-y-4 my-8 relative z-10">
                            {[
                                { label: 'DATOS PERSONALES', icon: User },
                                { label: 'ESPECIALIDAD', icon: GraduationCap },
                                { label: 'RÉCORD DE NOTAS', icon: Book }
                            ].map((item, i) => {
                                const currentStep = i + 1;
                                const isActive = step === currentStep;
                                const isCompleted = step > currentStep;

                                return (
                                    <div
                                        key={item.label}
                                        className={`flex items-center gap-3.5 text-xs tracking-wider transition-all ${
                                            step >= currentStep ? 'theme-text-primary opacity-100' : 'theme-text-secondary opacity-40'
                                        }`}
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                isCompleted
                                                    ? 'apple-btn-primary'
                                                    : isActive
                                                        ? 'apple-card theme-text-accent'
                                                        : 'glass-pill'
                                            }`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={16} /> : <item.icon size={16} />}
                                        </div>
                                        <span className="text-[11px] tracking-[0.14em]">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-[10px] theme-text-secondary opacity-60 uppercase tracking-[0.2em] relative z-10">
                            ID: {studentCode}
                        </p>

                        <Anchor size={240} className="absolute -bottom-16 -right-16 theme-text-primary opacity-5 rotate-12 pointer-events-none" />
                    </div>

                    {/* Panel Derecho de Contenido */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">

                        {/* PASO 1: DATOS PERSONALES */}
                        {step === 1 && (
                            <div className="my-auto max-w-md mx-auto w-full space-y-2">
                                <div className="mb-6">
                                    <p className="text-[11px] uppercase tracking-[0.22em] theme-text-secondary mb-1">
                                        Paso 1 • Ficha Estudiantil
                                    </p>
                                    <h3 className="text-3xl font-semibold theme-text-primary tracking-tight">
                                        Información Personal
                                    </h3>
                                </div>

                                <FloatingInput
                                    label="Nombre Completo"
                                    name="fullName"
                                    icon={User}
                                    value={onboardingData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FloatingInput
                                        label="Edad"
                                        name="age"
                                        type="number"
                                        icon={User}
                                        value={onboardingData.age}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <FloatingInput
                                        label="Fecha de Nacimiento"
                                        name="birthDate"
                                        type="date"
                                        icon={Calendar}
                                        value={onboardingData.birthDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <FloatingInput
                                    label="Teléfono Móvil"
                                    name="phone"
                                    type="tel"
                                    icon={Phone}
                                    value={onboardingData.phone}
                                    onChange={handleInputChange}
                                    required
                                />

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!onboardingData.fullName || !onboardingData.age || !onboardingData.phone || !onboardingData.birthDate}
                                        className="apple-btn-primary w-full py-4 rounded-2xl text-sm font-semibold uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <span>Siguiente Paso</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PASO 2: ESPECIALIZACIÓN */}
                        {step === 2 && (
                            <div className="my-auto max-w-md mx-auto w-full space-y-6">
                                <div className="flex justify-center">
                                    <div className="apple-card w-16 h-16 rounded-2xl flex items-center justify-center">
                                        <GraduationCap size={32} className="theme-text-accent" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-[11px] uppercase tracking-[0.22em] theme-text-secondary mb-1">
                                        Paso 2 • Plan de Estudios
                                    </p>
                                    <h3 className="text-3xl font-semibold theme-text-primary tracking-tight">
                                        Especialización
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-[0.18em] mb-2 ml-2 block">
                                            Carrera Detectada
                                        </label>
                                        <div className="nautilus-input w-full px-4 py-4 rounded-2xl flex items-center justify-between opacity-80">
                                            <span className="text-sm">{detectedCareer.name}</span>
                                            <Lock size={16} className="theme-text-secondary" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-[0.18em] mb-2 ml-2 block">
                                            Mención de Especialidad
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="mencionId"
                                                value={onboardingData.mencionId}
                                                onChange={handleMencionChange}
                                                className="nautilus-input w-full px-4 py-4 rounded-2xl outline-none appearance-none cursor-pointer text-sm"
                                            >
                                                {SPECIALIZATIONS.map((s) => (
                                                    <option key={s.id} value={s.id} className="bg-[#112250] text-[#F5F4F0]">
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 theme-text-secondary pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="apple-btn-glass px-6 py-4 rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        Regresar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="apple-btn-primary flex-1 py-4 rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Registrar Pensum</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: REGISTRO DE NOTAS */}
                        {step === 3 && (
                            <div className="flex flex-col h-full min-h-0">
                                <div className="mb-5 flex justify-between items-end shrink-0">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] theme-text-secondary mb-1">
                                            Paso 3 • Avance Académico
                                        </p>
                                        <h3 className="text-2xl font-semibold theme-text-primary tracking-tight">
                                            Materias Aprobadas
                                        </h3>
                                    </div>

                                    <div className="glass-pill px-4 py-2 rounded-2xl text-right">
                                        <span className="block text-[10px] theme-text-secondary uppercase tracking-wider">
                                            Seleccionadas
                                        </span>
                                        <span className="text-xl theme-text-primary">{approvedSubjects.size}</span>
                                    </div>
                                </div>

                                {/* Lista de Semestres */}
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 min-h-0">
                                    {Object.entries(groupedSubjects).map(([sem, subjects]) => {
                                        const numSem = parseInt(sem, 10);
                                        const isCollapsed = collapsedSemesters.has(numSem);
                                        const allSelected = subjects.every((m) => approvedSubjects.has(m.codigo));

                                        return (
                                            <div key={sem} className="glass-pill p-4 rounded-2xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSemesterCollapse(numSem)}
                                                        className="flex items-center gap-2.5 cursor-pointer"
                                                    >
                                                        <div className="w-7 h-7 rounded-lg apple-card flex items-center justify-center theme-text-accent">
                                                            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                        </div>
                                                        <h4 className="text-xs uppercase tracking-[0.18em] theme-text-primary">
                                                            Semestre {ROMANOS[numSem - 1] || numSem}
                                                        </h4>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setApprovedSubjects((prev) => {
                                                                const next = new Set(prev);
                                                                if (allSelected) {
                                                                    subjects.forEach((m) => next.delete(m.codigo));
                                                                } else {
                                                                    subjects.forEach((m) => {
                                                                        if (!isElectiveDisabled(m, next)) next.add(m.codigo);
                                                                    });
                                                                }
                                                                return next;
                                                            });
                                                        }}
                                                        className="apple-btn-glass text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer"
                                                    >
                                                        {allSelected ? 'Desmarcar Todo' : 'Marcar Todo'}
                                                    </button>
                                                </div>

                                                {!isCollapsed && (
                                                    <div className="grid grid-cols-1 gap-2 pt-1">
                                                        {subjects.map((m) => {
                                                            const isSelected = approvedSubjects.has(m.codigo);
                                                            const isBlocked = isElectiveDisabled(m, approvedSubjects);

                                                            return (
                                                                <div
                                                                    key={m.codigo}
                                                                    onClick={() => {
                                                                        if (isBlocked) return;
                                                                        setApprovedSubjects((prev) => {
                                                                            const n = new Set(prev);
                                                                            if (n.has(m.codigo)) n.delete(m.codigo);
                                                                            else n.add(m.codigo);
                                                                            return n;
                                                                        });
                                                                    }}
                                                                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                                                        isSelected
                                                                            ? 'nautilus-subject-selected'
                                                                            : isBlocked
                                                                                ? 'opacity-40 cursor-not-allowed border-current/10'
                                                                                : 'apple-card'
                                                                    }`}
                                                                >
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className="text-[10px] theme-text-secondary uppercase tracking-wider">
                                                                                {m.codigo} • {m.uc} UC
                                                                            </span>
                                                                            {m.tipo === 'Electiva' && (
                                                                                <span className="glass-pill text-[9px] theme-text-accent px-2 py-0.5 rounded uppercase">
                                                                                    Electiva
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm theme-text-primary">{m.nombre}</p>
                                                                    </div>

                                                                    <div
                                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                                            isSelected
                                                                                ? 'apple-btn-primary'
                                                                                : 'glass-pill theme-text-secondary'
                                                                        }`}
                                                                    >
                                                                        {isSelected ? (
                                                                            <CheckCircle size={17} />
                                                                        ) : isBlocked ? (
                                                                            <Lock size={15} />
                                                                        ) : (
                                                                            <Plus size={17} />
                                                                        )}
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

                                {/* Botones Finales */}
                                <div className="pt-5 flex gap-3 border-t border-current/10 mt-4 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="apple-btn-glass px-6 py-4 rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        Regresar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFinalize}
                                        disabled={isFinalizing}
                                        className="apple-btn-primary flex-1 py-4 rounded-2xl text-sm uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
                                    >
                                        {isFinalizing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} /> Guardando...
                                            </>
                                        ) : (
                                            <span>Completar Registro</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </main>

            {/* Footer Institucional */}
            <footer className="relative z-10 text-center">
                <p className="text-[10px] theme-text-secondary opacity-70 font-semibold tracking-[0.2em] uppercase">
                    © 2026 Universidad Nacional Experimental Marítima del Caribe
                </p>
            </footer>

            {/* Estilos adaptables al Modo Claro / Oscuro */}
            <style>{`
                .nautilus-side-panel {
                    background: rgba(17, 34, 80, 0.55);
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
                .nautilus-subject-selected {
                    background: rgba(59, 80, 125, 0.48);
                    border-color: #E7E2CE;
                }
                [data-theme="light"] .nautilus-subject-selected {
                    background: rgba(231, 226, 206, 0.85);
                    border-color: #112250;
                }
            `}</style>
        </div>
    );
};

export default Onboarding;