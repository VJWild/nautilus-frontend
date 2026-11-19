import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import nautilusApi from '../api/nautilusApi';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

// Normaliza los datos de Prisma para que cualquier componente los consuma fácil
const formatUser = (rawUser) => {
    if (!rawUser) return null;

    const fullName = `${rawUser.firstName} ${rawUser.lastName}`.trim();
    const avatar = fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'UM';

    return {
        ...rawUser,
        name: fullName,
        code: rawUser.career?.code
            ? `${rawUser.career.code}-${rawUser.nationalId}`
            : rawUser.nationalId,
        careerName: rawUser.career?.name || '',
        careerCode: rawUser.career?.code || '',
        mentionName: rawUser.mention?.name || null,
        avatar,
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('nautilus_token');
        if (!token) {
            setUser(null);
            setLoadingAuth(false);
            return null;
        }

        try {
            const { data } = await nautilusApi.get('/auth/me');
            const formatted = formatUser(data);
            setUser(formatted);
            return formatted;
        } catch {
            // Token expirado o inválido
            localStorage.removeItem('nautilus_token');
            setUser(null);
            return null;
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    // Hidratar sesión automáticamente al abrir o recargar la app
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Llamar esto desde AuthContainer (login) y Onboarding (register)
    const setSession = async (accessToken) => {
        localStorage.setItem('nautilus_token', accessToken);
        setLoadingAuth(true);
        return await fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem('nautilus_token');
        sessionStorage.removeItem('nautilus_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                loadingAuth,
                setSession,
                refreshProfile: fetchProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};