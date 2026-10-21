import React, { useState } from 'react';
import { Lock, Shield, Key, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audioEffects';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = localStorage.getItem('fluent_immersion_admin_password') || '123456';

    if (password === storedPwd) {
      setErrorMsg('');
      setPassword('');
      sounds.playSuccess();
      onSuccess();
    } else {
      sounds.playRetry();
      setErrorMsg('Senha incorreta! Digite a senha cadastrada pelo Teacher Marcelo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0b1b3d] to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Área do Professor • Teacher Marcelo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acesso administrativo restrito à gestão de alunos, emissão de boletins e criação de aulas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              Senha Mestra do Professor
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Digite sua senha..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 mt-1.5 animate-shake">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition"
          >
            <Shield className="w-4 h-4" />
            <span>Acessar Painel do Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-800 dark:text-purple-300 text-center">
          Dica: A senha inicial padrão é <strong>123456</strong> (você pode alterá-la na aba Segurança do painel).
        </div>
      </div>
    </div>
  );
};
