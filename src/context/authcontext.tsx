'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  getDocs,
  collection, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { Permission, UserRole, UserPermissions, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';
import { signInWithGoogle as googleSignIn } from '../firebase/auth';

interface SessionInfo {
  uid: string;
  email: string;
  is2FAEnabled: boolean;
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  lastLogin: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  requiresAdditionalInfo: boolean;
  role?: UserRole;
  restaurantId?: string;
  permissions?: Permission[];
}

interface AuthContextType {
  usuario: User | null;
  sessionInfo: SessionInfo | null;
  cargando: boolean;
  error: string | null;
  requiere2FA: boolean;
  role: UserRole | null;
  permissions: Permission[];
  iniciarSesion: (email: string, password: string) => Promise<void>;
  iniciarSesionCon2FA: (code: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  enviarCodigoVerificacion: () => Promise<void>;
  reenviarVerificacionEmail: () => Promise<void>;
  restablecerContrasena: (email: string) => Promise<void>;
  actualizarSesion: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  checkRoleLevel: (requiredRole: UserRole) => boolean;
  signInWithGoogle: () => Promise<{ needsProfile: boolean; [key: string]: any }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiere2FA, setRequiere2FA] = useState(false);
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const actualizarSesion = async () => {
    if (!usuario) {
      console.log('No hay usuario, saliendo de actualizarSesion');
      return;
    }

    try {
      const docRef = doc(db, 'sessions', usuario.uid);
      console.log('Buscando sesión para uid:', usuario.uid);
      const docSnap = await getDoc(docRef);

      console.log('Documento de sesión encontrado:', docSnap.exists());
      if (docSnap.exists()) {
        const data = docSnap.data() as SessionInfo;
        console.log('Datos de sesión:', data);
        setSessionInfo(data);
        
        if (data.is2FAEnabled && !data.lastLogin) {
          setRequiere2FA(true);
        }

        if (data.role && Object.values(UserRole).includes(data.role)) {
          setRole(data.role);
          setPermissions(DEFAULT_ROLE_PERMISSIONS[data.role]);
        }
      } else {
        console.log('No se encontró sesión, buscando en Dueño Restaurante');
        const userDocRef = doc(db, 'dueno_restaurante', usuario.email!);
        console.log('Buscando usuario con email:', usuario.email);
        const userDocSnap = await getDoc(userDocRef);
        
        console.log('Documento de usuario encontrado:', userDocSnap.exists());
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('Datos de usuario encontrados:', userData);
          console.log('RestauranteID:', userData.RestauranteID);
          
          const userRole = userData.role as UserRole;
          console.log('Role del usuario:', userRole);
          console.log('Roles válidos:', Object.values(UserRole));

          if (userRole && Object.values(UserRole).includes(userRole)) {
            console.log('Role válido, creando sessionInfo');
            const sessionInfo: SessionInfo = {
              uid: usuario.uid,
              email: usuario.email!,
              is2FAEnabled: userData.is2FAEnabled || false,
              failedAttempts: userData.failedAttempts || 0,
              lastFailedAttempt: userData.lastFailedAttempt || null,
              lastLogin: new Date(),
              emailVerified: usuario.emailVerified,
              requiresAdditionalInfo: userData.requiresAdditionalInfo || false,
              role: userRole,
              restaurantId: userData.RestauranteID,
              permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]
            };
            
            console.log('SessionInfo creado:', sessionInfo);
            setSessionInfo(sessionInfo);
            setRole(userRole);
            setPermissions(userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]);
          } else {
            console.log('Role no válido:', userRole);
          }
        } else {
          console.log('No se encontró documento de usuario');
        }
      }
    } catch (error) {
      console.error('Error completo al actualizar información de sesión:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setCargando(true);
      const result = await googleSignIn();
  
      if (auth.currentUser) {
        setUsuario(auth.currentUser);
        await actualizarSesion();
      }
  
      return result;
    } catch (err) {
      console.error('Error en signInWithGoogle:', err);
      setError('Error al iniciar sesión con Google');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    console.log('Configurando listener de estado de autenticación');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Estado de autenticación cambiado:', user ? user.email : 'No hay usuario');
      setUsuario(user);
      if (!user) {
        setCargando(false);
        return;
      }
      setCargando(false);
    });
        
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!usuario?.uid || !sessionInfo?.restaurantId) return;

    try {
      const q = query(
        collection(db, 'restaurants', sessionInfo.restaurantId, 'userPermissions'),
        where('uid', '==', usuario.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const userPermissions = snapshot.docs[0].data() as UserPermissions;
          if (userPermissions.role) {
            setRole(userPermissions.role);
            
            const basePermissions = DEFAULT_ROLE_PERMISSIONS[userPermissions.role] || [];
            const customPermissions = userPermissions.customPermissions || [];
            const allPermissions = [...new Set([...basePermissions, ...customPermissions])];
            
            setPermissions(allPermissions);
          }
        }
      }, (error) => {
        console.error('Error al observar permisos:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error al configurar observer de permisos:', error);
    }
  }, [usuario?.uid, sessionInfo?.restaurantId]);

  const checkPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const checkRoleLevel = (requiredRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.STAFF]: 1,
      [UserRole.VIEWER]: 0
    };

    return role ? roleHierarchy[role] >= roleHierarchy[requiredRole] : false;
  };

  const iniciarSesion = async (email: string, password: string) => {
    try {
      setError(null);
      setCargando(true);

      // Primero verificamos si el usuario existe y no está bloqueado
      const userDocRef = doc(db, 'dueno_restaurante', email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en el sistema');
      }

      const userData = userDoc.data();
      
      // Verificar bloqueo por intentos fallidos
      if (userData.failedAttempts >= 5 && userData.lastFailedAttempt) {
        const lockoutEnd = new Date(userData.lastFailedAttempt.toDate()).getTime() + (15 * 60 * 1000);
        if (Date.now() < lockoutEnd) {
          throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minutos`);
        }
      }

      // Intentamos la autenticación
      const resultado = await signInWithEmailAndPassword(auth, email, password);

      // Verificar 2FA
      if (userData.is2FAEnabled) {
        setRequiere2FA(true);
        setTempEmail(email);
        setTempPassword(password);
        return;
      }

      // Si no requiere 2FA, actualizamos la sesión
      const userRole = userData.role as UserRole || UserRole.OWNER;
      const sessionInfo: SessionInfo = {
        uid: resultado.user.uid,
        email: email,
        is2FAEnabled: userData.is2FAEnabled || false,
        failedAttempts: 0, // Resetear intentos fallidos al lograr iniciar sesión
        lastFailedAttempt: null,
        lastLogin: new Date(),
        emailVerified: resultado.user.emailVerified,
        requiresAdditionalInfo: userData.requiresAdditionalInfo || false,
        role: userRole,
        restaurantId: userData.RestauranteID,
        permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]
      };

      setUsuario(resultado.user);
      setSessionInfo(sessionInfo);
      setRole(userRole);
      setPermissions(userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]);

    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta.';
      }

      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesionCon2FA = async (code: string) => {
    try {
      setError(null);
      setCargando(true);

      if (!tempEmail || !tempPassword) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }

      if (code.length !== 6) {
        throw new Error('Código inválido');
      }

      await signInWithEmailAndPassword(auth, tempEmail, tempPassword);
      setRequiere2FA(false);
      setTempEmail(null);
      setTempPassword(null);
      await actualizarSesion();

    } catch (err) {
      setError('Código inválido. Por favor, intente nuevamente.');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      setSessionInfo(null);
      setRequiere2FA(false);
      setRole(null);
      setPermissions([]);
    } catch (err) {
      setError('Error al cerrar sesión');
      throw err;
    }
  };

  const enviarCodigoVerificacion = async () => {
    if (!usuario?.phoneNumber) {
      throw new Error('No hay número de teléfono registrado');
    }
    return Promise.resolve();
  };

  const reenviarVerificacionEmail = async () => {
    if (!usuario) {
      throw new Error('No hay usuario autenticado');
    }
    await sendEmailVerification(usuario);
  };

  const restablecerContrasena = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError('Error al enviar el correo de restablecimiento');
      throw err;
    }
  };

  const value = {
    usuario,
    sessionInfo,
    cargando,
    error,
    requiere2FA,
    role,
    permissions,
    iniciarSesion,
    iniciarSesionCon2FA,
    cerrarSesion,
    enviarCodigoVerificacion,
    reenviarVerificacionEmail,
    restablecerContrasena,
    actualizarSesion,
    checkPermission,
    checkRoleLevel,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext; 