import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import nautilusApi from '../api/nautilusApi';
import { useAuth } from './AuthContext';

const PensumContext = createContext(null);

export const usePensum = () => {
    const context = useContext(PensumContext);
    if (!context) {
        throw new Error('usePensum debe usarse dentro de un PensumProvider');
    }
    return context;
};

export const PensumProvider = ({ children }) => {
    const { user, loadingAuth, logout } = useAuth();

    // 2. Estado académico real desde PostgreSQL
    const [allSubjects, setAllSubjects] = useState([]);
    const [materiasAprobadas, setMateriasAprobadas] = useState(new Set());
    const [materiasInscritas, setMateriasInscritas] = useState([]);
    const [totalesCarrera, setTotalesCarrera] = useState({ uc: 0, materias: 0 });
    const [loadingCatalog, setLoadingCatalog] = useState(false);

    // 3. Cargar catálogo y sincronizar materias aprobadas cuando cambie el usuario
    useEffect(() => {
        if (!user?.careerCode) {
            setAllSubjects([]);
            setMateriasAprobadas(new Set());
            setMateriasInscritas([]);
            setTotalesCarrera({ uc: 0, materias: 0 });
            return;
        }

        // Extraer códigos de materias aprobadas desde el perfil (/auth/me)
        const passedCodes = (user.academicRecords || [])
            .filter((record) => record.status === 'PASSED' && record.subject?.code)
            .map((record) => record.subject.code);
        setMateriasAprobadas(new Set(passedCodes));

        // Consultar el catálogo oficial de la carrera
        const fetchCatalog = async () => {
            setLoadingCatalog(true);
            try {
                const { data } = await nautilusApi.get(`/careers/${user.careerCode}/catalog`);

                // Filtrar las materias que aplican al estudiante (tronco común + su mención)
                const userSubjects = (data.subjects || []).filter(
                    (s) => s.mentionId === null || s.mentionId === user.mentionId
                );

                setAllSubjects(userSubjects);
                setTotalesCarrera({
                    uc: data.career?.totalCredits || 0,
                    materias: userSubjects.length,
                });
            } catch (error) {
                console.error('Error cargando el catálogo de la carrera:', error);
            } finally {
                setLoadingCatalog(false);
            }
        };

        fetchCatalog();
    }, [user]);

    // 4. Cálculo reactivo de UC aprobadas usando los créditos reales de la BD
    const ucAprobadas = useMemo(() => {
        let sum = 0;
        materiasAprobadas.forEach((code) => {
            const subject = allSubjects.find((s) => s.code === code);
            if (subject) sum += subject.credits;
        });
        return sum;
    }, [materiasAprobadas, allSubjects]);

    // 5. Cálculo del índice académico (null si solo tiene materias históricas sin nota)
    const indiceAcademico = useMemo(() => {
        const gradedRecords = (user?.academicRecords || []).filter(
            (r) => r.finalGrade !== null && r.finalGrade !== undefined
        );
        if (gradedRecords.length === 0) return null;

        const total = gradedRecords.reduce((acc, r) => acc + Number(r.finalGrade), 0);
        return (total / gradedRecords.length).toFixed(2);
    }, [user]);

    const syncGlobalData = (_targetUserCode, newRecords) => {
        setMateriasAprobadas(new Set(newRecords));
    };

    return (
        <PensumContext.Provider
            value={{
                // Puente temporal con AuthContext para no romper otras vistas
                user,
                logout,
                // Datos académicos reales
                loading: loadingAuth || loadingCatalog,
                allSubjects,
                setAllSubjects,
                materiasAprobadas,
                setMateriasAprobadas,
                materiasInscritas,
                setMateriasInscritas,
                ucAprobadas,
                indiceAcademico,
                totalesCarrera,
                syncGlobalData,
            }}
        >
            {children}
        </PensumContext.Provider>
    );
};