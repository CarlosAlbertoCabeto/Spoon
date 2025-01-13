// usuarios.types.ts
interface Usuario {
  id: string;
  restauranteId: string;
  grupoId?: string;            // Para cadenas de restaurantes
  informacionPersonal: {
      nombre: string;
      apellido: string;
      email: string;
      telefono?: string;
      documento?: {
          tipo: 'dni' | 'pasaporte' | 'otro';
          numero: string;
      };
  };
  acceso: {
      rolId: string;
      permisosPersonalizados?: string[];
      ultimoAcceso: Timestamp;
      intentosFallidos: number;
      estado: 'activo' | 'inactivo' | 'bloqueado' | 'pendiente';
      requiereCambioPassword: boolean;
  };
  configuracion: {
      idioma: string;
      tema: 'claro' | 'oscuro' | 'sistema';
      notificaciones: {
          email: boolean;
          push: boolean;
          sms: boolean;
      };
  };
  metadata: {
      creadoPor: string;
      fechaCreacion: Timestamp;
      modificadoPor: string;
      fechaModificacion: Timestamp;
      versionRegistro: number;
  };
}

// roles.types.ts
interface Rol {
  id: string;
  restauranteId: string;
  nombre: string;
  descripcion: string;
  nivel: number;              // Para jerarquía
  permisos: {
      [modulo: string]: {
          crear: boolean;
          leer: boolean;
          actualizar: boolean;
          eliminar: boolean;
          permisos_especiales?: string[];
      };
  };
  restricciones: {
      horarioAcceso?: {
          inicio: string;
          fin: string;
          dias: string[];
      };
      limitacionesModulo?: {
          [modulo: string]: {
              maxRegistros?: number;
              maxValor?: number;
              restriccionesEspecificas?: any;
          };
      };
  };
  heredaDeRol?: string;      // Para herencia de permisos
  metadata: {
      creado: Timestamp;
      modificado: Timestamp;
      version: number;
  };
}

// sesiones.types.ts
interface SesionUsuario {
  id: string;
  usuarioId: string;
  restauranteId: string;
  inicioSesion: Timestamp;
  ultimaActividad: Timestamp;
  finSesion?: Timestamp;
  dispositivo: {
      tipo: string;
      navegador: string;
      sistema: string;
      ip: string;
  };
  actividad: {
      modulos: string[];
      acciones: {
          timestamp: Timestamp;
          modulo: string;
          accion: string;
          detalles?: any;
      }[];
  };
  estado: 'activa' | 'cerrada' | 'expirada' | 'forzada';
}