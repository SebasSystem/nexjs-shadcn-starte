'use client';

import { createContext } from 'react';
import { AuthContextValue } from 'src/shared/auth/types';

// Contexto vacío por defecto
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
