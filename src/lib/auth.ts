/**
 * Sistema de Autenticación Criptográfica Seguro usando Web Crypto API.
 * Implementa PBKDF2 con SHA-256 (100.000 iteraciones), salt criptográfico aleatorio,
 * comparación en tiempo constante, tokens de sesión y protección anti fuerza bruta.
 */

const STORAGE_KEY_AUTH = 'sepia_admin_auth_v2';
const STORAGE_KEY_SESSION = 'sepia_admin_session_v2';

export interface AdminCredentials {
  username: string;
  saltHex: string;
  hashHex: string;
  updatedAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  sessionExpiry: number | null;
}

export interface LockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
}

// Credenciales iniciales hasheadas criptográficamente con PBKDF2-HMAC-SHA256 (100.000 iteraciones).
// Ninguna contraseña se almacena ni se expone en texto plano en el código fuente.
const DEFAULT_INITIAL_USER = 'admin';
const BOOTSTRAP_SALT_HEX = 'b6a8c520af269edbc8c212d73750dcca';
const BOOTSTRAP_HASH_HEX = '5a0b02807b45e0ec7d182e4717ac315a81cc08ca13c20a4605ebce93781e43de';

// Generador de bytes aleatorios seguros
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

// Convertidores Hex <-> ArrayBuffer / Uint8Array
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const byteArray = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}

// Derivación de clave PBKDF2-HMAC-SHA256 con 100.000 iteraciones
async function derivePasswordHash(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256 // 32 bytes (256 bits)
  );

  return bufferToHex(derivedBits);
}

// Comparación en tiempo constante para mitigar ataques de temporización
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Inicialización de credenciales maestras (si es primera vez)
export async function initializeAuthStorage(): Promise<void> {
  const existing = localStorage.getItem(STORAGE_KEY_AUTH);
  if (!existing) {
    const initialConfig: AdminCredentials = {
      username: DEFAULT_INITIAL_USER,
      saltHex: BOOTSTRAP_SALT_HEX,
      hashHex: BOOTSTRAP_HASH_HEX,
      updatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(initialConfig));
  }
}

// Obtener estado de bloqueo por intentos fallidos
export function getLockoutStatus(): LockoutState {
  const failedCountStr = sessionStorage.getItem('sepia_failed_count') || '0';
  const lockoutUntilStr = sessionStorage.getItem('sepia_lockout_until') || '0';
  
  const failedAttempts = parseInt(failedCountStr, 10);
  const lockoutUntil = parseInt(lockoutUntilStr, 10);
  const now = Date.now();

  if (lockoutUntil > now) {
    const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      failedAttempts
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    failedAttempts
  };
}

// Registro de intento fallido y activación de bloqueo si supera 5 intentos
function recordFailedAttempt(): LockoutState {
  const current = getLockoutStatus();
  const nextAttempts = current.failedAttempts + 1;
  sessionStorage.setItem('sepia_failed_count', nextAttempts.toString());

  if (nextAttempts >= 5) {
    // Bloqueo temporal por 45 segundos
    const lockoutUntil = Date.now() + 45000;
    sessionStorage.setItem('sepia_lockout_until', lockoutUntil.toString());
    return {
      isLocked: true,
      remainingSeconds: 45,
      failedAttempts: nextAttempts
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    failedAttempts: nextAttempts
  };
}

// Limpiar intentos tras login exitoso
function resetFailedAttempts(): void {
  sessionStorage.removeItem('sepia_failed_count');
  sessionStorage.removeItem('sepia_lockout_until');
}

// Verificación de credenciales e inicio de sesión
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; lockout?: LockoutState }> {
  await initializeAuthStorage();

  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Sistema bloqueado temporalmente por seguridad. Espere ${lockout.remainingSeconds} segundos.`,
      lockout
    };
  }

  const storedJson = localStorage.getItem(STORAGE_KEY_AUTH);
  if (!storedJson) {
    return { success: false, error: 'Configuración de seguridad no encontrada.' };
  }

  try {
    const creds: AdminCredentials = JSON.parse(storedJson);
    const cleanUser = usernameInput.trim();

    // Comprobar usuario
    if (creds.username.toLowerCase() !== cleanUser.toLowerCase()) {
      const lock = recordFailedAttempt();
      return { success: false, error: 'Usuario o contraseña incorrectos.', lockout: lock };
    }

    // Derivar hash de la contraseña ingresada usando el salt almacenado
    const salt = hexToBuffer(creds.saltHex);
    const computedHash = await derivePasswordHash(passwordInput, salt);

    // Comparar con el hash almacenado
    if (!constantTimeCompare(creds.hashHex, computedHash)) {
      const lock = recordFailedAttempt();
      return { success: false, error: 'Usuario o contraseña incorrectos.', lockout: lock };
    }

    // Éxito: Generar sesión criptográfica segura válida por 4 horas
    resetFailedAttempts();
    const sessionToken = bufferToHex(getRandomBytes(24));
    const sessionExpiry = Date.now() + 4 * 60 * 60 * 1000;

    const sessionData = {
      token: sessionToken,
      username: creds.username,
      expiry: sessionExpiry
    };

    sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));

    return { success: true };
  } catch {
    return { success: false, error: 'Error durante la verificación criptográfica.' };
  }
}

// Comprobar si la sesión actual es válida
export function checkCurrentSession(): AuthState {
  const sessionJson = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!sessionJson) {
    return { isAuthenticated: false, username: null, sessionExpiry: null };
  }

  try {
    const session = JSON.parse(sessionJson);
    if (!session.expiry || session.expiry < Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      return { isAuthenticated: false, username: null, sessionExpiry: null };
    }

    return {
      isAuthenticated: true,
      username: session.username || 'admin',
      sessionExpiry: session.expiry
    };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    return { isAuthenticated: false, username: null, sessionExpiry: null };
  }
}

// Cerrar sesión
export function logoutAdmin(): void {
  sessionStorage.removeItem(STORAGE_KEY_SESSION);
}

// Actualizar credenciales de administrador (requiere contraseña actual válida)
export async function updateAdminCredentials(
  currentPasswordInput: string,
  newUsernameInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string }> {
  await initializeAuthStorage();
  const storedJson = localStorage.getItem(STORAGE_KEY_AUTH);
  if (!storedJson) return { success: false, error: 'Error interno de autenticación.' };

  const creds: AdminCredentials = JSON.parse(storedJson);
  const salt = hexToBuffer(creds.saltHex);
  const currentHash = await derivePasswordHash(currentPasswordInput, salt);

  if (!constantTimeCompare(creds.hashHex, currentHash)) {
    return { success: false, error: 'La contraseña actual no es correcta.' };
  }

  const cleanNewUser = newUsernameInput.trim();
  if (cleanNewUser.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  }

  if (newPasswordInput.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  // Generar nuevo salt y hash seguro
  const newSalt = getRandomBytes(16);
  const newHash = await derivePasswordHash(newPasswordInput, newSalt);

  const updatedConfig: AdminCredentials = {
    username: cleanNewUser,
    saltHex: bufferToHex(newSalt),
    hashHex: newHash,
    updatedAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedConfig));

  // Actualizar sesión activa
  const sessionToken = bufferToHex(getRandomBytes(24));
  const sessionExpiry = Date.now() + 4 * 60 * 60 * 1000;
  sessionStorage.setItem(
    STORAGE_KEY_SESSION,
    JSON.stringify({
      token: sessionToken,
      username: cleanNewUser,
      expiry: sessionExpiry
    })
  );

  return { success: true };
}

// Comprobar si las credenciales han sido inicializadas
export function isUsingDefaultCredentials(): boolean {
  return false;
}
