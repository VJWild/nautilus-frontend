import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { dbMaterias, USER, TOTAL_UC_CARRERA, TOTAL_MATERIAS_CARRERA } from '../mocks/data';

const PensumContext = createContext();

export const usePensum = () => useContext(PensumContext);

const DEFAULT_APPROVED = [
    'LEN-113', 'ING-113', 'INF-102', 'CAL-114',
    'CIE-102', 'LOG-103', 'TID-102', 'DPT-102'
];

export const PensumProvider = ({ children }) => {
    // 1. Tema global sincronizado en tiempo real con el DOM y localStorage
    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || localStorage.getItem('miumc_theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('miumc_theme', theme);
    }, [theme]);

    // Detecta cambios de tema hechos desde Welcome, AuthContainer u Onboarding
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const currentDomTheme = document.documentElement.getAttribute('data-theme');
            if (currentDomTheme && currentDomTheme !== theme) {
                setTheme(currentDomTheme);
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        return () => observer.disconnect();
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('miumc_theme', next);
            return next;
        });
    };

    // 2. Usuario en sesión
    const [user, setUser] = useState(() => {
        try {
            const saved = sessionStorage.getItem('nautilus_user') || sessionStorage.getItem('miumc_session');
            if (saved) {
                const parsed = JSON.parse(saved);
                const name = parsed.name || parsed.full_name || USER.name;
                const avatar = name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'VJ';
                return {
                    ...USER,
                    ...parsed,
                    name,
                    code: parsed.code || parsed.student_code || USER.code,
                    career: parsed.career || parsed.career_name || USER.career,
                    mencion: parsed.mencion || parsed.mencion_name || USER.mencion,
                    role: parsed.role || 'cadete',
                    avatar
                };
            }
            return USER;
        } catch {
            return USER;
        }
    });

    // 3. Materias aprobadas
    const [materiasAprobadas, setMateriasAprobadas] = useState(() => {
        try {
            const saved = localStorage.getItem('nautilus_approved_subjects');
            return saved ? new Set(JSON.parse(saved)) : new Set(DEFAULT_APPROVED);
        } catch {
            return new Set(DEFAULT_APPROVED);
        }
    });

    // 4. Materias inscritas
    const [materiasInscritas, setMateriasInscritas] = useState(() => {
        try {
            const saved = localStorage.getItem('nautilus_enrolled_subjects');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [allSubjects, setAllSubjects] = useState(dbMaterias);
    const [loading, setLoading] = useState(false);
    const [totalesCarrera] = useState({
        uc: TOTAL_UC_CARRERA || 225,
        materias: TOTAL_MATERIAS_CARRERA || 71
    });

    useEffect(() => {
        localStorage.setItem('nautilus_approved_subjects', JSON.stringify(Array.from(materiasAprobadas)));
    }, [materiasAprobadas]);

    useEffect(() => {
        localStorage.setItem('nautilus_enrolled_subjects', JSON.stringify(materiasInscritas));
    }, [materiasInscritas]);

    const login = (userData = {}) => {
        const name = userData.name || userData.full_name || USER.name;
        const code = (userData.code || userData.student_code || USER.code).toUpperCase();
        const avatar = name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'VJ';

        const sessionData = {
            id: userData.id || 1,
            name,
            full_name: name,
            code,
            student_code: code,
            role: userData.role || (code.includes('ADMIN') ? 'admin' : 'cadete'),
            career: userData.career || userData.career_name || USER.career,
            mencion: userData.mencion || userData.mencion_name || USER.mencion,
            avatar
        };

        sessionStorage.setItem('nautilus_user', JSON.stringify(sessionData));
        setUser(sessionData);
    };

    const logout = () => {
        sessionStorage.removeItem('nautilus_user');
        sessionStorage.removeItem('miumc_session');
        setUser(null);
    };

    const syncGlobalData = (targetUserCode, newRecords) => {
        setMateriasAprobadas(new Set(newRecords));
    };

    const ucAprobadas = useMemo(() => {
        let sum = 0;
        materiasAprobadas.forEach((code) => {
            const subject = dbMaterias.find((s) => s.codigo === code || s.code === code);
            if (subject) sum += subject.uc;
        });
        return sum;
    }, [materiasAprobadas]);

    return (
        <PensumContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                loading,
                materiasAprobadas,
                setMateriasAprobadas,
                materiasInscritas,
                setMateriasInscritas,
                ucAprobadas,
                totalesCarrera,
                allSubjects,
                setAllSubjects,
                syncGlobalData,
                theme,
                setTheme,
                toggleTheme
            }}
        >
            {children}
        </PensumContext.Provider>
    );
};