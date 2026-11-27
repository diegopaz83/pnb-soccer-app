import React, { useState } from 'react';
import { Shield, Eye, Check, X, Lock, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminSelect = () => {
    if (currentRole === 'admin') {
      onClose();
      return;
    }
    setShowPasswordPrompt(true);
    setErrorMsg('');
  };

  const handleConfirmAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '0425') {
      onSelectRole('admin');
      setShowPasswordPrompt(false);
      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg('Contraseña incorrecta. (Clave técnica: 0425)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-slate-900 text-lg">
            Seleccionar Rol de Acceso
          </h3>
          <button
            onClick={() => {
              setShowPasswordPrompt(false);
              setPasswordInput('');
              setErrorMsg('');
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          La escuela de fútbol <strong>PF SOCCER</strong> cuenta con dos perfiles de usuario:
        </p>

        {/* Password Prompt if attempting to enter Admin */}
        {showPasswordPrompt ? (
          <form onSubmit={handleConfirmAdminPassword} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Dame la contraseña</span>
            </div>
            <p className="text-xs text-slate-500">
              Ingresa la contraseña para activar el modo Administrador:
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Contraseña..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-800 font-medium"
              autoFocus
            />
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput('');
                  setErrorMsg('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                Ingresar
              </button>
            </div>
          </form>
        ) : (
          /* Role options cards */
          <div className="space-y-3">
            
            {/* Admin */}
            <div
              onClick={handleAdminSelect}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-100'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                      Administrador (DT / Director)
                      {currentRole === 'admin' && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Activo
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Control total: organizar los 2 equipos, mover jugadores en la cancha táctica, registrar goles (+/-), gestionar plantel confidencial y temporadas. Requiere clave (0425).
                    </p>
                  </div>
                </div>
                {currentRole === 'admin' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* Visor */}
            <div
              onClick={() => {
                onSelectRole('visor');
                onClose();
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                currentRole === 'visor'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                      Visor (Jugadores / Familias)
                      {currentRole === 'visor' && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Activo
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Modo consulta seguro: ver la alineación convocada para el fin de semana, consultar la tabla de goleadores y el historial. Datos privados del plantel quedan protegidos.
                    </p>
                  </div>
                </div>
                {currentRole === 'visor' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
