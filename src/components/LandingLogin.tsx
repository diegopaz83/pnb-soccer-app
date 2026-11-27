import React, { useState } from 'react';
import { Shield, Users, Lock, X, ArrowRight, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LandingLoginProps {
  onLogin: (role: UserRole, userHandle: string) => void;
}

export const LandingLogin: React.FC<LandingLoginProps> = ({ onLogin }) => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '0425') {
      setErrorMsg('');
      setIsAdminModalOpen(false);
      onLogin('admin', 'Administrador');
    } else {
      setErrorMsg('Contraseña incorrecta');
    }
  };

  const handleJugadorClick = () => {
    onLogin('visor', 'Jugador');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col justify-between p-6 sm:p-10 selection:bg-emerald-100">
      
      {/* Top Brand Bar */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs font-display font-black text-lg">
            PF
          </div>
          <div>
            <h1 className="font-display font-black tracking-tight text-slate-900 text-lg leading-tight">
              PF SOCCER
            </h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              12 vs 12 Táctico
            </span>
          </div>
        </div>
      </header>

      {/* Center Pure & Clean Two-Button Gateway */}
      <main className="max-w-md mx-auto w-full my-auto py-12 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Bienvenido
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Selecciona tu perfil para ingresar
          </p>
        </div>

        {/* The Two Pure Buttons */}
        <div className="space-y-3 pt-2">
          
          {/* Button 1: Jugador (Direct Entry) */}
          <button
            type="button"
            id="landing-btn-jugador"
            onClick={handleJugadorClick}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-bold text-base shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/40 flex items-center justify-center text-white shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block font-black text-white leading-tight">
                  Soy Jugador
                </span>
                <span className="block text-xs text-emerald-100 font-medium">
                  Ver alineación, cancha y goleadores
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 2: Administrador (Opens Password Modal) */}
          <button
            type="button"
            id="landing-btn-admin"
            onClick={() => {
              setPassword('');
              setErrorMsg('');
              setIsAdminModalOpen(true);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-display font-bold text-base border border-slate-200 shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Shield className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-900 leading-tight">
                  Soy Administrador
                </span>
                <span className="block text-xs text-slate-500 font-medium">
                  Gestión técnica, cambios y goles
                </span>
              </div>
            </div>
            <Lock className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-slate-400">
        PF SOCCER • Sistema Oficial
      </footer>

      {/* Clean Modal: "Dame la contraseña" */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-slate-900">
                  Dame la contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Escribe la clave..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="submit-admin-password-btn"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                >
                  Ingresar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
