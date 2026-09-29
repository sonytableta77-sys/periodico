import React, { useState, useEffect } from 'react';
import {
  authenticateAdmin,
  updateAdminCredentials,
  getLockoutStatus,
  LockoutState
} from '../lib/auth';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, User, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  initialMode?: 'login' | 'change_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'change_password'>(initialMode);
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lockout, setLockout] = useState<LockoutState>({ isLocked: false, remainingSeconds: 0, failedAttempts: 0 });
  // Sincronizar modo inicial y comprobar bloqueo
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      const lockStatus = getLockoutStatus();
      setLockout(lockStatus);
    }
  }, [isOpen, initialMode]);

  // Temporizador para cuenta atrás de bloqueo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockout.isLocked && lockout.remainingSeconds > 0) {
      timer = setInterval(() => {
        setLockout(prev => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, isLocked: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockout.isLocked, lockout.remainingSeconds]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Por favor ingrese el usuario y la contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authenticateAdmin(username, password);
      if (result.success) {
        onLoginSuccess(username.trim());
        onClose();
      } else {
        setErrorMessage(result.error || 'Credenciales inválidas.');
        if (result.lockout) {
          setLockout(result.lockout);
        }
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMessage('Ingrese su contraseña actual.');
      return;
    }
    if (newUsername.trim().length < 3) {
      setErrorMessage('El nuevo usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las nuevas contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await updateAdminCredentials(currentPassword, newUsername, newPassword);
      if (result.success) {
        setSuccessMessage('¡Credenciales actualizadas exitosamente con cifrado seguro!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || 'No se pudieron actualizar las credenciales.');
      }
    } catch {
      setErrorMessage('Error al actualizar las credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-[#f6efe1] text-[#2c1e14] border-2 border-[#543b27] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8"
        style={{
          boxShadow: '0 10px 35px rgba(0,0,0,0.4), inset 0 0 40px rgba(120,80,40,0.08)'
        }}
      >
        {/* Esquinas decorativas de marco antiguo */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#543b27]" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#543b27]" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#543b27]" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#543b27]" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#6f4e34] hover:text-[#2c1e14] p-1 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Editorial */}
        <div className="text-center mb-6 border-b border-[#543b27]/30 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#543b27]/40 bg-[#eedfc5] mb-2 shadow-inner">
            {mode === 'login' ? (
              <KeyRound className="w-6 h-6 text-[#543b27]" />
            ) : (
              <Lock className="w-6 h-6 text-[#543b27]" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#352114] tracking-tight">
            {mode === 'login' ? 'Acceso de Redacción' : 'Seguridad del Administrador'}
          </h2>
          <p className="text-xs font-mono text-[#785b42] uppercase tracking-wider mt-1">
            {mode === 'login' 
              ? 'Autenticación Criptográfica PBKDF2 · SHA-256' 
              : 'Actualización de Credenciales Protegidas'}
          </p>
        </div>

        {/* Alerta de bloqueo por intentos fallidos */}
        {lockout.isLocked && (
          <div className="mb-5 p-3 bg-[#e8c4c4] border border-[#a83232] text-[#6b1414] text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#a83232]" />
            <span>
              Acceso bloqueado por seguridad tras varios intentos fallidos. Intente de nuevo en{' '}
              <strong className="font-mono">{lockout.remainingSeconds}s</strong>.
            </span>
          </div>
        )}

        {/* Mensajes de error o éxito */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#eed9c4] border-l-3 border-[#9c412b] text-[#5c2112] text-xs">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#d5e8d4] border-l-3 border-[#2e7d32] text-[#1b5e20] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Pestañas / Selector de modo */}
        <div className="flex border-b border-[#543b27]/25 mb-5 text-xs font-serif">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-center font-bold tracking-wide transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-[#543b27] text-[#2c1e14] bg-[#543b27]/5'
                : 'text-[#85654d] hover:text-[#352114]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('change_password'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-center font-bold tracking-wide transition-colors ${
              mode === 'change_password'
                ? 'border-b-2 border-[#543b27] text-[#2c1e14] bg-[#543b27]/5'
                : 'text-[#85654d] hover:text-[#352114]'
            }`}
          >
            Cambiar Contraseña
          </button>
        </div>

        {/* FORMULARIO LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Usuario Administrador
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={lockout.isLocked || isLoading}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-sm font-typewriter focus:ring-1 focus:ring-[#543b27] focus:border-[#543b27] outline-none disabled:opacity-50"
                  autoComplete="username"
                  autoFocus
                />
                <User className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8a6a50]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Contraseña Secreta
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={lockout.isLocked || isLoading}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-sm font-typewriter focus:ring-1 focus:ring-[#543b27] focus:border-[#543b27] outline-none disabled:opacity-50"
                  autoComplete="current-password"
                />
                <KeyRound className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8a6a50]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#8a6a50] hover:text-[#453020]"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockout.isLocked || isLoading}
              className="w-full py-2.5 bg-[#422d1d] hover:bg-[#2c1e14] text-[#f7efe1] font-serif font-bold tracking-widest uppercase text-xs border border-[#2b1c11] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isLoading ? 'Verificando Criptografía...' : 'Desbloquear Máquina de Escribir'}
            </button>
          </form>
        )}

        {/* FORMULARIO CAMBIO DE CONTRASEÑA */}
        {mode === 'change_password' && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingrese contraseña actual"
                className="w-full px-3 py-1.5 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-xs font-typewriter focus:ring-1 focus:ring-[#543b27] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Nuevo Nombre de Usuario
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ej. editor_jefe"
                className="w-full px-3 py-1.5 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-xs font-typewriter focus:ring-1 focus:ring-[#543b27] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 pr-9 py-1.5 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-xs font-typewriter focus:ring-1 focus:ring-[#543b27] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2 text-[#8a6a50]"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#453020] uppercase tracking-wider mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full px-3 py-1.5 bg-[#fdfaf3] border border-[#7a583e] text-[#2c1e14] text-xs font-typewriter focus:ring-1 focus:ring-[#543b27] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-[#422d1d] hover:bg-[#2c1e14] text-[#f7efe1] font-serif font-bold tracking-widest uppercase text-xs border border-[#2b1c11] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Guardando Nueva Clave...' : 'Guardar Nuevas Credenciales'}
            </button>
          </form>
        )}

        {/* Pie de seguridad */}
        <div className="mt-5 pt-3 border-t border-[#543b27]/20 text-[10px] text-center text-[#785b42] font-mono">
          Cifrado local PBKDF2-HMAC-SHA256 con Salt aleatorio y protección anti-fuerza bruta.
        </div>
      </div>
    </div>
  );
};
