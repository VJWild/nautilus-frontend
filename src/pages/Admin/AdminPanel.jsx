import React, { useState, useMemo } from 'react';
import {
    Users, Search, ShieldCheck, Edit3, CheckCircle,
    Plus, ArrowLeft, GraduationCap, Shield,
    ChevronUp, Save, Trash2, Phone, Mail,
    UserCog, X, UserMinus, Briefcase, Loader2,
    BookOpen, MapPin, Clock, FileText, Settings
} from 'lucide-react';
import { usePensum } from '../../context/PensumContext';
import { dbMaterias, ROMANOS, CAREERS, SPECIALIZATIONS, USER } from '../../mocks/data';

const INITIAL_USERS = [
    {
        id: 1,
        full_name: USER.name,
        student_code: USER.code,
        role: 'admin',
        career_id: 1,
        specialization_id: 1,
        career_name: 'Ingeniería Informática',
        mencion_name: 'Redes y Telecomunicaciones',
        phone: '0422-1461344',
        email: 'vgonzalez@miumc.edu.ve'
    },
    {
        id: 2,
        full_name: 'Efren Imbecil',
        student_code: 'INGINF-123456789',
        role: 'cadete',
        career_id: 1,
        specialization_id: 2,
        career_name: 'Ingeniería Informática',
        mencion_name: 'Seguridad Informática',
        phone: '0414-2223344',
        email: 'scastro@miumc.edu.ve'
    },
    {
        id: 901,
        full_name: 'Prof. Dayana Vargas',
        student_code: 'PROF-001',
        role: 'profesor',
        career_id: 2,
        career_name: 'Ingeniería Marítima',
        phone: '0414-9876543',
        email: 'amartinez@miumc.edu.ve',
        mencion_name: 'Operaciones'
    },
    {
        id: 902,
        full_name: 'Dra. María López',
        student_code: 'COORD-001',
        role: 'coordinador',
        admin_department: 'Control de Estudios',
        phone: '0412-5555555',
        email: 'mlopez@miumc.edu.ve',
        mencion_name: null
    },
    {
        id: 903,
        full_name: 'Ing. Carlos Pérez',
        student_code: 'PROF-002',
        role: 'profesor',
        career_id: 1,
        career_name: 'Ingeniería Informática',
        phone: '0424-1112233',
        email: 'cperez@miumc.edu.ve',
        mencion_name: 'Redes y Telecomunicaciones'
    },
    {
        id: 904,
        full_name: 'Lic. Ana Gómez',
        student_code: 'DIR-001',
        role: 'director',
        admin_department: 'Planificación Académica',
        phone: '0416-9998877',
        email: 'agomez@miumc.edu.ve',
        mencion_name: null
    },
    {
        id: 905,
        full_name: 'TSU. José Ramírez',
        student_code: 'ADMIN-001',
        role: 'administrativo',
        admin_department: 'Coordinación Docente',
        phone: '0412-3334455',
        email: 'jramirez@miumc.edu.ve',
        mencion_name: null
    }
];

const AdminPanel = () => {
    const { user: currentUser, materiasAprobadas, syncGlobalData } = usePensum();

    const [users, setUsers] = useState(INITIAL_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('estudiantes'); // 'estudiantes' | 'profesores' | 'coordinacion'

    // Estados para la edición de expedientes (materias por semestre)
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRecords, setUserRecords] = useState(new Set());
    const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

    // Estados para la edición de perfiles y modales
    const [editingUser, setEditingUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCreateProfModal, setShowCreateProfModal] = useState(false);
    const [showCreateCoordModal, setShowCreateCoordModal] = useState(false);
    const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const allSubjects = useMemo(() => {
        return dbMaterias.map((m) => ({
            ...m,
            code: m.codigo,
            name: m.nombre,
            semester: m.semestre
        }));
    }, []);

    const handleManageRecords = (u) => {
        setUserRecords(new Set(materiasAprobadas));
        setSelectedUser(u);
    };

    const handleSaveRecords = () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        setTimeout(() => {
            if (syncGlobalData) {
                syncGlobalData(selectedUser.student_code, Array.from(userRecords));
            }
            setIsUpdating(false);
            setSelectedUser(null);
        }, 400);
    };

    const handleDeleteUser = (id, name) => {
        if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Esta acción es irreversible.`)) {
            return;
        }
        setUsers(users.filter((u) => u.id !== id));
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const selectedCareer = CAREERS.find((c) => String(c.id) === String(editingUser.career_id));
        const selectedSpec = SPECIALIZATIONS.find(
            (s) => String(s.id) === String(editingUser.specialization_id)
        );

        const updatedPayload = {
            ...editingUser,
            career_name: selectedCareer?.name || editingUser.career_name || 'Ingeniería Informática',
            mencion_name: selectedSpec?.name || editingUser.mencion_name
        };

        setTimeout(() => {
            setUsers(users.map((u) => (u.id === editingUser.id ? updatedPayload : u)));
            setEditingUser(null);
            setIsUpdating(false);
        }, 350);
    };

    const openAssignSubjectModal = (prof) => {
        setSelectedTeacher(prof);
        setShowAssignSubjectModal(true);
    };

    const toggleSemester = (sem) => {
        const newSet = new Set(collapsedSemesters);
        if (newSet.has(sem)) newSet.delete(sem);
        else newSet.add(sem);
        setCollapsedSemesters(newSet);
    };

    const subjectsBySemester = useMemo(() => {
        const groups = {};
        allSubjects.forEach((sub) => {
            if (!groups[sub.semester]) groups[sub.semester] = [];
            groups[sub.semester].push(sub);
        });
        return groups;
    }, [allSubjects]);

    const filteredUsers = useMemo(() => {
        const term = (searchTerm || '').toLowerCase();
        return users.filter((u) => {
            const fullName = (u?.full_name || '').toLowerCase();
            const studentCode = (u?.student_code || '').toLowerCase();
            const matchesSearch = fullName.includes(term) || studentCode.includes(term);
            const userRole = String(u.role).toLowerCase();

            let matchesTab = false;
            if (activeTab === 'estudiantes') matchesTab = ['cadete', 'admin'].includes(userRole);
            else if (activeTab === 'profesores') matchesTab = userRole === 'profesor';
            else if (activeTab === 'coordinacion') {
                matchesTab = ['coordinador', 'director', 'administrativo'].includes(userRole);
            }

            return matchesSearch && matchesTab;
        });
    }, [users, searchTerm, activeTab]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 w-full">
            {/* Cabecera del Módulo */}
            <div className="glass-panel rounded-[2.25rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary flex items-center gap-3 tracking-tight">
                        <ShieldCheck className="text-emerald-400" size={28} />
                        <span>Panel Administrador</span>
                    </h2>
                    <p className="theme-text-secondary font-normal text-xs sm:text-sm mt-1">
                        Controla todo como hacen en WatchDogs
                    </p>
                </div>
            </div>

            {!selectedUser ? (
                <div className="space-y-5 w-full">
                    {/* Navegación por Pestañas */}
                    <div className="flex gap-2 glass-panel p-2 rounded-2xl overflow-x-auto custom-scrollbar w-full md:w-fit">
                        {[
                            { id: 'estudiantes', icon: Users, label: 'Población Estudiantil' },
                            { id: 'profesores', icon: BookOpen, label: 'Salón de Profesores' },
                            { id: 'coordinacion', icon: Shield, label: 'Coordinaciones' }
                        ].map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        active
                                            ? 'apple-btn-primary'
                                            : 'theme-text-secondary hover:theme-text-primary'
                                    }`}
                                >
                                    <tab.icon size={15} className={active ? '' : 'theme-text-accent'} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Buscador y Botones de Creación */}
                    <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-secondary"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder={`Buscar en ${
                                    activeTab === 'estudiantes'
                                        ? 'estudiantes'
                                        : activeTab === 'profesores'
                                            ? 'profesores'
                                            : 'coordinaciones'
                                }...`}
                                className="nautilus-input w-full pl-11 pr-4 py-3 rounded-xl outline-none text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {activeTab === 'profesores' && (
                            <button
                                onClick={() => setShowCreateProfModal(true)}
                                className="apple-btn-primary w-full md:w-auto px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Nuevo Profesor</span>
                            </button>
                        )}

                        {activeTab === 'coordinacion' && (
                            <button
                                onClick={() => setShowCreateCoordModal(true)}
                                className="apple-btn-primary w-full md:w-auto px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Nuevo Personal</span>
                            </button>
                        )}
                    </div>

                    {/* Tabla Glassmorphism */}
                    <div className="glass-panel rounded-[2.25rem] overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar w-full">
                            {activeTab === 'profesores' ? (
                                <table className="w-full text-left border-collapse text-sm min-w-[880px]">
                                    <thead>
                                    <tr className="glass-pill border-b border-current/10">
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            Docente
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            Departamento Asignado
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            Información de Contacto
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest text-center">
                                            Carga Académica
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-current/10">
                                    {filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-current/5 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl apple-card flex items-center justify-center theme-text-accent shrink-0">
                                                        <BookOpen size={17} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold theme-text-primary leading-tight">
                                                            {u.full_name || 'Sin Nombre'}
                                                        </p>
                                                        <p className="text-[10px] theme-text-secondary uppercase">
                                                            {u.student_code || '---'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-xs theme-text-primary flex items-center gap-1.5">
                                                    <Briefcase size={13} className="theme-text-accent" />
                                                    {u.career_name || 'General / Sin Asignar'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                                <p className="text-xs theme-text-secondary font-normal flex items-center gap-2">
                                                    <Mail size={12} className="theme-text-accent" />
                                                    {u.email || 'N/A'}
                                                </p>
                                                <p className="text-xs theme-text-secondary font-normal flex items-center gap-2">
                                                    <Phone size={12} className="text-emerald-400" />
                                                    {u.phone || 'Sin teléfono'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className="glass-pill text-[10px] uppercase px-3 py-1.5 rounded-lg theme-text-secondary">
                                                        0 Materias Asignadas
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openAssignSubjectModal(u)}
                                                        className="apple-btn-glass p-2 rounded-xl theme-text-accent cursor-pointer"
                                                        title="Asignar Materias a Impartir"
                                                    >
                                                        <BookOpen size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(u)}
                                                        className="apple-btn-glass p-2 rounded-xl theme-text-primary cursor-pointer"
                                                        title="Editar Perfil del Docente"
                                                    >
                                                        <UserCog size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteUser(u.id, u.full_name)
                                                        }
                                                        className="apple-btn-glass p-2 rounded-xl text-rose-300 cursor-pointer"
                                                        title="Remover Docente"
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-12 text-center theme-text-secondary text-xs font-normal"
                                            >
                                                No hay profesores registrados o no coinciden con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm min-w-[880px]">
                                    <thead>
                                    <tr className="glass-pill border-b border-current/10">
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            {activeTab === 'coordinacion'
                                                ? 'Departamento Asignado'
                                                : 'Departamento / Carrera'}
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest text-center">
                                            Rol
                                        </th>
                                        <th className="px-6 py-4 text-[10px] theme-text-secondary uppercase tracking-widest text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-current/10">
                                    {filteredUsers.map((u) => {
                                        const isStaff = [
                                            'admin',
                                            'coordinador',
                                            'director',
                                            'administrativo'
                                        ].includes(u.role);
                                        const isCurrentUser =
                                            u.student_code ===
                                            (currentUser?.code || currentUser?.student_code);

                                        return (
                                            <tr
                                                key={u.id}
                                                className="hover:bg-current/5 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl apple-card flex items-center justify-center theme-text-accent shrink-0">
                                                            {isStaff ? (
                                                                <Shield size={17} />
                                                            ) : u.full_name ? (
                                                                u.full_name.charAt(0).toUpperCase()
                                                            ) : (
                                                                'U'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold theme-text-primary leading-tight">
                                                                {u.full_name || 'Sin Nombre'}
                                                            </p>
                                                            <p className="text-[10px] theme-text-secondary uppercase">
                                                                {u.student_code || '---'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                                    <p className="text-xs theme-text-primary flex items-center gap-1.5">
                                                        <Briefcase
                                                            size={13}
                                                            className="theme-text-accent"
                                                        />
                                                        {u.admin_department ||
                                                            u.career_name ||
                                                            'General / Sin Asignar'}
                                                    </p>
                                                    {u.mencion_name && !u.admin_department && (
                                                        <span className="glass-pill text-[10px] theme-text-accent px-2.5 py-0.5 rounded-md inline-block">
                                                                {u.mencion_name}
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                                    <p className="text-xs theme-text-secondary font-normal flex items-center gap-2">
                                                        <Mail
                                                            size={12}
                                                            className="theme-text-accent"
                                                        />
                                                        {u.email || 'N/A'}
                                                    </p>
                                                    <p className="text-xs theme-text-secondary font-normal flex items-center gap-2">
                                                        <Phone
                                                            size={12}
                                                            className="text-emerald-400"
                                                        />
                                                        {u.phone || 'Sin teléfono'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <span
                                                            className={`glass-pill text-[10px] uppercase px-2.5 py-1 rounded-lg ${
                                                                isStaff
                                                                    ? 'text-emerald-400'
                                                                    : 'theme-text-accent'
                                                            }`}
                                                        >
                                                            {u.role || 'cadete'}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(u)}
                                                            className="apple-btn-glass p-2 rounded-xl theme-text-primary cursor-pointer"
                                                            title="Editar Perfil"
                                                        >
                                                            <UserCog size={16} />
                                                        </button>

                                                        {['cadete', 'admin'].includes(
                                                            String(u.role).toLowerCase()
                                                        ) && (
                                                            <button
                                                                onClick={() =>
                                                                    handleManageRecords(u)
                                                                }
                                                                className="apple-btn-glass p-2 rounded-xl text-emerald-400 cursor-pointer"
                                                                title="Gestionar Notas"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    u.id,
                                                                    u.full_name
                                                                )
                                                            }
                                                            disabled={isCurrentUser}
                                                            className={`apple-btn-glass p-2 rounded-xl ${
                                                                isCurrentUser
                                                                    ? 'opacity-30 cursor-not-allowed'
                                                                    : 'text-rose-300 cursor-pointer'
                                                            }`}
                                                            title="Eliminar Usuario"
                                                        >
                                                            <UserMinus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-12 text-center theme-text-secondary text-xs font-normal"
                                            >
                                                No hay usuarios en esta categoría o no coinciden con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* VISTA DE GESTIÓN DE EXPEDIENTE DE NOTAS */
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="apple-btn-glass px-4 py-2 rounded-full flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer w-fit"
                    >
                        <ArrowLeft size={16} />
                        <span>Volver a la lista</span>
                    </button>

                    <div className="glass-panel rounded-[2.25rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-semibold theme-text-primary tracking-tight">
                                    {selectedUser?.full_name || 'Cadete'}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="glass-pill px-3 py-1 rounded-full text-xs uppercase tracking-widest theme-text-accent">
                                        {selectedUser?.student_code || '---'}
                                    </span>
                                    <span className="theme-text-secondary text-sm">
                                        {selectedUser?.mencion_name || 'Ciclo Básico'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="glass-pill px-5 py-3 rounded-2xl text-center">
                                    <p className="text-[10px] theme-text-secondary uppercase tracking-wider">
                                        Aprobadas
                                    </p>
                                    <p className="text-2xl font-semibold text-emerald-400">
                                        {userRecords.size}
                                    </p>
                                </div>

                                <button
                                    onClick={handleSaveRecords}
                                    disabled={isUpdating}
                                    className="apple-btn-primary px-7 py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer"
                                >
                                    {isUpdating ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span>{isUpdating ? 'Guardando...' : 'Confirmar Récord'}</span>
                                </button>
                            </div>
                        </div>
                        <GraduationCap
                            size={150}
                            className="absolute -right-8 -bottom-8 opacity-5 rotate-12 pointer-events-none"
                        />
                    </div>

                    <div className="space-y-4">
                        {ROMANOS.map((rom, index) => {
                            const numSemestre = index + 1;
                            const materiasSemestre = subjectsBySemester[numSemestre];
                            if (!materiasSemestre || materiasSemestre.length === 0) return null;

                            const isCollapsed = collapsedSemesters.has(numSemestre);

                            return (
                                <div
                                    key={rom}
                                    className="glass-panel rounded-[2rem] p-4 md:p-5 space-y-3"
                                >
                                    <div
                                        onClick={() => toggleSemester(numSemestre)}
                                        className="flex items-center justify-between cursor-pointer py-2 px-2 select-none"
                                    >
                                        <h3 className="text-sm uppercase tracking-[0.18em] theme-text-primary pl-3 border-l-4 border-[#E7E2CE]">
                                            Semestre {rom}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="glass-pill text-xs theme-text-secondary px-3 py-1 rounded-full">
                                                {materiasSemestre.length} Materias
                                            </span>
                                            <div
                                                className={`transition-transform duration-300 ${
                                                    isCollapsed ? 'rotate-180' : ''
                                                }`}
                                            >
                                                <ChevronUp size={18} className="theme-text-accent" />
                                            </div>
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                            {materiasSemestre.map((sub) => {
                                                const isApproved = userRecords.has(sub.code);
                                                return (
                                                    <div
                                                        key={sub.code}
                                                        onClick={() => {
                                                            const n = new Set(userRecords);
                                                            if (n.has(sub.code)) n.delete(sub.code);
                                                            else n.add(sub.code);
                                                            setUserRecords(n);
                                                        }}
                                                        className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                                                            isApproved
                                                                ? 'apple-card border-emerald-400/50 bg-emerald-500/10'
                                                                : 'apple-card'
                                                        }`}
                                                    >
                                                        <div className="flex-1 pr-3">
                                                            <p className="text-[10px] theme-text-secondary uppercase tracking-widest mb-1">
                                                                {sub.code}
                                                            </p>
                                                            <h4 className="font-semibold text-sm leading-snug theme-text-primary">
                                                                {sub.name}
                                                            </h4>
                                                        </div>
                                                        <div
                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                                isApproved
                                                                    ? 'bg-emerald-400 text-[#112250]'
                                                                    : 'glass-pill theme-text-secondary'
                                                            }`}
                                                        >
                                                            {isApproved ? (
                                                                <CheckCircle size={18} />
                                                            ) : (
                                                                <Plus size={18} />
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
                </div>
            )}

            {/* MODAL 1: EDICIÓN DE PERFIL DE USUARIO */}
            {editingUser && (
                <div
                    className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setEditingUser(null)}
                >
                    <div
                        className="glass-panel rounded-[2.5rem] w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 border-b border-current/10 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] theme-text-accent block mb-1">
                                    {editingUser.student_code}
                                </span>
                                <h3 className="text-2xl font-semibold theme-text-primary">
                                    Editar Perfil
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="apple-btn-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar p-6 md:p-8">
                            <form onSubmit={handleUpdateUser} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                            value={editingUser.full_name || ''}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    full_name: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                            Rol del Usuario
                                        </label>
                                        <select
                                            className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs"
                                            value={editingUser.role || 'cadete'}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    role: e.target.value
                                                })
                                            }
                                        >
                                            <option value="cadete" className="bg-[#112250] text-[#F5F4F0]">CADETE</option>
                                            <option value="profesor" className="bg-[#112250] text-[#F5F4F0]">PROFESOR</option>
                                            <option value="administrativo" className="bg-[#112250] text-[#F5F4F0]">PERSONAL ADMINISTRATIVO</option>
                                            <option value="coordinador" className="bg-[#112250] text-[#F5F4F0]">COORDINADOR(A)</option>
                                            <option value="director" className="bg-[#112250] text-[#F5F4F0]">DIRECTOR(A)</option>
                                            <option value="admin" className="bg-[#112250] text-[#F5F4F0]">SÚPER ADMINISTRADOR</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                            value={editingUser.email || ''}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    email: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                            value={editingUser.phone || ''}
                                            onChange={(e) =>
                                                setEditingUser({
                                                    ...editingUser,
                                                    phone: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {['cadete', 'profesor'].includes(editingUser.role) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-current/10">
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Carrera / Facultad Académica
                                            </label>
                                            <select
                                                className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs"
                                                value={editingUser.career_id || 1}
                                                onChange={(e) =>
                                                    setEditingUser({
                                                        ...editingUser,
                                                        career_id: e.target.value
                                                    })
                                                }
                                            >
                                                {CAREERS.map((c) => (
                                                    <option key={c.id} value={c.id} className="bg-[#112250] text-[#F5F4F0]">
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Mención / Especialidad
                                            </label>
                                            <select
                                                className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs"
                                                value={editingUser.specialization_id || 1}
                                                onChange={(e) =>
                                                    setEditingUser({
                                                        ...editingUser,
                                                        specialization_id: e.target.value
                                                    })
                                                }
                                            >
                                                {SPECIALIZATIONS.map((s) => (
                                                    <option key={s.id} value={s.id} className="bg-[#112250] text-[#F5F4F0]">
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-3 border-t border-current/10">
                                        <label className="text-[10px] theme-text-accent uppercase tracking-wider ml-1 mb-2.5 flex items-center gap-1.5">
                                            <Settings size={13} />
                                            <span>Departamento Administrativo Asignado</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                'Control de Estudios',
                                                'Planificación Académica',
                                                'Coordinación Docente',
                                                'Sistemas / Rectorado'
                                            ].map((dept) => (
                                                <label
                                                    key={dept}
                                                    className="apple-card flex items-center gap-3 p-3.5 rounded-xl cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="edit_departamento"
                                                        value={dept}
                                                        checked={
                                                            editingUser.admin_department === dept ||
                                                            (!editingUser.admin_department &&
                                                                dept === 'Control de Estudios')
                                                        }
                                                        onChange={(e) =>
                                                            setEditingUser({
                                                                ...editingUser,
                                                                admin_department: e.target.value
                                                            })
                                                        }
                                                    />
                                                    <span className="text-xs theme-text-primary">
                                                        {dept}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="apple-btn-primary w-full py-4 rounded-2xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 mt-4 cursor-pointer"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : null}
                                    <span>
                                        {isUpdating ? 'ACTUALIZANDO...' : 'CONFIRMAR CAMBIOS'}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: REGISTRAR NUEVO DOCENTE */}
            {showCreateProfModal && (
                <div
                    className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCreateProfModal(false)}
                >
                    <div
                        className="glass-panel rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 border-b border-current/10 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] theme-text-accent block mb-1">
                                    Creación de Credenciales
                                </span>
                                <h3 className="text-2xl font-semibold theme-text-primary">
                                    Registrar Nuevo Docente
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCreateProfModal(false)}
                                className="apple-btn-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Nombres y Apellidos
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Ing. Carlos Pérez"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Cédula de Identidad (Usuario)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="V-12345678"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="profesor@miumc.edu.ve"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="0414-0000000"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-current/10">
                                <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                    Departamento / Escuela Asignada
                                </label>
                                <select className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs">
                                    <option value="" className="bg-[#112250] text-[#F5F4F0]">
                                        Seleccione un departamento...
                                    </option>
                                    {CAREERS.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#112250] text-[#F5F4F0]">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setShowCreateProfModal(false)}
                                className="apple-btn-primary w-full py-4 rounded-2xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Crear Perfil Docente</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: ASIGNACIÓN DE CARGA ACADÉMICA A PROFESOR */}
            {showAssignSubjectModal && selectedTeacher && (
                <div
                    className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAssignSubjectModal(false)}
                >
                    <div
                        className="glass-panel rounded-[2.5rem] w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 border-b border-current/10 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-13 h-13 apple-card rounded-2xl flex items-center justify-center text-lg theme-text-accent">
                                    {selectedTeacher.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold theme-text-primary">
                                        Carga Académica
                                    </h3>
                                    <p className="theme-text-secondary text-xs font-normal">
                                        {selectedTeacher.full_name} • {selectedTeacher.student_code}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAssignSubjectModal(false)}
                                className="apple-btn-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                            {/* Columna Izquierda: Materias Asignadas */}
                            <div className="lg:w-1/2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-current/10 overflow-y-auto custom-scrollbar space-y-4">
                                <h4 className="text-xs uppercase tracking-widest theme-text-secondary flex items-center gap-2">
                                    <FileText size={15} className="theme-text-accent" />
                                    <span>Materias Asignadas (2)</span>
                                </h4>

                                <div className="space-y-3">
                                    <div className="apple-card p-5 rounded-2xl relative">
                                        <button className="absolute top-4 right-4 theme-text-secondary hover:text-rose-300 transition-colors cursor-pointer">
                                            <Trash2 size={15} />
                                        </button>
                                        <span className="glass-pill text-[10px] uppercase tracking-widest theme-text-accent px-2.5 py-0.5 rounded-md">
                                            INF-102
                                        </span>
                                        <h5 className="font-semibold theme-text-primary mt-2 mb-3 pr-6">
                                            Informática Básica
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs theme-text-secondary font-normal">
                                            <p className="flex items-center gap-1.5">
                                                <MapPin size={12} className="theme-text-accent" /> Salón A-14
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Users size={12} className="theme-text-accent" /> Sección: 01
                                            </p>
                                            <p className="flex items-center gap-1.5 col-span-2">
                                                <Clock size={12} className="theme-text-accent" /> Lunes • 08:00 - 10:00
                                            </p>
                                        </div>
                                    </div>

                                    <div className="apple-card p-5 rounded-2xl relative">
                                        <button className="absolute top-4 right-4 theme-text-secondary hover:text-rose-300 transition-colors cursor-pointer">
                                            <Trash2 size={15} />
                                        </button>
                                        <span className="glass-pill text-[10px] uppercase tracking-widest theme-text-accent px-2.5 py-0.5 rounded-md">
                                            PRO-413
                                        </span>
                                        <h5 className="font-semibold theme-text-primary mt-2 mb-3 pr-6">
                                            Programación I
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs theme-text-secondary font-normal">
                                            <p className="flex items-center gap-1.5">
                                                <MapPin size={12} className="theme-text-accent" /> Laboratorio 3
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Users size={12} className="theme-text-accent" /> Sección: 02
                                            </p>
                                            <p className="flex items-center gap-1.5 col-span-2">
                                                <Clock size={12} className="theme-text-accent" /> Miércoles • 10:00 - 12:00
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Añadir Nueva Materia */}
                            <div className="lg:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-5">
                                <div className="space-y-4">
                                    <h4 className="text-xs uppercase tracking-widest theme-text-secondary flex items-center gap-2">
                                        <Plus size={15} className="text-emerald-400" />
                                        <span>Nueva Asignación</span>
                                    </h4>

                                    <div>
                                        <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                            Buscar Materia (Pensum)
                                        </label>
                                        <select className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs">
                                            <option value="" className="bg-[#112250] text-[#F5F4F0]">
                                                Seleccione una materia...
                                            </option>
                                            {allSubjects.map((sub) => (
                                                <option key={sub.code} value={sub.code} className="bg-[#112250] text-[#F5F4F0]">
                                                    {sub.code} - {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Día de Clase
                                            </label>
                                            <select className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs">
                                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((d) => (
                                                    <option key={d} className="bg-[#112250] text-[#F5F4F0]">{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Bloque Horario
                                            </label>
                                            <select className="nautilus-input w-full p-3.5 rounded-2xl outline-none cursor-pointer text-xs">
                                                {['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'].map((b) => (
                                                    <option key={b} className="bg-[#112250] text-[#F5F4F0]">{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Salón / Laboratorio
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Aula 12"
                                                className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                                Sección
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: 01"
                                                className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAssignSubjectModal(false)}
                                    className="apple-btn-primary w-full py-4 rounded-2xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <CheckCircle size={16} />
                                    <span>Confirmar Asignación</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: REGISTRAR PERSONAL ADMINISTRATIVO */}
            {showCreateCoordModal && (
                <div
                    className="fixed inset-0 bg-[#112250]/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCreateCoordModal(false)}
                >
                    <div
                        className="glass-panel rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 border-b border-current/10 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] theme-text-accent block mb-1">
                                    Coordinaciones y Directivos
                                </span>
                                <h3 className="text-2xl font-semibold theme-text-primary">
                                    Registrar Personal
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCreateCoordModal(false)}
                                className="apple-btn-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="glass-pill p-4 rounded-2xl flex gap-3 items-start">
                                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest theme-text-primary mb-0.5">
                                        Permisos basados en Departamento
                                    </h4>
                                    <p className="text-xs theme-text-secondary font-normal">
                                        El usuario creado tendrá el rol automático de "Administrativo". Su nivel de acceso dependerá del departamento seleccionado.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Nombres y Apellidos
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Dra. María López"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Identificador Único (Usuario)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="COORD-1234"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Correo Institucional
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="admin@miumc.edu.ve"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 mb-1.5 block">
                                        Teléfono Móvil
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="0414-0000000"
                                        className="nautilus-input w-full p-3.5 rounded-2xl outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-current/10 space-y-2.5">
                                <label className="text-[10px] theme-text-secondary uppercase tracking-wider ml-1 block">
                                    Asignación de Departamento / Permisos
                                </label>
                                {[
                                    {
                                        title: 'Control de Estudios',
                                        desc: 'Gestiona inscripciones de cadetes y expedientes de notas.'
                                    },
                                    {
                                        title: 'Planificación Académica',
                                        desc: 'Actualiza semestres, materias, horarios, salones y secciones.'
                                    },
                                    {
                                        title: 'Coordinación Docente',
                                        desc: 'Asigna materias a los profesores y evalúa el cuerpo docente.'
                                    },
                                    {
                                        title: 'Sistemas / Rectorado (Súper Admin)',
                                        desc: 'Acceso total a todas las funciones y configuraciones del portal.'
                                    }
                                ].map((dept, i) => (
                                    <label
                                        key={dept.title}
                                        className="apple-card flex items-center gap-4 p-4 rounded-2xl cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="departamento"
                                            defaultChecked={i === 0}
                                        />
                                        <div>
                                            <p className="text-xs font-semibold theme-text-primary">
                                                {dept.title}
                                            </p>
                                            <p className="text-[11px] theme-text-secondary font-normal">
                                                {dept.desc}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowCreateCoordModal(false)}
                                className="apple-btn-primary w-full py-4 rounded-2xl text-xs uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Crear Perfil Administrativo</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default AdminPanel;