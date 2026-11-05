import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Book, MapPin, FileText, UploadCloud,
    ArrowLeft, Users, Clock, Link2, PlaySquare,
    AlertCircle, ChevronRight, GraduationCap, Download, CheckCircle2,
    Lock, Mail, Calendar, BookOpen, MoreVertical, FileBarChart, Loader2
} from 'lucide-react';
import { usePensum } from '../../context/PensumContext';

const MOCK_CLASSMATES = [
    { name: 'Ana Martínez', code: '28111222' },
    { name: 'Luis Gómez', code: '27333444' },
    { name: 'Sofía Castro', code: '29555666' },
    { name: 'Diego Rojas', code: '26888999' },
    { name: 'Camila Fernández', code: '27999000' },
    { name: 'Javier Mendoza', code: '28444555' }
];

const MOCK_MATERIALS = [
    { id: 1, type: 'pdf', title: 'Plan de Evaluación Oficial 2026', date: '12 Feb', size: '2.4 MB' },
    { id: 2, type: 'link', title: 'Repositorio de Prácticas (GitHub)', date: '15 Feb', size: 'Enlace web' },
    { id: 3, type: 'video', title: 'Clase Grabada: Introducción a la Materia', date: '20 Feb', size: '45 mins' },
    { id: 4, type: 'pdf', title: 'Guía Práctica N° 1', date: '25 Feb', size: '1.1 MB' }
];

const generateMockEvaluations = (isFinished) => {
    if (isFinished) {
        return [
            { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', percentage: 15, maxScore: 20, status: 'graded', score: 18, submission: { type: 'file', name: 'Practica1_VG.pdf' } },
            { id: 2, title: 'Taller Práctico', dueDate: '05 Mar 2026', percentage: 10, maxScore: 20, status: 'graded', score: 19, submission: { type: 'file', name: 'Taller1_VG.pdf' } },
            { id: 3, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', percentage: 25, maxScore: 20, status: 'graded', score: 16, submission: { type: 'link', name: 'https://github.com/vjwild/proyecto' } },
            { id: 4, title: 'Defensa de Proyecto', dueDate: '22 May 2026', percentage: 20, maxScore: 20, status: 'graded', score: 18, submission: { type: 'file', name: 'Defensa_VG.pdf' } },
            { id: 5, title: 'Examen Final', dueDate: '10 Jul 2026', percentage: 30, maxScore: 20, status: 'graded', score: 19, submission: { type: 'file', name: 'Examen_Resuelto.pdf' } }
        ];
    }
    return [
        { id: 1, title: 'Práctica 1: Fundamentos', dueDate: '25 Feb 2026', percentage: 15, maxScore: 20, status: 'graded', score: 18, submission: { type: 'file', name: 'Practica1_VG.pdf' } },
        { id: 2, title: 'Taller Práctico', dueDate: '05 Mar 2026', percentage: 10, maxScore: 20, status: 'graded', score: 19, submission: { type: 'file', name: 'Taller1_VG.pdf' } },
        { id: 3, title: 'Proyecto Parcial', dueDate: '15 Mar 2026', percentage: 25, maxScore: 20, status: 'pending' },
        { id: 4, title: 'Defensa de Proyecto', dueDate: '22 May 2026', percentage: 20, maxScore: 20, status: 'locked' },
        { id: 5, title: 'Examen Final', dueDate: '10 Jul 2026', percentage: 30, maxScore: 20, status: 'locked' }
    ];
};

const Classroom = () => {
    const { materiasInscritas } = usePensum();

    const [activeClass, setActiveClass] = useState(null);
    const [activeTab, setActiveTab] = useState('muro');
    const [activeSubmission, setActiveSubmission] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [evaluationsState, setEvaluationsState] = useState([]);

    useEffect(() => {
        if (activeClass && materiasInscritas && materiasInscritas.length > 0) {
            const isFinished = activeClass.codigo === materiasInscritas[0]?.codigo;
            setEvaluationsState(generateMockEvaluations(isFinished));
            setActiveTab('muro');
            setActiveSubmission(null);
        }
    }, [activeClass, materiasInscritas]);

    const handleConfirmUpload = (evalId) => {
        setUploadingId(evalId);

        setTimeout(() => {
            const submissionData = {
                type: activeSubmission.type,
                name: activeSubmission.type === 'file'
                    ? 'Documento_Adjunto.pdf'
                    : activeSubmission.value || 'Enlace adjunto'
            };

            setEvaluationsState((prev) =>
                prev.map((ev) =>
                    ev.id === evalId ? { ...ev, status: 'submitted', submission: submissionData } : ev
                )
            );

            setUploadingId(null);
            setActiveSubmission(null);
        }, 1500);
    };

    const totalPercentage = evaluationsState.reduce((acc, curr) => acc + (curr.percentage || 0), 0);

    const isCourseFinished =
        evaluationsState.length > 0 && evaluationsState.every((e) => e.status === 'graded');

    // Cálculo de nota definitiva ponderada según el % de cada evaluación
    const finalScore = isCourseFinished
        ? Math.round(
            evaluationsState.reduce(
                (acc, curr) => acc + curr.score * ((curr.percentage || 0) / 100),
                0
            )
        )
        : null;

    // --- VISTA PRINCIPAL: LISTA DE AULAS ---
    if (!activeClass) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col space-y-6 pb-10">
                <div className="glass-panel rounded-[2.25rem] p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary tracking-tight">
                        Mis Aulas Virtuales
                    </h2>
                    <p className="text-xs sm:text-sm theme-text-secondary font-normal mt-1">
                        Gestiona tu aprendizaje, evaluaciones y material de estudio.
                    </p>
                </div>

                {!materiasInscritas || materiasInscritas.length === 0 ? (
                    <div className="glass-panel rounded-[2.25rem] p-12 flex flex-col items-center justify-center min-h-[360px] text-center">
                        <BookOpen size={56} className="theme-text-secondary opacity-40 mb-4" />
                        <p className="theme-text-primary font-semibold text-lg">
                            No tienes aulas habilitadas.
                        </p>
                        <p className="theme-text-secondary text-xs font-normal mt-1">
                            Aparecerán aquí una vez que completes tu inscripción académica.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {materiasInscritas.map((m, idx) => (
                            <div
                                key={m.codigo || m.code}
                                onClick={() => setActiveClass(m)}
                                className="apple-card rounded-[2rem] p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E7E2CE]" />

                                <div className="pb-5 border-b border-current/10">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="glass-pill text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md theme-text-accent">
                                            {m.codigo || m.code}
                                        </span>
                                        {idx % 2 === 0 && (
                                            <span className="glass-pill text-amber-300 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1">
                                                <AlertCircle size={12} /> Pendiente
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold theme-text-primary text-lg leading-snug mt-3">
                                        {m.nombre || m.name}
                                    </h3>
                                </div>

                                <div className="pt-5 flex-1 flex flex-col justify-between space-y-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.codigo || m.code}&backgroundColor=e2e8f0`}
                                                alt="Profesor"
                                                className="w-10 h-10 rounded-full border border-current/20"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold theme-text-primary">
                                                    Ing. Carlos Pérez
                                                </p>
                                                <p className="text-[10px] theme-text-secondary uppercase tracking-widest font-normal">
                                                    Profesor Asignado
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="glass-pill flex items-center gap-1.5 text-xs theme-text-secondary px-3 py-1.5 rounded-xl font-normal">
                                                <MapPin size={13} className="text-emerald-400" />
                                                <span>Sec: 01</span>
                                            </div>
                                            <div className="glass-pill flex items-center gap-1.5 text-xs theme-text-secondary px-3 py-1.5 rounded-xl font-normal">
                                                <Clock size={13} className="theme-text-accent" />
                                                <span>{m.day || 'Lun'} • {m.startTime || '08:00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="apple-btn-glass w-full py-3 rounded-xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 group-hover:apple-btn-primary transition-all cursor-pointer">
                                        <span>Ingresar al Aula</span>
                                        <ChevronRight
                                            size={15}
                                            className="group-hover:translate-x-1 transition-transform"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- VISTA DETALLE DEL AULA ---
    return (
        <div className="max-w-6xl mx-auto flex flex-col space-y-6 pb-10">
            {/* 1. Header del Aula */}
            <div className="glass-panel rounded-[2.25rem] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <BookOpen size={180} className="transform rotate-12 -translate-y-6 translate-x-6" />
                </div>

                <div className="relative z-10 space-y-2">
                    <button
                        onClick={() => setActiveClass(null)}
                        className="apple-btn-glass px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[11px] uppercase tracking-widest mb-2 cursor-pointer w-fit"
                    >
                        <ArrowLeft size={14} />
                        <span>Volver al Panel</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <span className="glass-pill text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md theme-text-accent">
                            {activeClass.codigo || activeClass.code}
                        </span>
                        <span className="glass-pill text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md theme-text-secondary flex items-center gap-1">
                            <Users size={12} /> Sección 01
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary leading-tight tracking-tight pt-1">
                        {activeClass.nombre || activeClass.name}
                    </h2>
                </div>

                {isCourseFinished && (
                    <div className="relative z-10 apple-card border-emerald-400/40 bg-emerald-500/10 p-5 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-400 text-[#112250] rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-400">
                                Materia Aprobada
                            </p>
                            <p className="text-3xl font-semibold theme-text-primary leading-none mt-0.5">
                                {finalScore}{' '}
                                <span className="text-sm font-normal theme-text-secondary">/ 20</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* 2. Barra Lateral Interna + Información General */}
                <div className="lg:w-64 shrink-0 flex flex-col gap-5">
                    <nav className="glass-panel rounded-[2rem] p-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto custom-scrollbar">
                        {[
                            { id: 'muro', icon: Book, label: 'Inicio' },
                            { id: 'material', icon: FileBarChart, label: 'Material de Apoyo' },
                            { id: 'evaluaciones', icon: UploadCloud, label: 'Evaluaciones' },
                            { id: 'personas', icon: Users, label: 'Estudiantes' }
                        ].map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        active
                                            ? 'apple-btn-primary'
                                            : 'theme-text-secondary hover:theme-text-primary'
                                    }`}
                                >
                                    <tab.icon size={17} className={active ? '' : 'theme-text-accent'} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="glass-panel rounded-[2rem] p-5 hidden lg:block space-y-4">
                        <h4 className="text-[10px] uppercase tracking-widest theme-text-secondary">
                            Información General
                        </h4>
                        <div className="space-y-3.5 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl glass-pill theme-text-accent">
                                    <Calendar size={14} />
                                </div>
                                <div>
                                    <p className="font-semibold theme-text-primary">
                                        {activeClass.day || 'Sin horario'}
                                    </p>
                                    <p className="theme-text-secondary font-normal">
                                        {activeClass.startTime || '--:--'} a {activeClass.endTime || '--:--'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl glass-pill text-emerald-400">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <p className="font-semibold theme-text-primary">Ubicación</p>
                                    <p className="theme-text-secondary font-normal">
                                        {activeClass.room || 'Virtual'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Área de Contenido Principal */}
                <div className="flex-1 glass-panel rounded-[2.25rem] p-6 md:p-8">
                    {/* TAB: MURO / INICIO */}
                    {activeTab === 'muro' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-5 border-b border-current/10">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo || activeClass.code}&backgroundColor=4f46e5`}
                                    alt="Profesor"
                                    className="w-14 h-14 rounded-2xl border border-current/20"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold theme-text-primary">
                                        Ing. Carlos Pérez
                                    </h3>
                                    <p className="text-xs theme-text-secondary font-normal flex items-center gap-2 mt-0.5">
                                        <Mail size={13} className="theme-text-accent" />
                                        cperez@miumc.edu.ve
                                    </p>
                                </div>
                            </div>

                            <div className="apple-card rounded-2xl overflow-hidden">
                                <div className="glass-pill px-5 py-3.5 border-b border-current/10 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl apple-card flex items-center justify-center theme-text-accent">
                                            <MessageSquare size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold theme-text-primary">
                                                Aviso del Profesor
                                            </p>
                                            <p className="text-[10px] theme-text-secondary uppercase tracking-widest font-normal">
                                                10 Feb 2026
                                            </p>
                                        </div>
                                    </div>
                                    <button className="theme-text-secondary hover:theme-text-primary cursor-pointer">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                <div className="p-6 text-sm theme-text-secondary font-normal leading-relaxed space-y-3">
                                    <p className="font-semibold theme-text-primary">
                                        ¡Bienvenidos al curso, futuros ingenieros!
                                    </p>
                                    <p>
                                        En este espacio encontraremos todo el material necesario para llevar a cabo la materia. Les recuerdo que el plan de evaluación ya se encuentra disponible en la sección de "Material de Apoyo".
                                    </p>
                                    <p>
                                        Cualquier duda la aclaramos en la próxima clase presencial. ¡Éxitos!
                                    </p>
                                </div>
                            </div>

                            {isCourseFinished && (
                                <div className="p-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 flex flex-col items-center justify-center text-center mt-6">
                                    <div className="w-14 h-14 bg-emerald-400/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <h3 className="text-base font-semibold text-emerald-400 uppercase tracking-wider">
                                        Materia Concluida
                                    </h3>
                                    <p className="theme-text-secondary text-xs font-normal max-w-md mt-1.5">
                                        El acta de notas ha sido cerrada y enviada a Control de Estudios. Tu calificación definitiva es de{' '}
                                        <span className="font-semibold theme-text-primary">
                                            {finalScore} puntos
                                        </span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: MATERIAL DE APOYO */}
                    {activeTab === 'material' && (
                        <div className="space-y-5">
                            <h3 className="font-semibold text-lg theme-text-primary">
                                Archivos y Enlaces
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_MATERIALS.map((mat) => (
                                    <div
                                        key={mat.id}
                                        className="apple-card p-5 rounded-2xl flex flex-col justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl glass-pill theme-text-accent shrink-0">
                                                {mat.type === 'pdf' ? (
                                                    <FileText size={20} />
                                                ) : mat.type === 'link' ? (
                                                    <Link2 size={20} />
                                                ) : (
                                                    <PlaySquare size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold theme-text-primary text-sm leading-snug">
                                                    {mat.title}
                                                </h4>
                                                <p className="text-xs theme-text-secondary mt-1 font-normal">
                                                    {mat.date} • {mat.size}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="apple-btn-glass w-full py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                                            {mat.type === 'link' ? (
                                                <>
                                                    <Link2 size={14} className="theme-text-accent" />
                                                    <span>Abrir Enlace</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={14} className="theme-text-accent" />
                                                    <span>Descargar</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: EVALUACIONES (CON PORCENTAJE DE CADA EVALUACIÓN) */}
                    {activeTab === 'evaluaciones' && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-lg theme-text-primary">
                                        Actividades
                                    </h3>
                                    <p className="text-xs theme-text-secondary font-normal">
                                        Listado de entregas requeridas.
                                    </p>
                                </div>

                                <div className="glass-pill px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 w-fit">
                                    <span className="theme-text-secondary font-normal">
                                        Total a Evaluar:
                                    </span>
                                    <span className="font-semibold theme-text-accent">
                                        {totalPercentage}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {evaluationsState.map((ev) => {
                                    let statusConfig = {
                                        color: 'theme-text-secondary',
                                        icon: Lock,
                                        label: 'Próximamente'
                                    };

                                    if (ev.status === 'pending') {
                                        statusConfig = {
                                            color: 'text-amber-300',
                                            icon: AlertCircle,
                                            label: 'Pendiente'
                                        };
                                    } else if (ev.status === 'submitted') {
                                        statusConfig = {
                                            color: 'theme-text-accent',
                                            icon: Clock,
                                            label: 'En Revisión'
                                        };
                                    } else if (ev.status === 'graded') {
                                        statusConfig = {
                                            color: 'text-emerald-400',
                                            icon: CheckCircle2,
                                            label: 'Calificada'
                                        };
                                    }

                                    const StatusIcon = statusConfig.icon;
                                    const isBeingSubmitted = activeSubmission?.id === ev.id;

                                    return (
                                        <div
                                            key={ev.id}
                                            className={`apple-card p-5 rounded-2xl transition-all ${
                                                isBeingSubmitted ? 'border-[#E7E2CE]/60' : ''
                                            }`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span
                                                            className={`glass-pill text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit ${statusConfig.color}`}
                                                        >
                                                            <StatusIcon size={12} /> {statusConfig.label}
                                                        </span>

                                                        {/* Píldora del Porcentaje de la Evaluación */}
                                                        <span className="glass-pill text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md theme-text-accent">
                                                            Valor: {ev.percentage}%
                                                        </span>

                                                        {ev.status === 'graded' && (
                                                            <span className="glass-pill text-xs font-semibold text-emerald-400 px-2.5 py-0.5 rounded-md">
                                                                {ev.score} / {ev.maxScore} Pts
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold theme-text-primary text-base">
                                                        {ev.title}
                                                    </h4>
                                                    <p className="text-xs theme-text-secondary font-normal mt-1 flex items-center gap-1.5">
                                                        <Calendar size={12} className="theme-text-accent" />
                                                        Vencimiento: {ev.dueDate}
                                                    </p>
                                                </div>

                                                <div className="shrink-0">
                                                    {isCourseFinished ? (
                                                        <span className="text-xs theme-text-secondary">
                                                            Cerrado
                                                        </span>
                                                    ) : ev.status === 'pending' ? (
                                                        !isBeingSubmitted && (
                                                            <button
                                                                onClick={() =>
                                                                    setActiveSubmission({
                                                                        id: ev.id,
                                                                        type: 'file',
                                                                        value: ''
                                                                    })
                                                                }
                                                                className="apple-btn-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <UploadCloud size={15} />
                                                                <span>Entregar</span>
                                                            </button>
                                                        )
                                                    ) : ev.status === 'submitted' ? (
                                                        <span className="text-xs theme-text-accent flex items-center gap-1.5">
                                                            <Clock size={15} /> Esperando Nota
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                                                            <CheckCircle2 size={15} /> Evaluado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Módulo Desplegable de Entrega */}
                                            {isBeingSubmitted && (
                                                <div className="mt-5 pt-5 border-t border-current/10 space-y-4">
                                                    <div className="flex items-center gap-1.5 glass-pill p-1 w-fit rounded-xl">
                                                        <button
                                                            onClick={() =>
                                                                setActiveSubmission({
                                                                    ...activeSubmission,
                                                                    type: 'file'
                                                                })
                                                            }
                                                            className={`px-3.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                                                                activeSubmission.type === 'file'
                                                                    ? 'apple-btn-primary'
                                                                    : 'theme-text-secondary'
                                                            }`}
                                                        >
                                                            <FileText size={13} /> Archivo
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setActiveSubmission({
                                                                    ...activeSubmission,
                                                                    type: 'link'
                                                                })
                                                            }
                                                            className={`px-3.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                                                                activeSubmission.type === 'link'
                                                                    ? 'apple-btn-primary'
                                                                    : 'theme-text-secondary'
                                                            }`}
                                                        >
                                                            <Link2 size={13} /> Enlace URL
                                                        </button>
                                                    </div>

                                                    {activeSubmission.type === 'file' ? (
                                                        <div className="glass-pill border-2 border-dashed border-current/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-current/40 transition-colors">
                                                            <div className="w-11 h-11 rounded-full apple-card flex items-center justify-center mb-3 theme-text-accent">
                                                                <UploadCloud size={22} />
                                                            </div>
                                                            <p className="text-xs font-semibold theme-text-primary">
                                                                Haz clic o arrastra tu archivo aquí
                                                            </p>
                                                            <p className="text-[10px] theme-text-secondary font-normal mt-1 uppercase tracking-widest">
                                                                Soporta PDF, DOCX, ZIP (Máx 10MB)
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-secondary">
                                                                <Link2 size={16} />
                                                            </div>
                                                            <input
                                                                type="url"
                                                                placeholder="Pega el enlace a tu Drive, GitHub, o documento web..."
                                                                className="nautilus-input w-full pl-11 pr-4 py-3.5 rounded-xl text-xs outline-none"
                                                                value={activeSubmission.value}
                                                                onChange={(e) =>
                                                                    setActiveSubmission({
                                                                        ...activeSubmission,
                                                                        value: e.target.value
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <button
                                                            onClick={() => setActiveSubmission(null)}
                                                            className="apple-btn-glass px-4 py-2 rounded-xl text-xs cursor-pointer"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmUpload(ev.id)}
                                                            disabled={
                                                                uploadingId === ev.id ||
                                                                (activeSubmission.type === 'link' &&
                                                                    !activeSubmission.value)
                                                            }
                                                            className="apple-btn-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                        >
                                                            {uploadingId === ev.id ? (
                                                                <>
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                    <span>Guardando...</span>
                                                                </>
                                                            ) : (
                                                                <span>Confirmar Entrega</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {(ev.status === 'submitted' || ev.status === 'graded') &&
                                                ev.submission && (
                                                    <div className="mt-4 p-3 glass-pill rounded-xl flex items-center gap-3 w-fit pr-5">
                                                        <div className="w-8 h-8 apple-card rounded-lg flex items-center justify-center shrink-0 theme-text-accent">
                                                            {ev.submission.type === 'link' ? (
                                                                <Link2 size={15} />
                                                            ) : (
                                                                <FileText size={15} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold theme-text-primary truncate max-w-[220px]">
                                                                {ev.submission.name}
                                                            </p>
                                                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-0.5">
                                                                Recibido con éxito
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB: PARTICIPANTES */}
                    {activeTab === 'personas' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-widest theme-text-secondary mb-3 border-b border-current/10 pb-2">
                                    Profesor
                                </h3>
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeClass.codigo || activeClass.code}&backgroundColor=e2e8f0`}
                                        alt="Profesor"
                                        className="w-11 h-11 rounded-full border border-current/20"
                                    />
                                    <div>
                                        <p className="font-semibold theme-text-primary text-sm">
                                            Ing. Carlos Pérez
                                        </p>
                                        <p className="text-xs theme-text-secondary font-normal">
                                            Profesor(a)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between border-b border-current/10 pb-2 mb-4">
                                    <h3 className="text-[10px] uppercase tracking-widest theme-text-secondary">
                                        Compañeros
                                    </h3>
                                    <span className="glass-pill text-[11px] theme-text-accent px-2.5 py-0.5 rounded-full">
                                        {MOCK_CLASSMATES.length} Alumnos
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {MOCK_CLASSMATES.map((student, idx) => (
                                        <div
                                            key={idx}
                                            className="apple-card p-3.5 rounded-xl flex items-center gap-3.5"
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=f8fafc`}
                                                alt={student.name}
                                                className="w-9 h-9 rounded-full border border-current/20"
                                            />
                                            <p className="font-semibold theme-text-primary text-xs">
                                                {student.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Classroom;